import { renderDigitalTiming } from "../../core/timing.js";
import { currentCell, clamp } from "../../core/app.js";

function parseHex(s, fallback=0xA5){
  try{
    const t = String(s).trim().toLowerCase();
    const v = parseInt(t.startsWith("0x") ? t.slice(2) : t, 16);
    if(Number.isFinite(v)) return clamp(v,0,0x1FF);
  }catch{}
  return fallback;
}
function bitsLSB_n(val, n){
  return Array.from({length:n}, (_,i)=> (val>>i)&1);
}
function parityBit(bits, mode){
  if(mode==="N") return null;
  const ones = bits.reduce((a,b)=>a+(b?1:0),0);
  if(mode==="E") return (ones % 2);        // even parity: parity = ones%2 (so total even)
  if(mode==="O") return (ones % 2) ? 0 : 1;
  return null;
}

export function renderUartTiming(App, svgEl, hintEl){
  const st = App.state.uart;

  const dataBits = clamp(parseInt(st.dataBits,10) || 8, 5, 9);
  const dataVal  = parseHex(st.data, 0xA5) & ((1<<dataBits)-1);

  const bits = bitsLSB_n(dataVal, dataBits);
  const p = parityBit(bits, st.parity);

  const levels = [];
  // idle padding
  for(let i=0;i<6;i++) levels.push(1);

  const startAt = levels.length;
  levels.push(0); // START

  const dataStart = levels.length;
  levels.push(...bits);

  let parityStart = -1;
  if(p !== null){
    parityStart = levels.length;
    levels.push(p);
  }

  const stopStart = levels.length;
  const stopLen = (st.stopBits===2) ? 2 : (st.stopBits===1.5 ? 2 : 1);
  for(let i=0;i<stopLen;i++) levels.push(1);

  // tail idle
  for(let i=0;i<4;i++) levels.push(1);

  const segs = [];
  segs.push({ start:0, end:startAt, label:"IDLE",  color:"rgba(255,255,255,.10)" });
  segs.push({ start:startAt, end:startAt+1, label:"START", color:"rgba(255,110,138,.65)" });
  segs.push({ start:dataStart, end:dataStart+dataBits, label:`DATA(${dataBits})`, color:"rgba(110,168,255,.65)" });
  if(parityStart>=0) segs.push({ start:parityStart, end:parityStart+1, label:"PARITY", color:"rgba(69,212,131,.55)" });
  segs.push({ start:stopStart, end:stopStart+stopLen, label:`STOP(${st.stopBits})`, color:"rgba(69,212,131,.65)" });

  renderDigitalTiming(svgEl, [
    { name:"TX", levels, stroke:"var(--accent)" }
  ], { width:1200, height:360, cells: levels.length, rowH:120, progress: App.progress, segments: segs });

  const idx = currentCell(levels.length);
  hintEl.innerHTML =
    `数据 <span class="tag">0x${dataVal.toString(16).toUpperCase()}</span> ` +
    `LSB→MSB <span class="tag">${bits.join("")}</span> ` +
    `校验 <span class="tag">${st.parity}</span> ` +
    `停止位 <span class="tag">${st.stopBits}</span> ` +
    `当前格 <span class="tag">#${idx}</span> ` +
    `波特率 <span class="tag">${st.baud}</span>`;
}
