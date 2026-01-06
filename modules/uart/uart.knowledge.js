export function knowledgeForUart(){
  return {
    title:"UART（异步串口）",
    principle:"无时钟线，双方约定波特率；空闲高，起始位低，数据位，校验位（可选），停止位高。",
    use:"调试日志、模块通信（GPS/蓝牙/4G 等）。",
    cautions:"波特率误差会导致采样漂移；噪声/地弹会引入乱码；RS232/RS485 需电平转换/收发器。"
  };
}

export function glossaryForUart(st){
  return `
    <span class="tag">帧</span>IDLE → START → DATA(${st.dataBits}) → ${st.parity==="N"?"(无校验)":"PARITY"} → STOP(${st.stopBits})
    <br><span class="tag">LSB</span>UART 通常 LSB 先发（示意）。
  `;
}
