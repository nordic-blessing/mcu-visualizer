// modules/spi/spi.circuit.js
// SPI 原理图：主机/从机 + CS/SCK/MOSI/MISO 四线 + 引脚标注（靠近设备端）
// 约定：renderSpiCircuit(App, svgEl, hintEl, state?)
// state 可选：{ active:"CS"|"SCK"|"MOSI"|"MISO"|null } 未来做高亮用

export function renderSpiCircuit(App, svgEl, hintEl, state = {}) {
  svgEl.setAttribute("viewBox", "0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const M = { x: 90,  y: 130, w: 340, h: 230, title: "主机" };
  const S = { x: 550, y: 130, w: 340, h: 230, title: "从机" };

  const midL = M.x + M.w;
  const midR = S.x;

  // 四根线的 Y（从上到下）
  const Y_CS   = 200;
  const Y_SCK  = 240;
  const Y_MOSI = 280;
  const Y_MISO = 320;

  // 引脚文字 X（贴近设备边缘）
  const PIN_L_X = midL - 18;
  const PIN_R_X = midR + 18;

  const wire = "rgba(110,168,255,.85)";
  const wireDim = "rgba(255,255,255,.18)";

  // 箭头（MOSI: 主->从；MISO: 从->主）
  const arrow = (x, y, dir) => {
    if (dir === "right") {
      return `<polygon points="${x},${y-6} ${x+12},${y} ${x},${y+6}" fill="rgba(110,168,255,.35)" stroke="rgba(110,168,255,.70)" stroke-width="1.2"/>`;
    }
    return `<polygon points="${x},${y-6} ${x-12},${y} ${x},${y+6}" fill="rgba(110,168,255,.35)" stroke="rgba(110,168,255,.70)" stroke-width="1.2"/>`;
  };

  svgEl.innerHTML = `
    <!-- 顶部说明 -->
    <text x="22" y="40" fill="var(--muted)" font-family="var(--mono)" font-size="13">
      SPI：CS 选通从机；SCK 为时钟；MOSI 主→从；MISO 从→主
    </text>

    <!-- 主机 -->
    <rect x="${M.x}" y="${M.y}" width="${M.w}" height="${M.h}" rx="18"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${M.x + 34}" y="${M.y + 58}" fill="var(--text)" font-weight="950" font-size="16">${M.title}</text>

    <!-- 从机 -->
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="18"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${S.x + 260}" y="${S.y + 58}" fill="var(--text)" font-weight="950" font-size="16">${S.title}</text>

    <!-- CS / SCK / MOSI / MISO 连线 -->
    <line x1="${midL}" y1="${Y_CS}"   x2="${midR}" y2="${Y_CS}"   stroke="${wire}" stroke-width="3.2"/>
    <line x1="${midL}" y1="${Y_SCK}"  x2="${midR}" y2="${Y_SCK}"  stroke="${wire}" stroke-width="3.2"/>
    <line x1="${midL}" y1="${Y_MOSI}" x2="${midR}" y2="${Y_MOSI}" stroke="${wire}" stroke-width="3.2"/>
    <line x1="${midL}" y1="${Y_MISO}" x2="${midR}" y2="${Y_MISO}" stroke="${wire}" stroke-width="3.2"/>

    <!-- 方向箭头：MOSI 主->从（靠近中间） -->
    ${arrow((midL + midR)/2 - 20, Y_MOSI, "right")}
    <!-- 方向箭头：MISO 从->主 -->
    ${arrow((midL + midR)/2 + 20, Y_MISO, "left")}

    <!-- 引脚标注：只在设备端标 -->
    <!-- 主机端 -->
    <text x="${PIN_L_X}" y="${Y_CS-4}"   text-anchor="end" fill="var(--muted)" font-size="12" font-family="var(--mono)">CS</text>
    <text x="${PIN_L_X}" y="${Y_SCK-4}"  text-anchor="end" fill="var(--muted)" font-size="12" font-family="var(--mono)">SCK</text>
    <text x="${PIN_L_X}" y="${Y_MOSI-4}" text-anchor="end" fill="var(--muted)" font-size="12" font-family="var(--mono)">MOSI</text>
    <text x="${PIN_L_X}" y="${Y_MISO-4}" text-anchor="end" fill="var(--muted)" font-size="12" font-family="var(--mono)">MISO</text>

    <!-- 从机端 -->
    <text x="${PIN_R_X}" y="${Y_CS-4}"   text-anchor="start" fill="var(--muted)" font-size="12" font-family="var(--mono)">CS</text>
    <text x="${PIN_R_X}" y="${Y_SCK-4}"  text-anchor="start" fill="var(--muted)" font-size="12" font-family="var(--mono)">SCK</text>
    <text x="${PIN_R_X}" y="${Y_MOSI-4}" text-anchor="start" fill="var(--muted)" font-size="12" font-family="var(--mono)">MOSI</text>
    <text x="${PIN_R_X}" y="${Y_MISO-4}" text-anchor="start" fill="var(--muted)" font-size="12" font-family="var(--mono)">MISO</text>
  `;

  if (hintEl) hintEl.textContent = "";
}
