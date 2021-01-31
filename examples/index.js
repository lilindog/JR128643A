const JR128643A = require("../src/index");

const jr = new JR128643A({ path: "COM5" });

!async function () {
    
    while (true) {
    await jr.clearScreen();
    await jr.table([
        ["cpu使用率:", "    24%"],
        ["cpu空闲:", "    28%"],
        ["内存使用:", "    50%"],
        ["内存空闲:", "    50%"],
    ]);
    await sleep(2000);
    await jr.clearScreen();
    await jr.text("您当前的IP无法定位到具体城市，建议使用“城市名称+天气”重新搜索");
    await sleep(2000);
}

    // setInterval(() => {
    //     jr.clearScreen();
    //     let 
    //     d = new Date(),
    //     str = d.getFullYear() + "-";
    //     str += (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) + "-";
    //     str += (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + " ";
    //     str += (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":";
    //     str += (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) + ":";
    //     str += d.getSeconds() <10 ? "0" + d.getSeconds() : d.getSeconds();
    //     jr.text("现在时间:         " + str);
    // }, 1000);

}();


async function sleep (ms) {
    await new Promise(r => {
        setTimeout(() => {
            r();
        }, ms)
    })
}