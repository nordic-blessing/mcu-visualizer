import { renderFdcanCircuit } from "./fdcan.circuit.js";
import { renderFdcanTiming } from "./fdcan.timing.js";
import { knowledgeForFdcan, glossaryForFdcan } from "./fdcan.knowledge.js";

const fdcan = {
  id:"fdcan",
  title:"FD-CAN 高速总线可视化",
  subtitle:"CAN FD 支持可变比特率和更大数据载荷，演示数据阶段的高速传输。",
  configHint:"CAN FD 允许数据段使用更高的波特率（仲裁段和数据段可分开配置）。",
  config:[
    { 
      key:"arbBaudrate", 
      label:"仲裁段波特率", 
      type:"select", 
      options:[[500000,"500 kbps"],[1000000,"1 Mbps"]] 
    },
    { 
      key:"dataBaudrate", 
      label:"数据段波特率（FD高速）", 
      type:"select", 
      options:[[2000000,"2 Mbps"],[4000000,"4 Mbps"],[5000000,"5 Mbps"]] 
    },
    { 
      key:"canId", 
      label:"CAN ID (Hex)", 
      type:"text", 
      placeholder:"0x456" 
    },
    { 
      key:"dlc", 
      label:"数据长度", 
      type:"select", 
      options:[[8,"8字节"],[12,"12字节"],[16,"16字节"],[20,"20字节"],[32,"32字节"],[48,"48字节"],[64,"64字节"]] 
    },
    { 
      key:"data", 
      label:"数据 (Hex)", 
      type:"textarea", 
      rows:5,
      placeholder:"支持多行输入，例如：\n0xDE 0xAD 0xBE 0xEF\n0x00 0x01 0x02 0x03\n0x04 0x05 0x06 0x07" 
    },
    {
      key:"features",
      label:"启用特性",
      type:"select",
      options:[
        ["none","无（仅数据填充）"],
        ["brs","BRS（比特率开关）"],
        ["esi","ESI（错误状态指示）"],
        ["both","同时启用 BRS+ESI"]
      ]
    }
  ],
  defaultState(){
    return { 
      arbBaudrate:500000, 
      dataBaudrate:4000000, 
      canId:"0x456", 
      dlc:16, 
      data:"0xDE 0xAD 0xBE 0xEF 0x00 0x01 0x02 0x03",
      features:"brs"
    };
  },
  onConfigChange(st, key, value){
    if(key==="arbBaudrate") st.arbBaudrate = parseInt(value,10);
    if(key==="dataBaudrate") st.dataBaudrate = parseInt(value,10);
    if(key==="dlc") st.dlc = parseInt(value,10);
    if(key==="canId") st.canId = value;
    if(key==="data") st.data = value;
    if(key==="features") st.features = value;
  },
  getKnowledge(st){ return knowledgeForFdcan(st); },
  getGlossary(st){ return glossaryForFdcan(st); },
  renderCircuit(App, svgEl, hintEl){ renderFdcanCircuit(App, svgEl, hintEl); },
  renderTiming(App, svgEl, hintEl){ renderFdcanTiming(App, svgEl, hintEl); },
};

export default fdcan;
