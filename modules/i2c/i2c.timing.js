import { renderDigitalTiming } from "../../core/timing.js";
import { currentCell, clamp } from "../../core/app.js";

function parseHex(s, fallback=0){
  try{
    const t = String(s).trim().toLowerCase();
    const v = parseInt(t.startsWith("0x")? t.slice(2):t, 16);
    if(Number.isFinite(v)) return v;
  }catch{}
  return fallback;
}
function bitsMSB(byte){
  return Array.from({length:8}, (_,i)=> (byte>>(7-i))&1);
}

export function renderI2cTiming(App, svgEl, hintEl){
  const st = App.state.i2c;
  const addr = clamp(parseHex(st.addr, 0x3C), 0, 0x7F);
  const rw = (parseInt(st.rw,10) || 0) & 1;
  const data = clamp(parseHex(st.data, 0xA0), 0, 0xFF);
  const ackBit = (st.ack==="ack") ? 0 : 1;

  // 2 samples per bit: SCL low/high; SDA stable during high (ideal)
  const scl=[], sda=[];
  const pushIdle = (n)=>{ for(let i=0;i<n;i++){ scl.push(1); sda.push(1); } };
  const pushStart = ()=>{
    scl.push(1); sda.push(1);
    scl.push(1); sda.push(0);
  };
  const pushStop = ()=>{
    scl.push(1); sda.push(0);
    scl.push(1); sda.push(1);
  };
  const pushBit = (b)=>{
    scl.push(0); sda.push(b);
    scl.push(1); sda.push(b);
  };

  pushIdle(4);
  pushStart();

  const addrByte = ((addr<<1) | rw) & 0xFF;
  bitsMSB(addrByte).forEach(pushBit);
  pushBit(ackBit); // ACK1
  bitsMSB(data).forEach(pushBit);
  pushBit(ackBit); // ACK2

  pushStop();
  pushIdle(4);

  const cells = scl.length;

  // segments (rough indices)
  const idle0 = 0;
  const startSeg = 4;
  const addrSeg = startSeg+2;         // after start 2 cells
  const addrEnd = addrSeg + 16;       // 8 bits * 2
  const ack1S  = addrEnd;
  const ack1E  = ack1S + 2;
  const dataS  = ack1E;
  const dataE  = dataS + 16;
  const ack2S  = dataE;
  const ack2E  = ack2S + 2;
  const stopS  = ack2E;
  const stopE  = stopS + 2;

  const segs = [
    { start: idle0, end: startSeg, label:"IDLE", color:"rgba(255,255,255,.10)" },
    { start: startSeg, end: addrSeg, label:"START", color:"rgba(255,110,138,.65)" },
    { start: addrSeg, end: addrEnd, label:"ADDR+R/W", color:"rgba(110,168,255,.65)" },
    { start: ack1S, end: ack1E, label:"ACK", color:"rgba(69,212,131,.65)" },
    { start: dataS, end: dataE, label:"DATA", color:"rgba(110,168,255,.45)" },
    { start: ack2S, end: ack2E, label:"ACK", color:"rgba(69,212,131,.65)" },
    { start: stopS, end: stopE, label:"STOP", color:"rgba(255,110,138,.45)" },
  ].filter(s=> s.end <= cells);

  renderDigitalTiming(svgEl, [
    { name:"SCL", levels:scl, stroke:"var(--accent)" },
    { name:"SDA", levels:sda, stroke:"var(--ok)" },
  ], { width:1200, height:360, cells, rowH:92, progress: App.progress, segments: segs });

  const idx = currentCell(cells);
  hintEl.innerHTML =
    `地址 <span class="tag">0x${addr.toString(16).toUpperCase()}</span> ` +
    `R/W <span class="tag">${rw}</span> ` +
    `数据 <span class="tag">0x${data.toString(16).toUpperCase().padStart(2,"0")}</span> ` +
    `ACK <span class="tag">${ackBit? "NACK":"ACK"}</span> ` +
    `当前格 <span class="tag">#${idx}</span>`;
}
