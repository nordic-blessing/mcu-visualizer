export function renderDigitalTiming(svgEl, signals, opts){
  const W = opts.width ?? 1200;
  const H = opts.height ?? 360;
  const cells = opts.cells ?? signals[0].levels.length;
  const left = 110, right = 18, top = 22;
  const rowH = opts.rowH ?? 74;

  const cellW = (W - left - right) / Math.max(1, cells);
  const highY = (r)=> top + r*rowH + 18;
  const lowY  = (r)=> top + r*rowH + 54;

  const cursorX = left + (opts.progress ?? 0) * (W - left - right);

  const grid = [];
  for(let i=0;i<=cells;i++){
    const x = left + i*cellW;
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`);
  }

  const segments = opts.segments || [];
  const segRects = segments.map(seg=>{
    const x = left + seg.start * cellW;
    const w = (seg.end - seg.start) * cellW;
    return `
      <rect x="${x}" y="0" width="${w}" height="${H}" fill="${seg.color}" opacity="0.16"/>
      ${seg.label ? `<text x="${x+8}" y="16" fill="var(--muted)" font-size="13" font-family="var(--mono)">${seg.label}</text>` : ``}
    `;
  }).join("");

  const waves = signals.map((sig, r)=>{
    let d = "";
    for(let i=0;i<cells;i++){
      const x0 = left + i*cellW;
      const x1 = left + (i+1)*cellW;
      const y = sig.levels[i] ? highY(r) : lowY(r);
      if(i===0) d += `M ${x0} ${y} `;
      const yNext = (i+1<cells) ? (sig.levels[i+1] ? highY(r) : lowY(r)) : y;
      d += `L ${x1} ${y} `;
      if(yNext !== y) d += `L ${x1} ${yNext} `;
    }

    const labelY = top + r*rowH + 40;
    const stroke = sig.stroke || "var(--accent)";
    return `
      <text x="16" y="${labelY}" fill="var(--muted)" font-size="13" font-family="var(--mono)">${sig.name}</text>
      <path d="${d}" fill="none" stroke="${stroke}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      <line x1="${left}" y1="${top + r*rowH + rowH-6}" x2="${W-right}" y2="${top + r*rowH + rowH-6}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
    `;
  }).join("");

  const cursor = `
    <line x1="${cursorX}" y1="0" x2="${cursorX}" y2="${H}" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
    <circle cx="${cursorX}" cy="12" r="5" fill="var(--accent)"/>
  `;

  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.innerHTML = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="12" ry="12" fill="transparent"/>
    ${grid.join("")}
    ${segRects}
    ${waves}
    ${cursor}
  `;
}

export function renderAnalogTiming(svgEl, series, opts){
  // series: [{name, values:[0..1], stroke}]
  const W = opts.width ?? 1200;
  const H = opts.height ?? 360;
  const cells = opts.cells ?? series[0].values.length;
  const left = 110, right = 18, top = 22;
  const rowH = opts.rowH ?? 120;

  const cellW = (W - left - right) / Math.max(1, cells);
  const midY = (r)=> top + r*rowH + rowH/2;
  const amp  = (r)=> rowH*0.38;

  const cursorX = left + (opts.progress ?? 0) * (W - left - right);

  const grid = [];
  for(let i=0;i<=cells;i++){
    const x = left + i*cellW;
    grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>`);
  }

  const plots = series.map((sig, r)=>{
    let d = "";
    for(let i=0;i<cells;i++){
      const x = left + i*cellW;
      const y = midY(r) - (sig.values[i] * 2 - 1) * amp(r);
      if(i===0) d += `M ${x} ${y} `;
      else d += `L ${x} ${y} `;
    }
    const labelY = top + r*rowH + 40;
    return `
      <text x="16" y="${labelY}" fill="var(--muted)" font-size="13" font-family="var(--mono)">${sig.name}</text>
      <path d="${d}" fill="none" stroke="${sig.stroke || "var(--accent)"}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="${left}" y1="${top + r*rowH + rowH-6}" x2="${W-right}" y2="${top + r*rowH + rowH-6}" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
    `;
  }).join("");

  const cursor = `
    <line x1="${cursorX}" y1="0" x2="${cursorX}" y2="${H}" stroke="rgba(255,255,255,.25)" stroke-width="2"/>
    <circle cx="${cursorX}" cy="12" r="5" fill="var(--accent)"/>
  `;

  svgEl.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svgEl.innerHTML = `
    <rect x="0" y="0" width="${W}" height="${H}" rx="12" ry="12" fill="transparent"/>
    ${grid.join("")}
    ${plots}
    ${cursor}
  `;
}
