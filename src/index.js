/**
 * 吉润12864 oled 串口屏操作类 
 * 使用uart连接
 * 厂家产品详情 https://www.jroled.com/productinfo/221445.html
 */

 const SP = require("serialport");
 const iconv = require("iconv-lite");

 module.exports = class JR128643A {
     static fontSizes = {
        1: 0x31,
        2: 0x32,
        3: 0x33,
        4: 0x34
     }
     static commandHeader = [0xfe, 0xfd];
     static commandEnd = [0xdd, 0xcc, 0xbb, 0xaa];
     static defaultBaudRate = 115200;
     static defaultEncoding = "utf8";
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
      * 握手，主要用于检测屏幕是否有响应 
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
      * 写入文字, 过长自动换行
      */
     async text (text = "", size = JR128643A.fontSizes[1]) {
        let buf = iconv.encode(text, JR128643A.defaultEncoding);
        return await this._sp.write([size, buf.byteLength + 4 >> 8, buf.byteLength + 4, 0x00, 0x00, 0x00, 0x00, ...buf]);
     }
 }