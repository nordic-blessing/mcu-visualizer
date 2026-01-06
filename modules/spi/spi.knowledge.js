export function knowledgeForSpi(){
  return {
    title:"SPI（同步移位）",
    principle:"CS 选中后，SCK 提供节拍；MOSI/MISO 同步移位；CPOL/CPHA 决定采样与数据稳定区。",
    use:"高速外设：Flash、屏幕、ADC/DAC 等。",
    cautions:"线长/速率高要考虑串阻/阻抗/回流；模式不匹配会整体错位；多从机需独立 CS。"
  };
}
export function glossaryForSpi(st){
  const cpol = (st.mode===2 || st.mode===3) ? 1 : 0;
  const cpha = (st.mode===1 || st.mode===3) ? 1 : 0;
  return `<span class="tag">Mode</span>${st.mode}（CPOL=${cpol}, CPHA=${cpha}）<br><span class="tag">窗口</span>CS 低期间为有效传输窗口。`;
}
