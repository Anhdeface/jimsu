import * as ctl from "./controller.mjs"

await ctl.createHeard(2,1958536577091095);
await ctl.createHeard(2,16684193843567610);
const res = await ctl.getHistory(2);
res.forEach(row=>{
    console.log(` ID : ${row.id}`);
    console.log(` ID USER : ${row.id_user}`);
    console.log(` ID SONG : ${row.id_songs}`);
});