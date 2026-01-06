import { renderDigitalTiming } from "../../core/timing.js";
import { currentCell, clamp } from "../../core/app.js";

function parseCanId(s, fallback = 0x456) {
  try {
    const t = String(s).trim().toLowerCase();
    const v = parseInt(t.startsWith("0x") ? t.slice(2) : t, 16);
    if (Number.isFinite(v)) return clamp(v, 0, 0x7FF);
  } catch { }
  return fallback;
}

function bitsLSB_n(val, n) {
  return Array.from({ length: n }, (_, i) => (val >> i) & 1);
}

// 生成确定性伪 CRC（基于数据内容）
function generateDeterministicCrc(dataBytes, canId, bitLen) {
  let crc = canId ^ 0xFFFF;
  for (const byte of dataBytes) {
    crc = ((crc << 8) ^ byte) ^ ((crc >> 8) ? 0xA001 : 0);
    crc &= 0xFFFF;
  }
  return Array.from({ length: bitLen }, (_, i) => (crc >> i) & 1);
}

function encodeCanFdFrame(st) {
  const canId = parseCanId(st.canId, 0x456);
  const dlc = clamp(parseInt(st.dlc, 10) || 16, 8, 64);

  // 解析数据
  const dataStr = (st.data || "").split(/\s+/).filter(x => x);
  const dataBytes = dataStr.slice(0, dlc).map(x => {
    try {
      const val = parseInt(x.toLowerCase().startsWith("0x") ? x.slice(2) : x, 16);
      return Number.isFinite(val) ? clamp(val, 0, 255) : 0;
    } catch { return 0; }
  });

  while (dataBytes.length < dlc) dataBytes.push(0);

  const levels = [];

  // IDLE 前缀
  for (let i = 0; i < 4; i++) levels.push(1);

  const sofStart = levels.length;
  levels.push(0); // SOF

  // 仲裁段：ID(11bit) + RTR(1) + IDE(1) + edl(1) + r0(1)
  const arbStart = levels.length;
  levels.push(...bitsLSB_n(canId, 11).reverse());
  levels.push(0); // RTR
  levels.push(0); // IDE
  levels.push(1); // EDL (1 = FD frame)
  levels.push(0); // r0

  // BRS 标记
  const brsStart = levels.length;
  const features = st.features || "none";
  if (features === "brs" || features === "both") {
    levels.push(0); // BRS = 1（启用比特率开关）
  } else {
    levels.push(1); // BRS = 0
  }

  // DLC(4bit)
  const dlcCoded = Math.min(dlc, 64); // FD DLC 编码
  const dlcCode = dlcCoded <= 8 ? dlcCoded : 
                  dlcCoded <= 12 ? 9 :
                  dlcCoded <= 16 ? 10 :
                  dlcCoded <= 20 ? 11 :
                  dlcCoded <= 32 ? 12 :
                  dlcCoded <= 48 ? 13 : 14;
  const dlcStart = levels.length;
  levels.push(...bitsLSB_n(dlcCode, 4).reverse());

  // 数据段：更高速率区域（模拟）
  const dataSegStart = levels.length;
  for (let i = 0; i < dlc; i++) {
    const bits = bitsLSB_n(dataBytes[i], 8).reverse();
    levels.push(...bits);
  }

  // CRC(16bit in FD)
  const crcStart = levels.length;
  const crcBits = generateDeterministicCrc(dataBytes, canId, 16);
  levels.push(...crcBits);

  // CRC Del + ACK
  levels.push(1); // CRC delimiter
  const ackStart = levels.length;
  levels.push(0); // ACK
  levels.push(1); // ACK delimiter

  // EOF(7bit)
  const eofStart = levels.length;
  for (let i = 0; i < 7; i++) levels.push(1);

  // 后缀 IDLE
  for (let i = 0; i < 4; i++) levels.push(1);

  return {
    levels,
    segments: [
      { start: 0, end: sofStart + 1, color: "#ff6600", label: "SOF" },
      { start: arbStart, end: brsStart + 1, color: "#6ea8ff", label: "Arb" },
      { start: brsStart, end: brsStart + 1, color: "#ffbb00", label: "BRS" },
      { start: dlcStart, end: dlcStart + 4, color: "#45d483", label: "DLC" },
      { start: dataSegStart, end: crcStart, color: "#d46aff", label: `DATA(${dlc*8}b)` },
      { start: crcStart, end: ackStart, color: "#ff8866", label: "CRC(16)" },
      { start: ackStart, end: eofStart, color: "#ffbb00", label: "ACK" },
      { start: eofStart, end: levels.length, color: "#aaaaaa", label: "EOF" }
    ]
  };
}

export function renderFdcanTiming(App, svgEl, hintEl) {
  const st = App.state.fdcan;
  const frame = encodeCanFdFrame(st);

  const signals = [
    { 
      name: "CANH", 
      levels: frame.levels,
      stroke: "var(--ok)" 
    },
    { 
      name: "CANL", 
      levels: frame.levels.map(x => 1 - x),
      stroke: "var(--danger)" 
    }
  ];

  renderDigitalTiming(svgEl, signals, {
    width: 1200,
    height: 360,
    cells: frame.levels.length,
    progress: App.progress,
    rowH: 74,
    segments: frame.segments
  });

  // 提示
  const features = st.features || "none";
  const dlc = clamp(parseInt(st.dlc, 10) || 16, 8, 64);
  const dataRate = st.dataBaudrate || 4000000;

  let featureTip = "";
  if (features === "brs") {
    featureTip = "✓ BRS 启用：数据段在 " + (dataRate / 1000) + "kbps 传输（仲裁段保持 500kbps）。";
  } else if (features === "esi") {
    featureTip = "✓ ESI 启用：尾部可添加错误状态指示位。";
  } else if (features === "both") {
    featureTip = "✓ BRS+ESI 同时启用：高速数据 + 错误指示。";
  } else {
    featureTip = "无特殊特性，仅增加数据载荷。";
  }

  hintEl.textContent = `FD-CAN 帧结构 (${dlc}B): SOF → Arb → BRS → DLC → DATA → CRC → ACK → EOF。${featureTip}`;
}
