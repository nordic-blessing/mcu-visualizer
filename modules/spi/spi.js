import { renderSpiCircuit } from "./spi.circuit.js";
import { renderSpiTiming } from "./spi.timing.js";
import { knowledgeForSpi, glossaryForSpi } from "./spi.knowledge.js";

const spi = {
  id:"spi",
  title:"SPI 时序（示例）",
  subtitle:"CS 选通窗口内同步移位；CPOL/CPHA 决定采样边沿（示意）。",
  configHint:"此处按“窗口+节拍”示意，重点是 CS 有效区与 CPOL/CPHA 的含义。",
  config:[
    { key:"mode", label:"模式（CPOL/CPHA）", type:"select", options:[[0,"Mode 0 (0,0)"],[1,"Mode 1 (0,1)"],[2,"Mode 2 (1,0)"],[3,"Mode 3 (1,1)"]] },
    { key:"mosi", label:"MOSI（hex）", type:"text", placeholder:"0x9A" },
    { key:"miso", label:"MISO（hex）", type:"text", placeholder:"0x3F" },
  ],
  defaultState(){ return { mode:3, mosi:"0x9A", miso:"0x3F" }; },
  onConfigChange(st, key, value){
    if(key==="mode") st.mode = parseInt(value,10);
  },
  getKnowledge(){ return knowledgeForSpi(); },
  getGlossary(st){ return glossaryForSpi(st); },
  renderCircuit(App, svgEl, hintEl){ renderSpiCircuit(App, svgEl, hintEl); },
  renderTiming(App, svgEl, hintEl){ renderSpiTiming(App, svgEl, hintEl); },
};

export default spi;
