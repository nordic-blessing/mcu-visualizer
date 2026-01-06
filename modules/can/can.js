import { renderCanCircuit } from "./can.circuit.js";
import { renderCanTiming } from "./can.timing.js";
import { knowledgeForCan, glossaryForCan } from "./can.knowledge.js";

const can = {
  id:"can",
  title:"CAN 总线时序可视化",
  subtitle:"配置波特率和数据ID，观察仲裁、数据帧结构与多节点竞争。",
  configHint:"CAN 2.0标准帧（11位ID）；位时间由波特率决定；协议段着色显示仲裁、控制、数据区。",
  config:[
    { 
      key:"baudrate", 
      label:"波特率", 
      type:"select", 
      options:[[250000,"250 kbps"],[500000,"500 kbps"],[1000000,"1 Mbps"]] 
    },
    { 
      key:"frameType", 
      label:"帧类型", 
      type:"select", 
      options:[["standard","标准帧(11位ID)"],["extended","扩展帧(29位ID)"]] 
    },
    { 
      key:"canId", 
      label:"CAN ID (Hex)", 
      type:"text", 
      placeholder:"0x123" 
    },
    { 
      key:"dlc", 
      label:"数据长度", 
      type:"select", 
      options:[[1,"1字节"],[2,"2字节"],[4,"4字节"],[8,"8字节"]] 
    },
    { 
      key:"data", 
      label:"数据 (Hex)", 
      type:"textarea", 
      rows:4,
      placeholder:"支持多行输入，如：\n0x12 0x34 0x56 0x78\n0xAB 0xCD 0xEF" 
    },
    {
      key:"scenario",
      label:"演示场景",
      type:"select",
      options:[
        ["collision","总线竞争（仲裁过程）"],
        ["single","单帧传输"],
        ["error","错误帧注入"]
      ]
    }
  ],
  defaultState(){
    return { 
      baudrate:500000, 
      frameType:"standard", 
      canId:"0x123", 
      dlc:4, 
      data:"0x12 0x34 0x56 0x78",
      scenario:"single"
    };
  },
  onConfigChange(st, key, value){
    if(key==="baudrate") st.baudrate = parseInt(value,10);
    if(key==="frameType") st.frameType = value;
    if(key==="dlc") st.dlc = parseInt(value,10);
    if(key==="canId") st.canId = value;
    if(key==="data") st.data = value;
    if(key==="scenario") st.scenario = value;
  },
  getKnowledge(st){ return knowledgeForCan(st); },
  getGlossary(st){ return glossaryForCan(st); },
  renderCircuit(App, svgEl, hintEl){ renderCanCircuit(App, svgEl, hintEl); },
  renderTiming(App, svgEl, hintEl){ renderCanTiming(App, svgEl, hintEl); },
};

export default can;
