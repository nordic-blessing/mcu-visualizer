import { currentCell, clamp } from "../../core/app.js";

function bitsSquare(n){ return Array.from({length:n},(_,i)=>i%2); }
function bitsPulse(n){
  const a = Array(n).fill(0);
  const s = Math.floor(n*0.25), e = Math.floor(n*0.55);
  for(let i=s;i<e;i++) a[i]=1;
  return a;
}
function bitsGlitch(n){
  const a = Array(n).fill(0);
  const g = Math.floor(n*0.55);
  a[g]=1; if(g+1<n) a[g+1]=0;
  return a;
}
function bitsButton(n){
  const a = Array(n).fill(1);
  const s = Math.floor(n*0.35), e = Math.floor(n*0.65);
  for(let i=s;i<e;i++) a[i]=0;
  return a;
}
function analogSine(n){
  return Array.from({length:n},(_,i)=> (Math.sin(i/n*2*Math.PI)+1)/2 );
}
function analogDC(n, v=0.65){
  return Array.from({length:n},()=> clamp(v,0,1));
}

export function gpioDigitalLevels(st){
  const cells = 28;
  if(st.wave==="pulse") return bitsPulse(cells);
  if(st.wave==="glitch") return bitsGlitch(cells);
  if(st.wave==="button") return bitsButton(cells);
  return bitsSquare(cells);
}
export function gpioAnalogValues(st){
  const cells = 64;
  if(st.wave==="dc") return analogDC(cells, 0.72);
  return analogSine(cells);
}

function deriveLineForDigital(st, out){
  const mode = st.mode;
  const hasPU = (mode==="od_out_pu" || mode==="in_pu");
  const hasPD = (mode==="od_out_pd" || mode==="in_pd");
  const isPP = mode==="pp_out";
  const isOD = mode.startsWith("od_out");
  const isIn = mode.startsWith("in_");
  const isOther = (mode==="af");

  const line=[], drive=[];
  for(const v of out){
    if(isPP){
      line.push(v); drive.push(v? "H":"L");
    }else if(isOD){
      if(v===0){ line.push(0); drive.push("L"); }
      else{
        if(hasPU){ line.push(1); drive.push("Z→PU"); }
        else if(hasPD){ line.push(0); drive.push("Z→PD"); }
        else{ line.push(1); drive.push("Z"); }
      }
    }else if(isIn){
      if(mode==="in_float"){
        const noisy = v ? 1 : 0;
        line.push(noisy); drive.push("EXT?");
      }else{
        if(st.load==="button_to_gnd"){
          const base = hasPU ? 1 : 0;
          line.push(v===0 ? 0 : base);
          drive.push(v===0 ? "BTN" : (hasPU ? "PU":"PD"));
        }else{
          line.push(v);
          drive.push("EXT");
        }
      }
    }else if(isOther){
      line.push(v);
      drive.push("AF");
    }else{
      line.push(v);
      drive.push("?");
    }
  }
  return { line, drive };
}

export function renderGpioCircuit(App, svgEl, hintEl){
  const st = App.state.gpio;

  // ✅ 关键：完整显示，不裁剪
  svgEl.setAttribute("viewBox", "0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // ✅ 全局“可读性加大”
  const SW_MAJOR = 4.6;   // 主母线/强调线
  const SW_WIRE  = 3.0;   // 普通导线
  const SW_THIN  = 2.2;   // 辅助线
  const TXT_MAIN = 16;    // 主标题字
  const TXT_SUB  = 14;    // 说明字
  const NODE_R   = 8;

  // Analog mode circuit
  if(st.mode==="analog" || st.load==="analog_src"){
    const values = gpioAnalogValues(st);
    const idx = currentCell(values.length);
    const v = values[idx];

    svgEl.innerHTML = `
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <text x="24" y="44" fill="var(--muted)" font-family="var(--mono)" font-size="${TXT_SUB}">
        模拟输入：ADC 采样（示意）
      </text>

      <rect x="70" y="150" width="300" height="170" rx="18"
        fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
      <text x="102" y="198" fill="var(--text)" font-weight="950" font-size="${TXT_MAIN}">MCU</text>
      <text x="102" y="224" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">ADC_IN</text>

      <circle cx="370" cy="240" r="${NODE_R}" fill="var(--accent)"/>
      <line x1="370" y1="240" x2="560" y2="240" stroke="var(--accent)" stroke-width="${SW_MAJOR}"/>
      <text x="388" y="228" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">AIN</text>

      <rect x="600" y="160" width="300" height="160" rx="18" fill="transparent" stroke="rgba(255,255,255,.14)"/>
      <text x="628" y="204" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">模拟源</text>
      <text x="628" y="232" fill="var(--text)" font-weight="950" font-size="${TXT_MAIN}">
        ${st.wave==="dc" ? "DC" : "Sine"}
      </text>

      <rect x="670" y="78" width="280" height="44" rx="12"
        fill="color-mix(in srgb, var(--panel) 75%, transparent)" stroke="var(--border)"/>
      <text x="688" y="108" fill="var(--muted)" font-family="var(--mono)" font-size="${TXT_SUB}">当前采样</text>
      <text x="790" y="108" fill="var(--ok)" font-weight="950" font-family="var(--mono)" font-size="${TXT_MAIN}">
        ${(v*3.3).toFixed(2)} V
      </text>
    `;

    hintEl.textContent = "模拟输入不显示 LED 负载；时序图为连续波形（示意 ADC 采样）。";
    return;
  }

  const out = gpioDigitalLevels(st);
  const { line } = deriveLineForDigital(st, out);
  const idx = currentCell(out.length);
  const lineNow = line[idx];

  const mode = st.mode;
  const pull = clamp(parseInt(String(st.rpull||"10").replace(/[^\d]/g,"")||"10",10),1,200);

  const isOut = (mode==="pp_out" || mode.startsWith("od_out"));
  const isIn  = mode.startsWith("in_");

  const vccY=64, gndY=432, pinX=430, pinY=240;

  const load = st.load;
  let ledOn = false;
  if(isOut){
    if(load==="led_to_gnd") ledOn = (lineNow===1);
    if(load==="led_to_vcc") ledOn = (lineNow===0);
  }

  const showButton = isIn && (load==="button_to_gnd");
  const hasPU = (mode==="od_out_pu" || mode==="in_pu");
  const hasPD = (mode==="od_out_pd" || mode==="in_pd");

  const defs = `
    <defs>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="3" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
  `;

  const rails = `
    <text x="26" y="${vccY-12}" fill="var(--muted)" font-family="var(--mono)" font-size="${TXT_SUB}">VCC</text>
    <line x1="70" y1="${vccY}" x2="950" y2="${vccY}" stroke="rgba(255,255,255,.10)" stroke-width="${SW_MAJOR}"/>
    <text x="26" y="${gndY-12}" fill="var(--muted)" font-family="var(--mono)" font-size="${TXT_SUB}">GND</text>
    <line x1="70" y1="${gndY}" x2="950" y2="${gndY}" stroke="rgba(255,255,255,.10)" stroke-width="${SW_MAJOR}"/>
  `;

  const mcu = `
    <rect x="70" y="160" width="310" height="200" rx="18"
      fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="104" y="208" fill="var(--text)" font-weight="950" font-size="${TXT_MAIN}">MCU</text>
    <text x="104" y="236" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">
      ${isOut?"GPIO 输出":(isIn?"GPIO 输入":"GPIO")}
    </text>

    <circle cx="380" cy="${pinY}" r="${NODE_R}" fill="var(--accent)"/>
    <line x1="380" y1="${pinY}" x2="${pinX}" y2="${pinY}" stroke="var(--accent)" stroke-width="${SW_MAJOR}"/>
    <text x="${pinX+12}" y="${pinY+7}" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">PAD</text>
  `;

  let pullSvg = "";
  if(hasPU || hasPD){
    const x=600;
    const up = hasPU;
    const y0 = up ? vccY : pinY;
    const y1 = up ? pinY : gndY;
    const z0 = up ? vccY+24 : pinY+24;

    pullSvg = `
      <line x1="${pinX}" y1="${pinY}" x2="${x}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
      <line x1="${x}" y1="${y0}" x2="${x}" y2="${z0}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
      <polyline points="${x},${z0} ${x-10},${z0+16} ${x+10},${z0+32} ${x-10},${z0+48} ${x+10},${z0+64} ${x},${z0+80}"
        fill="none" stroke="rgba(255,255,255,.26)" stroke-width="${SW_WIRE}"/>
      <line x1="${x}" y1="${z0+80}" x2="${x}" y2="${y1}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
      <text x="${x+16}" y="${pinY-18}" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">${pull}kΩ</text>
      <text x="${x+16}" y="${pinY+8}" fill="var(--muted)" font-size="${TXT_SUB}">${up?"上拉":"下拉"}</text>
    `;
  }

  let rightSvg = "";
  const rx = 780;

  if(isOut){
    if(load==="led_to_gnd" || load==="led_to_vcc"){
      const ledFill = ledOn ? "rgba(255,230,120,.95)" : "rgba(255,255,255,.06)";
      const ledStroke = ledOn ? "rgba(255,230,120,.95)" : "rgba(255,255,255,.22)";
      const filt = ledOn ? `filter="url(#glow)"` : "";

      if(load==="led_to_gnd"){
        rightSvg = `
          <line x1="${pinX}" y1="${pinY}" x2="${rx}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
          <polygon points="${rx},${pinY-16} ${rx+26},${pinY} ${rx},${pinY+16}" fill="${ledFill}" stroke="${ledStroke}" stroke-width="${SW_WIRE}" ${filt}/>
          <line x1="${rx+26}" y1="${pinY}" x2="${rx+54}" y2="${pinY}" stroke="${ledStroke}" stroke-width="${SW_WIRE}" ${filt}/>
          <line x1="${rx+54}" y1="${pinY}" x2="${rx+54}" y2="${gndY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
          <text x="${rx-10}" y="${pinY-24}" fill="var(--muted)" font-size="${TXT_SUB}">LED</text>
          ${ledOn ? `<path d="M ${pinX} ${pinY} L ${rx+54} ${pinY} L ${rx+54} ${gndY}" stroke="rgba(255,230,120,.9)" stroke-width="5.2" fill="none" class="flow"/>` : ``}
        `;
      }else{
        rightSvg = `
          <line x1="${pinX}" y1="${pinY}" x2="${rx}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
          <line x1="${rx+54}" y1="${vccY}" x2="${rx+54}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
          <polygon points="${rx},${pinY-16} ${rx+26},${pinY} ${rx},${pinY+16}" fill="${ledFill}" stroke="${ledStroke}" stroke-width="${SW_WIRE}" ${filt}/>
          <line x1="${rx+26}" y1="${pinY}" x2="${rx+54}" y2="${pinY}" stroke="${ledStroke}" stroke-width="${SW_WIRE}" ${filt}/>
          <text x="${rx-10}" y="${pinY-24}" fill="var(--muted)" font-size="${TXT_SUB}">LED</text>
          ${ledOn ? `<path d="M ${rx+54} ${vccY} L ${rx+54} ${pinY} L ${pinX} ${pinY}" stroke="rgba(255,230,120,.9)" stroke-width="5.2" fill="none" class="flow"/>` : ``}
        `;
      }
    }else{
      rightSvg = `<line x1="${pinX}" y1="${pinY}" x2="950" y2="${pinY}" stroke="rgba(255,255,255,.10)" stroke-width="${SW_THIN}" stroke-dasharray="6 6"/>`;
    }
  }else{
    if(showButton){
      rightSvg = `
        <line x1="${pinX}" y1="${pinY}" x2="${rx}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
        <rect x="${rx}" y="${pinY-28}" width="170" height="56" rx="14" fill="transparent" stroke="rgba(255,255,255,.18)"/>
        <text x="${rx+16}" y="${pinY-6}" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">按键到 GND</text>
        <text x="${rx+16}" y="${pinY+20}" fill="${lineNow? "var(--ok)":"var(--danger)"}" font-weight="950" font-family="var(--mono)" font-size="${TXT_MAIN}">
          ${lineNow? "松开":"按下"}
        </text>
        <line x1="${rx+150}" y1="${pinY+28}" x2="${rx+150}" y2="${gndY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
      `;
    }else{
      rightSvg = `
        <line x1="${pinX}" y1="${pinY}" x2="${rx}" y2="${pinY}" stroke="rgba(255,255,255,.18)" stroke-width="${SW_WIRE}"/>
        <rect x="${rx}" y="${pinY-28}" width="170" height="56" rx="14" fill="transparent" stroke="rgba(255,255,255,.18)"/>
        <text x="${rx+16}" y="${pinY-6}" fill="var(--muted)" font-size="${TXT_SUB}" font-family="var(--mono)">外部数字源</text>
        <text x="${rx+16}" y="${pinY+20}" fill="${lineNow? "var(--ok)":"var(--danger)"}" font-weight="950" font-family="var(--mono)" font-size="${TXT_MAIN}">
          ${lineNow? "HIGH":"LOW"}
        </text>
      `;
    }
  }

  const badge = `
    <rect x="670" y="86" width="290" height="46" rx="12"
      fill="color-mix(in srgb, var(--panel) 75%, transparent)" stroke="var(--border)"/>
    <text x="688" y="116" fill="var(--muted)" font-family="var(--mono)" font-size="${TXT_SUB}">线电平</text>
    <text x="780" y="116" fill="${lineNow? "var(--ok)":"var(--danger)"}" font-weight="950" font-family="var(--mono)" font-size="${TXT_MAIN}">
      ${lineNow? "HIGH(1)":"LOW(0)"}
    </text>
  `;

  svgEl.innerHTML = `${defs}${rails}${mcu}${pullSvg}${rightSvg}${badge}`;

  const h = [];
  if(isOut) h.push("输出模式可驱动 LED/负载。");
  if(isIn) h.push("输入模式不驱动负载：展示按键/外部信号源。");
  if(hasPU) h.push(`上拉约 ${pull}kΩ。`);
  if(hasPD) h.push(`下拉约 ${pull}kΩ。`);
  hintEl.textContent = h.join(" ");
}

export function gpioDerivedDigital(App){
  const st = App.state.gpio;
  const out = gpioDigitalLevels(st);
  const { line, drive } = deriveLineForDigital(st, out);
  return { out, line, drive };
}
