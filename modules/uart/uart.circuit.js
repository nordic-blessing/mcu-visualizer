// modules/uart/uart.circuit.js
// UART 原理图：两设备 + 交叉 TX/RX + 引脚标注（靠近设备端）
// 约定：renderUartCircuit(App, svgEl, hintEl, state?)
// state 可选：{ levelTx:0/1, levelRx:0/1 } 未来做高亮用

export function renderUartCircuit(App, svgEl, hintEl, state = {}) {
  svgEl.setAttribute("viewBox", "0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const L = { x: 90,  y: 150, w: 340, h: 200, title: "MCU" };
  const R = { x: 550, y: 150, w: 340, h: 200, title: "外设" };

  const midL = L.x + L.w;
  const midR = R.x;

  // 两条连线的 Y
  const Y_TOP = 220; // TXD(L) -> RXD(R)
  const Y_BOT = 280; // RXD(L) -> TXD(R)

  // 引脚文字 X（贴近设备边缘，不进方框）
  const PIN_L_X = midL - 18;  // 左设备右侧
  const PIN_R_X = midR + 18;  // 右设备左侧

  // 线颜色（可扩展：高电平/活动时高亮）
  const wire = "rgba(110,168,255,.85)";
  const wireDim = "rgba(255,255,255,.18)";

  svgEl.innerHTML = `
    <!-- 顶部说明 -->
    <text x="22" y="40" fill="var(--muted)" font-family="var(--mono)" font-size="13">
      UART：TX ↔ RX 交叉连接；同地（GND）必须相连
    </text>

    <!-- GND（参考线，保持和其它图一致的“工程感”） -->
    <text x="22" y="410" fill="var(--muted)" font-family="var(--mono)" font-size="13">GND 共地</text>
    <line x1="70" y1="420" x2="950" y2="420" stroke="rgba(255,255,255,.10)" stroke-width="3"/>

    <!-- 左设备 -->
    <rect x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx="18"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${L.x + 34}" y="${L.y + 58}" fill="var(--text)" font-weight="950" font-size="16">${L.title}</text>

    <!-- 右设备 -->
    <rect x="${R.x}" y="${R.y}" width="${R.w}" height="${R.h}" rx="18"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${R.x + 260}" y="${R.y + 58}" fill="var(--text)" font-weight="950" font-size="16">${R.title}</text>

    <!-- 交叉连线：TXD(L)->RXD(R) -->
    <line x1="${midL}" y1="${Y_TOP}" x2="${midR}" y2="${Y_BOT}"
          stroke="${wire}" stroke-width="3.2"/>

    <!-- 交叉连线：RXD(L)->TXD(R) -->
    <line x1="${midL}" y1="${Y_BOT}" x2="${midR}" y2="${Y_TOP}"
          stroke="${wire}" stroke-width="3.2"/>

    <!-- 引脚标注（只在设备端标，不在中间重复） -->
    <!-- 左设备端 -->
    <text x="${PIN_L_X}" y="${Y_TOP - 4}" text-anchor="end"
          fill="var(--muted)" font-size="12" font-family="var(--mono)">TXD</text>
    <text x="${PIN_L_X}" y="${Y_BOT - 4}" text-anchor="end"
          fill="var(--muted)" font-size="12" font-family="var(--mono)">RXD</text>

    <!-- 右设备端（注意：上/下对应交叉后的引脚） -->
    <text x="${PIN_R_X}" y="${Y_TOP - 4}" text-anchor="start"
          fill="var(--muted)" font-size="12" font-family="var(--mono)">TXD</text>
    <text x="${PIN_R_X}" y="${Y_BOT - 4}" text-anchor="start"
          fill="var(--muted)" font-size="12" font-family="var(--mono)">RXD</text>

    <!-- 小提示：用细线标示“交叉” -->
    <line x1="${(midL + midR) / 2}" y1="${Y_TOP}" x2="${(midL + midR) / 2}" y2="${Y_BOT}"
          stroke="${wireDim}" stroke-width="2"/>
  `;

  if (hintEl) hintEl.textContent = "";
}
