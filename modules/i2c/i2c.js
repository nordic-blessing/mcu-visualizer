import { renderI2cCircuit } from "./i2c.circuit.js";
import { renderI2cTiming } from "./i2c.timing.js";
import { knowledgeForI2c, glossaryForI2c } from "./i2c.knowledge.js";

const i2c = {
  id:"i2c",
  title:"I²C 时序（示例）",
  subtitle:"开漏 + 上拉；Start/Stop/ACK 是 I²C 的灵魂。",
  configHint:"此处为示意：每 bit 用 2 个采样格（SCL 低/高），便于观察 SDA 稳定区与 ACK。",
  config:[
    { key:"addr", label:"7-bit 地址（hex）", type:"text", placeholder:"0x3C" },
    { key:"rw", label:"R/W", type:"select", options:[[0,"写(0)"],[1,"读(1)"]] },
    { key:"data", label:"数据（hex）", type:"text", placeholder:"0xA0" },
    { key:"ack", label:"ACK", type:"select", options:[["ack","ACK(0)"],["nack","NACK(1)"]] },
  ],
  defaultState(){ return { addr:"0x3C", rw:0, data:"0xA0", ack:"ack" }; },
  onConfigChange(st, key, value){
    if(key==="rw") st.rw = parseInt(value,10);
  },
  getKnowledge(){ return knowledgeForI2c(); },
  getGlossary(st){ return glossaryForI2c(st); },
  renderCircuit(App, svgEl, hintEl){ renderI2cCircuit(App, svgEl, hintEl); },
  renderTiming(App, svgEl, hintEl){ renderI2cTiming(App, svgEl, hintEl); },
};

export default i2c;
