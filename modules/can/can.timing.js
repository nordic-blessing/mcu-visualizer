import { renderDigitalTiming } from "../../core/timing.js";
import { currentCell, clamp } from "../../core/app.js";

function parseCanId(s, frameType, fallback = 0x123) {
  try {
    const t = String(s).trim().toLowerCase();
    const v = parseInt(t.startsWith("0x") ? t.slice(2) : t, 16);
    const maxId = frameType === "extended" ? 0x1FFFFFFF : 0x7FF;
    if (Number.isFinite(v)) return clamp(v, 0, maxId);
  } catch { }
  return fallback;
}

function bitsLSB_n(val, n) {
  return Array.from({ length: n }, (_, i) => (val >> i) & 1);
}

// 生成确定性伪 CRC（基于数据内容）
function generateDeterministicCrc(dataBytes, canId, bitLen) {
  // 简单的线性反馈算法：用数据和 ID 的哈希计算伪 CRC
  let crc = canId ^ 0xFFFF;
  for (const byte of dataBytes) {
    crc = ((crc << 8) ^ byte) ^ ((crc >> 8) ? 0xA001 : 0);
    crc &= 0xFFFF;
  }
  // 转换为位数组
  return Array.from({ length: bitLen }, (_, i) => (crc >> i) & 1);
}

export function renderCanTiming(App, svgEl, hintEl) {
  const st = App.state.can;

  const frameType = st.frameType || "standard";
  const idBits = frameType === "extended" ? 29 : 11;
  const canId = parseCanId(st.canId, frameType, 0x123);

  const dlc = clamp(parseInt(st.dlc, 10) || 4, 1, 8);
  
  // 简单解析数据
  const dataStr = (st.data || "").split(/\s+/).filter(x => x);
  const dataBytes = dataStr.slice(0, dlc).map(x => {
    try {
      const val = parseInt(x.toLowerCase().startsWith("0x") ? x.slice(2) : x, 16);
      return Number.isFinite(val) ? clamp(val, 0, 255) : 0;
    } catch { return 0; }
  });

  // 补零到 dlc 长度
  while (dataBytes.length < dlc) dataBytes.push(0);

  // 构建时序
  const levels = [];

  // 前缀填充（空闲）
  for (let i = 0; i < 6; i++) levels.push(1);

  const startOfFrame = levels.length;
  levels.push(0); // SOF

  // ID 字段
  const idStart = levels.length;
  levels.push(...bitsLSB_n(canId, idBits).reverse()); // CAN 用 MSB 先发

  // 控制位（简化：RTR, IDE 等）
  levels.push(0); // RTR = 0（数据帧）
  const controlStart = levels.length - 1;

  // DLC（数据长度编码，4位）
  const dlcStart = levels.length;
  const dlcBits = bitsLSB_n(dlc, 4).reverse();
  levels.push(...dlcBits);

  // 数据字段
  const dataStart = levels.length;
  for (let i = 0; i < dlc; i++) {
    const bits = bitsLSB_n(dataBytes[i], 8).reverse();
    levels.push(...bits);
  }

  // CRC 字段（基于数据和 ID 的确定性计算）
  const crcStart = levels.length;
  const crcLen = 15;
  const crcBits = generateDeterministicCrc(dataBytes, canId, crcLen);
  levels.push(...crcBits);

  // CRC 分隔符 & ACK 字段
  levels.push(1); // CRC delimiter
  const ackStart = levels.length;
  levels.push(0); // ACK slot (can be pulled low by receiver)
  levels.push(1); // ACK delimiter

  // 结束帧（7个隐性位）
  const eofStart = levels.length;
  for (let i = 0; i < 7; i++) levels.push(1);

  // 后缀填充（空闲）
  for (let i = 0; i < 6; i++) levels.push(1);

  // 生成信号
  const signals = [
    { 
      name: "CANH", 
      levels: levels,
      stroke: "var(--ok)" 
    },
    { 
      name: "CANL", 
      levels: levels.map(x => 1 - x),
      stroke: "var(--danger)" 
    }
  ];

  // 协议段着色
  const segments = [
    { 
      start: 0, 
      end: startOfFrame + 1, 
      color: "#ffaa00", 
      label: "IDLE" 
    },
    { 
      start: startOfFrame, 
      end: startOfFrame + 1, 
      color: "#ff6600", 
      label: "SOF" 
    },
    { 
      start: idStart, 
      end: controlStart + 2, 
      color: "#6ea8ff", 
      label: `ID(${idBits}bit)` 
    },
    { 
      start: dlcStart, 
      end: dlcStart + 4, 
      color: "#45d483", 
      label: "DLC" 
    },
    { 
      start: dataStart, 
      end: crcStart, 
      color: "#d46aff", 
      label: `DATA(${dlc*8}bit)` 
    },
    { 
      start: crcStart, 
      end: ackStart, 
      color: "#ff8866", 
      label: "CRC" 
    },
    { 
      start: ackStart, 
      end: eofStart, 
      color: "#ffbb00", 
      label: "ACK" 
    },
    { 
      start: eofStart, 
      end: levels.length, 
      color: "#aaaaaa", 
      label: "EOF" 
    }
  ];

  renderDigitalTiming(svgEl, signals, {
    width: 1200,
    height: 360,
    cells: levels.length,
    progress: App.progress,
    rowH: 74,
    segments: segments
  });

  // 提示
  const scenario = st.scenario || "single";
  const hints = {
    "single": `CAN 2.0 标准帧：SOF(1) → ID(11) → RTR(1) → IDE(1) → r0(1) → DLC(4) → DATA(${dlc*8}) → CRC(15) → ACK(2) → EOF(7)`,
    "collision": "仲裁过程：同时发送的节点逐位比较 ID，显性位(0)覆盖隐性位(1)，ID 较小的节点赢得总线。",
    "error": "错误帧：检测到协议错误时，任何节点可发送错误帧中止当前传输。"
  };
  hintEl.textContent = hints[scenario] || hints["single"];
}
