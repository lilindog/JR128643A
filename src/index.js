/**
 * 吉润12864 oled 串口屏操作类 
 * 使用uart连接
 * 厂家产品详情 https://www.jroled.com/productinfo/221445.html
 */

 const SP = require("serialport");
 const iconv = require("iconv-lite");

 module.exports = class JR128643A {

    /**
     * 可选字号 
     * 详见吉润文档
     */
    static fontSizes = {
        1: 0x31,
        2: 0x32,
        3: 0x33,
        4: 0x34
    }

     /**
      * 各种字号的宽高 
      * 详见吉润协议文档
      */
     static fontSizeMap = {
        [Object.keys(JR128643A.fontSizes)[0]]: 12,
        [Object.keys(JR128643A.fontSizes)[1]]: 16,
        [Object.keys(JR128643A.fontSizes)[2]]: 24,
        [Object.keys(JR128643A.fontSizes)[3]]: 32,
     }
     static commandHeader = [0xfe, 0xfd];
     static commandEnd = [0xdd, 0xcc, 0xbb, 0xaa];
     static defaultBaudRate = 115200;
     static defaultEncoding = "GB2312";
     static height = 64;
     static width = 128;
     constructor ({ path, baudRate  = JR128643A.defaultBaudRate }) {
        this.path = path, this.baudRate = baudRate;
        this._buf = Buffer.alloc(0);
        this._cbs = [];
        this._sp = new SP(path, { baudRate });
        this._spWriteClone = this._sp.write.bind(this._sp);
        this._sp.write = (hexs, hasRes = false ) => {
            return new Promise((resolve, reject) => {
                hasRes && this._cbs.push(data => resolve(data));
                this._spWriteClone(Buffer.from([...JR128643A.commandHeader, ...hexs, ...JR128643A.commandEnd]), this.defaultEncoding, err => {
                    if (err) {
                        hasRes && this._cbs.shift();
                        reject(err);
                        return;
                    }
                    if (!hasRes) resolve(this);
                });
            });
        }
        this._sp.on("data", data => {
            this._cbs.length && this._cbs.shift()(data);
        });
     }

     /**
      * 计算字符点数
      * 
      * @param  {Array} text
      * @return {Number} 
      */
     _computeTextDot (texts = [], size = Object.keys(JR128643A.fontSizes)[0]) {
        let len = 0;
        texts.forEach(text => {
            const 
            halfAngle = text.match(/[\x00-\xff]/g),
            fullAngle = text.match(/^[\x00-\xff]/g);
            len += halfAngle ? halfAngle.length * JR128643A.fontSizeMap[size] / 2 : 0;
            len += fullAngle ? fullAngle.length * JR128643A.fontSizeMap[size] : 0;
        });
        return Math.floor(len);
     }

     /**
      * 握手，主要用于检测屏幕是否有响应 
      * 
      * @return {Boolean}
      */
     async handShake () {
        const res = await this._sp.write([0x11, 0x00, 0x00], true);
        return res[0] === 0x01 && res[1] === 0x0a;
     }

     /**
      * 清屏 
      */
     async clearScreen () {
        return await this._sp.write([0x22, 0x00, 0x00]);
     }

     /**
      * 写入表格 
      * 
      * @param  {Array} table
      * @return {JR128643A}
      */
    async table (table = [[]], size = Object.keys(JR128643A.fontSizes)[0]) {
        if (table.length * JR128643A.fontSizeMap[size] > JR128643A.height) throw `行数溢出! 当前size建议行数：${Math.floor(JR128643A.height / JR128643A.fontSizeMap[size])} 行！`;
        table.forEach((row, rowIndex) => {
            const y = rowIndex * JR128643A.fontSizeMap[size], cellDot = JR128643A.width / row.length;
            row.forEach((text, textIndex) => {
                const textBuf = iconv.encode(text, JR128643A.defaultEncoding);
                const hexs = [
                    JR128643A.fontSizes[size], 
                    textBuf.byteLength + 4 >> 8, textBuf.byteLength + 4, 
                    cellDot * textIndex >> 8, cellDot * textIndex,
                    y >> 8, y,
                    ...textBuf
                ];
                this._sp.write(hexs);
            });
        });
    }

    /**
     * 写入文字, 过长自动换行
     */
    async text (text = "", size = Object.keys(JR128643A.fontSizes)[0]) {
        let buf = iconv.encode(text, JR128643A.defaultEncoding);
        return await this._sp.write([JR128643A.fontSizes[size], buf.byteLength + 4 >> 8, buf.byteLength + 4, 0x00, 0x00, 0x00, 0x00, ...buf]);
    }
}