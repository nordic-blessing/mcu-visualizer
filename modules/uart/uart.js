import { renderUartCircuit } from "./uart.circuit.js";
import { renderUartTiming } from "./uart.timing.js";
import { knowledgeForUart, glossaryForUart } from "./uart.knowledge.js";

const uart = {
  id:"uart",
  title:"UART 时序（可配置）",
  subtitle:"配置数据位/校验/停止位，观察帧结构与协议解码着色（示意）。",
  configHint:"数据位决定数据长度；开启校验会插入 Parity；停止位会拉长 STOP 段。",
  config:[
    { key:"baud", label:"波特率（标注）", type:"select", options:[[9600,"9600"],[19200,"19200"],[115200,"115200"],[1000000,"1000000"]] },
    { key:"dataBits", label:"数据位", type:"select", options:[[5,"5"],[6,"6"],[7,"7"],[8,"8"],[9,"9"]] },
    { key:"parity", label:"校验", type:"select", options:[["N","None"],["E","Even"],["O","Odd"]] },
    { key:"stopBits", label:"停止位", type:"select", options:[[1,"1"],[1.5,"1.5（少见）"],[2,"2"]] },
    { key:"data", label:"数据（hex）", type:"text", placeholder:"0xA5" }
  ],
  defaultState(){
    return { baud:115200, dataBits:8, parity:"N", stopBits:1, data:"0xA5" };
  },
  onConfigChange(st, key, value){
    if(key==="dataBits") st.dataBits = parseInt(value,10);
    if(key==="stopBits") st.stopBits = parseFloat(value);
    if(key==="baud") st.baud = parseInt(value,10);
    if(key==="parity") st.parity = value;
  },
  getKnowledge(st){ return knowledgeForUart(); },
  getGlossary(st){ return glossaryForUart(st); },
  renderCircuit(App, svgEl, hintEl){ renderUartCircuit(App, svgEl, hintEl); },
  renderTiming(App, svgEl, hintEl){ renderUartTiming(App, svgEl, hintEl); },
};

export default uart;
