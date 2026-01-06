export function knowledgeForFdcan(st) {
  return {
    title: "CAN FD（灵活数据速率）",
    principle: "向后兼容经典 CAN，但允许数据段使用更高的比特率。EDL 标志区分 FD 帧；BRS 动态切换速率；支持 8~64 字节数据。",
    use: "现代汽车（ADAS、智能驾驶）、工业物联网、实时嵌入式系统。",
    cautions: "混合网络中 CAN 2.0 节点会将 FD 帧识别为错误；数据率越高对 PCB 和电磁兼容性要求越严苛；需要 CAN FD 收发器。"
  };
}

export function glossaryForFdcan(st) {
  const dlc = st.dlc || 16;
  const arbRate = st.arbBaudrate || 500000;
  const dataRate = st.dataBaudrate || 4000000;
  const ratio = (dataRate / arbRate).toFixed(1);
  
  return `
    <span class="tag">EDL</span>Error Detection Line，FD 帧标志（1 = FD）。
    <br><span class="tag">BRS</span>Bit Rate Switch，启用后数据段加速到 ${dataRate/1000}kbps（比仲裁段快 ${ratio}倍）。
    <br><span class="tag">DLC</span>CAN FD 支持 ${dlc}B（最大 64B）；编码为 4 位但允许非线性映射。
    <br><span class="tag">向后兼容</span>CAN FD 节点可识别经典 CAN，反之则将 FD 当作错误帧。
  `;
}
