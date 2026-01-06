// modules/can/can.circuit.js
// CAN 总线原理图：多个节点通过共享总线（CANH/CANL）连接
// 120Ω 终端电阻在总线末端

export function renderCanCircuit(App, svgEl, hintEl, state = {}) {
  svgEl.setAttribute("viewBox", "0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // 三个 CAN 节点
  const nodes = [
    { x: 60,  y: 80, title: "节点1\n(MCU)" },
    { x: 370, y: 80, title: "节点2\n(传感器)" },
    { x: 680, y: 80, title: "节点3\n(执行器)" }
  ];

  const nodeW = 260;
  const nodeH = 200;
  const busY = 380;

  const wireColor = "rgba(110,168,255,.85)";
  const busColor = "rgba(255,215,0,.8)";

  let nodesSvg = nodes.map((n, idx) => `
    <!-- 节点 ${idx+1} -->
    <rect x="${n.x}" y="${n.y}" width="${nodeW}" height="${nodeH}" rx="14"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
      <text x="${n.x + 24}" y="${n.y + 58}" fill="var(--text)" font-weight="950" font-size="16">${n.title}</text>
    
    <!-- CANH 连接 -->
    <line x1="${n.x + nodeW/2}" y1="${n.y + nodeH}" x2="${n.x + nodeW/2}" y2="${busY - 30}"
          stroke="${wireColor}" stroke-width="2.5"/>
    
    <!-- CANL 连接 -->
    <line x1="${n.x + nodeW/2 + 40}" y1="${n.y + nodeH}" x2="${n.x + nodeW/2 + 40}" y2="${busY + 30}"
          stroke="${wireColor}" stroke-width="2.5"/>
    
    <!-- 标注 -->
      <text x="${n.x + 32}" y="${n.y + 140}" fill="var(--muted)" font-family="var(--mono)" font-size="13">CANH</text>
      <text x="${n.x + 32}" y="${n.y + 170}" fill="var(--muted)" font-family="var(--mono)" font-size="13">CANL</text>
  `).join("");

  svgEl.innerHTML = `
    <!-- 顶部说明 -->
      <text x="22" y="40" fill="var(--muted)" font-family="var(--mono)" font-size="14">
      CAN：多节点共享两条线路（CANH/CANL）；120Ω 终端电阻提高信号质量
    </text>

    ${nodesSvg}

    <!-- CAN 总线 CANH -->
    <line x1="70" y1="${busY - 30}" x2="920" y2="${busY - 30}"
          stroke="${busColor}" stroke-width="6"/>
      <text x="0" y="${busY - 18}" fill="var(--accent)" font-family="var(--mono)" font-size="14" font-weight="bold">CANH</text>

    <!-- CAN 总线 CANL -->
    <line x1="70" y1="${busY + 30}" x2="920" y2="${busY + 30}"
          stroke="${busColor}" stroke-width="6"/>
      <text x="0" y="${busY + 40}" fill="var(--accent)" font-family="var(--mono)" font-size="14" font-weight="bold">CANL</text>

    <!-- 终端电阻标注 -->
    <g>
      <!-- 从 CANH 向下的竖线 -->
      <line x1="900" y1="${busY - 30}" x2="900" y2="${busY - 18}" stroke="var(--ok)" stroke-width="3"/>
      <!-- 电阻符号：锯齿波形 -->
      <path d="M 900 ${busY - 18} L 892 ${busY - 12} L 908 ${busY - 6} L 892 ${busY} L 908 ${busY + 6} L 892 ${busY + 12} L 900 ${busY + 18}" 
            fill="none" stroke="var(--ok)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      <!-- 从 CANL 向上的竖线 -->
      <line x1="900" y1="${busY + 18}" x2="900" y2="${busY + 30}" stroke="var(--ok)" stroke-width="3"/>
      
      <!-- 文字标注 -->
        <text x="912" y="${busY - 4}" fill="var(--ok)" font-family="var(--mono)" font-size="13" font-weight="bold">120Ω</text>
        <text x="912" y="${busY + 20}" fill="var(--muted)" font-family="var(--mono)" font-size="12">终端电阻</text>
    </g>

    <!-- GND 参考线 -->
    <line x1="70" y1="430" x2="950" y2="430" stroke="rgba(255,255,255,.10)" stroke-width="3"/>
    <text x="22" y="455" fill="var(--muted)" font-family="var(--mono)" font-size="13">GND 共地</text>
  `;

  // 提示文字
  const st = App.state.can;
  const scenario = st.scenario || "single";
  const hints = {
    "single": "当前演示：单帧发送。所有节点都会接收，但只有 ID 匹配的节点处理。",
    "collision": "当前演示：仲裁过程。多节点同时发送，CAN 控制器逐位比较 ID，低电平赢。",
    "error": "当前演示：错误帧。检测到错误时，发送器立即中止并标记错误。"
  };
  hintEl.textContent = hints[scenario] || hints["single"];
}
