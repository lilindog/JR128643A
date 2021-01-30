const JR128643A = require("../src/index");

const jr = new JR128643A({ path: "COM5" });

!async function () {
    
    console.log(await jr.handShake());
    console.log(await jr.clearScreen());
    console.log(await jr.text("hello lilindog!"));
    await sleep(1000);

    setInterval(() => {
        jr.clearScreen();
        let 
        d = new Date(),
        str = d.getFullYear() + "-";
        str += (d.getMonth() + 1 < 10 ? "0" + (d.getMonth() + 1) : d.getMonth() + 1) + "-";
        str += (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) + " ";
        str += (d.getHours() < 10 ? "0" + d.getHours() : d.getHours()) + ":";
        str += (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes()) + ":";
        str += d.getSeconds() <10 ? "0" + d.getSeconds() : d.getSeconds();
        jr.text(str);
    }, 1000);

}();


async function sleep (ms) {
    await new Promise(r => {
        setTimeout(() => {
            r();
        }, ms)
    })
}