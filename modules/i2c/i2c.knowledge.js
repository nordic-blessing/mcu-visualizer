export function knowledgeForI2c(){
  return {
    title:"I²C（开漏总线）",
    principle:"SCL/SDA 都是开漏 + 上拉；Start/Stop 在 SCL 高期间由 SDA 边沿产生；ACK 是第 9 拍拉低 SDA。",
    use:"传感器、EEPROM、OLED 等低速外设。",
    cautions:"上拉电阻与总线电容决定上升沿；多主机/时钟拉伸要处理；地址冲突要规划。"
  };
}

export function glossaryForI2c(st){
  return `<span class="tag">Start</span>SCL=高时 SDA 下降；<span class="tag">Stop</span>SCL=高时 SDA 上升。<br><span class="tag">ACK</span>第 9 拍 SDA=0 确认。`;
}
