// modules/i2c/i2c.circuit.js
// 修复：从机标题与引脚标注重叠
// 策略：从机标题右移；从机引脚标注贴更靠近方框左边界外侧；并保持总线不标注（避免多处重复）。

export function renderI2cCircuit(App, svgEl, hintEl){
  svgEl.setAttribute("viewBox","0 0 980 460");
  svgEl.setAttribute("preserveAspectRatio","xMidYMid meet");

  // Layout constants (便于后续维护)
  const MASTER_X = 70,  MASTER_Y = 170, MASTER_W = 320, MASTER_H = 180;
  const SLAVE_X  = 610, SLAVE_Y  = 170, SLAVE_W  = 320, SLAVE_H  = 180;

  const SCL_Y = 230;
  const SDA_Y = 290;

  const BUS_L = MASTER_X + MASTER_W; // 390
  const BUS_R = SLAVE_X;             // 610

  // 引脚标注位置（关键：从机侧放在方框外一点，避免压到“从机”标题）
  const PIN_L_X = BUS_L - 18;        // 主机右侧外一点
  const PIN_R_X = BUS_R + 18;        // 从机左侧外一点（注意：这里是“从机方框外侧”）

  // 标题位置：从机标题明显右移，确保与左侧引脚永不重叠
  const MASTER_TITLE_X = MASTER_X + 34;          // 104
  const SLAVE_TITLE_X  = SLAVE_X + 240;           // 原来 644，右移到 700 附近更安全

  svgEl.innerHTML = `
    <!-- 标题 -->
    <text x="22" y="40" fill="var(--muted)" font-family="var(--mono)" font-size="13">
      I²C：SCL / SDA 开漏输出，需分别上拉到 VCC
    </text>

    <!-- VCC -->
    <text x="22" y="78" fill="var(--muted)" font-family="var(--mono)" font-size="13">VCC</text>
    <line x1="70" y1="84" x2="950" y2="84" stroke="rgba(255,255,255,.10)" stroke-width="3"/>

    <!-- 主机 -->
    <rect x="${MASTER_X}" y="${MASTER_Y}" width="${MASTER_W}" height="${MASTER_H}" rx="18"
      fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${MASTER_TITLE_X}" y="220" fill="var(--text)" font-weight="950" font-size="16">主机</text>

    <!-- 从机 -->
    <rect x="${SLAVE_X}" y="${SLAVE_Y}" width="${SLAVE_W}" height="${SLAVE_H}" rx="18"
      fill="color-mix(in srgb, var(--panel2) 85%, transparent)" stroke="var(--border)"/>
    <text x="${SLAVE_TITLE_X}" y="220" fill="var(--text)" font-weight="950" font-size="16">从机</text>

    <!-- SCL 总线 -->
    <line x1="${BUS_L}" y1="${SCL_Y}" x2="${BUS_R}" y2="${SCL_Y}" stroke="var(--accent)" stroke-width="3.2"/>

    <!-- SDA 总线 -->
    <line x1="${BUS_L}" y1="${SDA_Y}" x2="${BUS_R}" y2="${SDA_Y}" stroke="var(--accent)" stroke-width="3.2"/>

    <!-- 只在引脚处标注（主机侧：靠近主机 PAD） -->
    <text x="${PIN_L_X}" y="${SCL_Y-4}" text-anchor="end"
      fill="var(--muted)" font-size="12" font-family="var(--mono)">SCL</text>
    <text x="${PIN_L_X}" y="${SDA_Y-4}" text-anchor="end"
      fill="var(--muted)" font-size="12" font-family="var(--mono)">SDA</text>

    <!-- 只在引脚处标注（从机侧：放在从机方框外侧，避免与“从机”重叠） -->
    <text x="${PIN_R_X}" y="${SCL_Y-4}" text-anchor="start"
      fill="var(--muted)" font-size="12" font-family="var(--mono)">SCL</text>
    <text x="${PIN_R_X}" y="${SDA_Y-4}" text-anchor="start"
      fill="var(--muted)" font-size="12" font-family="var(--mono)">SDA</text>

    <!-- SCL 上拉电阻 Rp（接在 SCL 上） -->
    <line x1="500" y1="84" x2="500" y2="${SCL_Y}" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
    <polyline points="500,106 492,120 508,134 492,148 508,162 500,176"
      fill="none" stroke="rgba(255,255,255,.20)" stroke-width="2"/>
    <text x="514" y="148" fill="var(--muted)" font-size="13" font-family="var(--mono)">Rp</text>

    <!-- SDA 上拉电阻 Rp（接在 SDA 上） -->
    <line x1="560" y1="84" x2="560" y2="${SDA_Y}" stroke="rgba(255,255,255,.14)" stroke-width="2"/>
    <polyline points="560,106 552,120 568,134 552,148 568,162 560,176"
      fill="none" stroke="rgba(255,255,255,.20)" stroke-width="2"/>
    <text x="574" y="148" fill="var(--muted)" font-size="13" font-family="var(--mono)">Rp</text>
  `;

  if (hintEl) hintEl.textContent = "";
}
