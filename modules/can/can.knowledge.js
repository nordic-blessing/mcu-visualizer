export function knowledgeForCan(st) {
  return {
    title: "CAN（控制器局域网）",
    principle: "两条差分线（CANH/CANL），显性位(0)覆盖隐性位(1)；所有节点同时接收，通过 ID 过滤。仲裁基于 NRZ 编码的逐位优先级。",
    use: "汽车 CAN-BUS（发动机、变速箱、制动控制）、工业设备、医疗器械。",
    cautions: "总线共享需仲裁机制；ID 冲突会导致数据错误；120Ω 终端电阻必须准确；干扰会引起位错误。"
  };
}

export function glossaryForCan(st) {
  const frameType = st.frameType || "standard";
  const idLen = frameType === "extended" ? "29" : "11";
  const idBits = frameType === "extended" ? "扩展帧" : "标准帧";
  return `
    <span class="tag">仲裁</span>多节点同时发送时，CAN 控制器硬件竞争：显性位(0V)覆盖隐性位(3.5V)。
    <br><span class="tag">位时间</span>由波特率决定（通常 1Mbps = 1µs/位）。
    <br><span class="tag">帧类型</span>${idBits}（ID: ${idLen}位）。
    <br><span class="tag">DLC</span>数据长度编码（0~8字节）。
  `;
}
