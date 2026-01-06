// modules/fdcan/fdcan.circuit.js
// CAN FD 原理图：支持更高速率的消息传输
// 显示数据和仲裁段的不同速率

export function renderFdcanCircuit(App, svgEl, hintEl, state = {}) {
  svgEl.setAttribute("viewBox", "0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

  const mcuX = 80;
  const mcuY = 70;
  const mcuW = 280;
  const mcuH = 220;

  const devX = 520;
  const devY = 70;
  const devW = 280;
  const devH = 220;

  const busY = 380;
  const wireColor = "rgba(110,168,255,.85)";
  const busColor = "rgba(255,215,0,.9)";

  svgEl.innerHTML = `
    <!-- 顶部说明 -->
          <text x="22" y="40" fill="var(--muted)" font-family="var(--mono)" font-size="16">
      CAN FD：支持更大数据载荷（最多64字节）和可变比特率（数据段可高达 5Mbps）
    </text>

    <!-- MCU 节点 -->
    <rect x="${mcuX}" y="${mcuY}" width="${mcuW}" height="${mcuH}" rx="14"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
      <text x="${mcuX + 24}" y="${mcuY + 58}" fill="var(--text)" font-weight="950" font-size="21">MCU</text>
      <text x="${mcuX + 20}" y="${mcuY + 140}" fill="var(--muted)" font-family="var(--mono)" font-size="15">仲裁段</text>
      <text x="${mcuX + 20}" y="${mcuY + 160}" fill="var(--muted)" font-family="var(--mono)" font-size="14">500 kbps</text>
      <text x="${mcuX + 20}" y="${mcuY + 190}" fill="var(--ok)" font-family="var(--mono)" font-size="15" font-weight="bold">数据段</text>
      <text x="${mcuX + 20}" y="${mcuY + 210}" fill="var(--ok)" font-family="var(--mono)" font-size="14">4 Mbps</text>
    
    <!-- 设备节点 -->
    <rect x="${devX}" y="${devY}" width="${devW}" height="${devH}" rx="14"
          fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
      <text x="${devX + 180}" y="${devY + 58}" fill="var(--text)" font-weight="950" font-size="21">ECU</text>
      <text x="${devX + 20}" y="${devY + 140}" fill="var(--muted)" font-family="var(--mono)" font-size="15">仲裁段</text>
      <text x="${devX + 20}" y="${devY + 160}" fill="var(--muted)" font-family="var(--mono)" font-size="14">500 kbps</text>
      <text x="${devX + 20}" y="${devY + 190}" fill="var(--ok)" font-family="var(--mono)" font-size="15" font-weight="bold">数据段</text>
      <text x="${devX + 20}" y="${devY + 210}" fill="var(--ok)" font-family="var(--mono)" font-size="14">4 Mbps</text>

    <!-- 连接线 -->
    <line x1="${mcuX + mcuW/2}" y1="${mcuY + mcuH}" x2="${mcuX + mcuW/2}" y2="${busY - 30}"
          stroke="${wireColor}" stroke-width="2.5"/>
    <line x1="${mcuX + mcuW/2 + 40}" y1="${mcuY + mcuH}" x2="${mcuX + mcuW/2 + 40}" y2="${busY + 30}"
          stroke="${wireColor}" stroke-width="2.5"/>

    <line x1="${devX + devW/2}" y1="${devY + devH}" x2="${devX + devW/2}" y2="${busY - 30}"
          stroke="${wireColor}" stroke-width="2.5"/>
    <line x1="${devX + devW/2 + 40}" y1="${devY + devH}" x2="${devX + devW/2 + 40}" y2="${busY + 30}"
          stroke="${wireColor}" stroke-width="2.5"/>

    <!-- FD-CAN 总线 CANH -->
    <line x1="80" y1="${busY - 30}" x2="920" y2="${busY - 30}"
          stroke="${busColor}" stroke-width="6"/>
      <text x="0" y="${busY - 18}" fill="var(--accent)" font-family="var(--mono)" font-size="16" font-weight="bold">CANH</text>

    <!-- FD-CAN 总线 CANL -->
    <line x1="80" y1="${busY + 30}" x2="920" y2="${busY + 30}"
          stroke="${busColor}" stroke-width="6"/>
      <text x="0" y="${busY + 40}" fill="var(--accent)" font-family="var(--mono)" font-size="16" font-weight="bold">CANL</text>

            <!-- 终端电阻 -->
            <g>
                  <!-- 从 CANH 向下的竖线 -->
                  <line x1="900" y1="${busY - 30}" x2="900" y2="${busY - 18}" stroke="var(--ok)" stroke-width="3"/>
                  <!-- 电阻符号：锯齿波形 -->
                  <path d="M 900 ${busY - 18} L 892 ${busY - 12} L 908 ${busY - 6} L 892 ${busY} L 908 ${busY + 6} L 892 ${busY + 12} L 900 ${busY + 18}" 
                                    fill="none" stroke="var(--ok)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- 从 CANL 向上的竖线 -->
                  <line x1="900" y1="${busY + 18}" x2="900" y2="${busY + 30}" stroke="var(--ok)" stroke-width="3"/>
      
                  <!-- 文字标注 -->
                  <text x="920" y="${busY - 4}" fill="var(--ok)" font-family="var(--mono)" font-size="30" font-weight="bold">120Ω</text>
                  <text x="920" y="${busY + 20}" fill="var(--muted)" font-family="var(--mono)" font-size="30">终端电阻</text>
            </g>

    <!-- GND -->
    <line x1="60" y1="430" x2="950" y2="430" stroke="rgba(255,255,255,.10)" stroke-width="3"/>
            <text x="22" y="455" fill="var(--muted)" font-family="var(--mono)" font-size="15">GND 共地</text>
  `;

  // 提示
  const st = App.state.fdcan;
  const arbRate = st.arbBaudrate || 500000;
  const dataRate = st.dataBaudrate || 4000000;
  const ratio = (dataRate / arbRate).toFixed(1);
  hintEl.textContent = `CAN FD 可变比特率：仲裁段 ${arbRate/1000}kbps，数据段 ${dataRate/1000}kbps（提速 ${ratio}倍）。支持最大 64 字节数据载荷。`;
}
