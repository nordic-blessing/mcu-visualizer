import { renderDigitalTiming } from "../../core/timing.js";
import { currentCell, clamp } from "../../core/app.js";

function parseHex(s, fallback){
  try{
    const t = String(s).trim().toLowerCase();
    const v = parseInt(t.startsWith("0x")? t.slice(2):t, 16);
    if(Number.isFinite(v)) return clamp(v,0,255);
  }catch{}
  return fallback;
}
function bitsMSB(b){
  return Array.from({length:8}, (_,i)=> (b>>(7-i))&1);
}

export function renderSpiTiming(App, svgEl, hintEl){
  const st = App.state.spi;
  const mosiB = parseHex(st.mosi, 0x9A);
  const misoB = parseHex(st.miso, 0x3F);
  const mode = parseInt(st.mode,10) || 0;
  const cpol = (mode===2 || mode===3) ? 1 : 0;

  const mosiBits = bitsMSB(mosiB);
  const misoBits = bitsMSB(misoB);

  const cs=[], sck=[], mosi=[], miso=[];
  const pad = 6;
  for(let i=0;i<pad;i++){ cs.push(1); sck.push(cpol); mosi.push(0); miso.push(0); }

  // assert CS
  const start = cs.length;
  for(let i=0;i<2;i++){ cs.push(0); sck.push(cpol); mosi.push(mosiBits[0]); miso.push(misoBits[0]); }

  // 8 bits: 3 samples per bit for clarity
  for(let i=0;i<8;i++){
    const bm = mosiBits[i], bi = misoBits[i];
    // stable
    cs.push(0); sck.push(cpol); mosi.push(bm); miso.push(bi);
    // toggle
    cs.push(0); sck.push(1-cpol); mosi.push(bm); miso.push(bi);
    // back
    cs.push(0); sck.push(cpol); mosi.push(bm); miso.push(bi);
  }

  const end = cs.length;

  // deassert
  for(let i=0;i<6;i++){ cs.push(1); sck.push(cpol); mosi.push(0); miso.push(0); }

  const segs = [{ start, end, label:"CS Active", color:"rgba(255,110,138,.45)" }];

  renderDigitalTiming(svgEl, [
    { name:"CS", levels:cs, stroke:"var(--danger)" },
    { name:"SCK", levels:sck, stroke:"var(--accent)" },
    { name:"MOSI", levels:mosi, stroke:"var(--ok)" },
    { name:"MISO", levels:miso, stroke:"var(--ok)" },
  ], { width:1200, height:360, cells:cs.length, rowH:78, progress: App.progress, segments: segs });

  const idx = currentCell(cs.length);
  hintEl.innerHTML =
    `Mode <span class="tag">${mode}</span> ` +
    `CPOL <span class="tag">${cpol}</span> ` +
    `MOSI <span class="tag">0x${mosiB.toString(16).toUpperCase().padStart(2,"0")}</span> ` +
    `MISO <span class="tag">0x${misoB.toString(16).toUpperCase().padStart(2,"0")}</span> ` +
    `当前格 <span class="tag">#${idx}</span>`;
}
