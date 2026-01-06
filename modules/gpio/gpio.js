import { renderGpioCircuit } from "./gpio.circuit.js";
import { renderGpioTiming } from "./gpio.timing.js";
import { knowledgeForGpio, glossaryForGpio } from "./gpio.knowledge.js";

/* 模式归类 */
function modeKind(mode){
  if(mode === "analog") return "analog";
  if(String(mode).startsWith("in_")) return "input";
  if(mode === "af") return "af";
  return "output";
}

/* 哪些模式需要上拉/下拉电阻（教学层面：只在这些模式出现） */
function needsPullRes(mode){
  return ["in_pu","in_pd","od_out_pu","od_out_pd"].includes(mode);
}

const gpio = {
  id:"gpio",
  title:"GPIO 模式可视化",
  subtitle:"选择 GPIO 模式与负载/信号源，观察电路等效、电平变化与电流流动。",
  configHint:"输入/开漏相关模式才会显示上拉/下拉电阻（典型值）。",

  config:[
    {
      key:"mode",
      label:"模式",
      type:"select",
      options:[
        ["pp_out","输出：推挽（Push-Pull）"],
        ["od_out_pu","输出：开漏 + 上拉"],
        ["od_out_pd","输出：开漏 + 下拉"],
        ["in_float","输入：浮空"],
        ["in_pu","输入：上拉"],
        ["in_pd","输入：下拉"],
        ["af","复用功能（AF）"],
        ["analog","模拟（Analog）"],
      ]
    },

    {
      key:"wave",
      label:"信号（示例）",
      type:"select",
      options:(st)=>{
        const k = modeKind(st.mode);

        if(k === "analog") return [
          ["sine","正弦"],
          ["dc","直流"],
        ];

        if(k === "input") return [
          ["button","按键"],
          ["square","外部方波"],
          ["pulse","外部脉冲"],
        ];

        // output / af
        return [
          ["square","方波"],
          ["pulse","脉冲"],
          ["glitch","毛刺"],
        ];
      }
    },

    /* ✅ 只在相关模式显示；✅ 固定典型值，不再提供“无意义的调节” */
    {
      key:"rpull",
      label:"上/下拉电阻（典型）",
      type:"select",
      options: [
        ["10k", "10 kΩ（典型）"]
      ],
      showIf:(st)=> needsPullRes(st.mode)
    },

    {
      key:"load",
      type:"select",
      label:(st)=>{
        const k = modeKind(st.mode);
        if(k==="output") return "负载";
        if(k==="input")  return "输入源";
        return "信号源";
      },
      options:(st)=>{
        const k = modeKind(st.mode);

        if(k==="output") return [
          ["none","无"],
          ["led_to_gnd","LED → GND（高点亮）"],
          ["led_to_vcc","LED → VCC（低点亮）"],
          ["ext_sink","外部数字负载"],
        ];

        if(k==="input") return [
          ["button_to_gnd","按键 → GND（按下=0）"],
          ["button_to_vcc","按键 → VCC（按下=1）"],
          ["ext_src","外部数字信号源"],
          ["none","无（悬空）"],
        ];

        // analog
        return [
          ["analog_src","模拟信号源（ADC）"],
          ["none","无"],
        ];
      }
    }
  ],

  defaultState(){
    return {
      mode:"pp_out",
      wave:"square",
      rpull:"10k",          // ✅ 固定典型值
      load:"led_to_gnd"
    };
  },

  onConfigChange(st, key, value){
    if(key === "mode"){
      const k = modeKind(value);

      // ✅ 无论什么模式，都保持 rpull 为典型值（即便字段隐藏）
      st.rpull = "10k";

      if(k==="output"){
        // 输出模式默认用 LED 负载
        st.load = "led_to_gnd";
        if(!["square","pulse","glitch"].includes(st.wave)) st.wave="square";
      }

      if(k==="input"){
        // 输入模式默认按键输入源
        st.load = "button_to_gnd";
        if(!["button","square","pulse"].includes(st.wave)) st.wave="button";
      }

      if(k==="analog"){
        st.load = "analog_src";
        st.wave = "sine";
      }

      if(k==="af"){
        st.load = "none";
      }
    }

    if(key === "load"){
      // 选择模拟源 → 自动切到模拟
      if(value === "analog_src"){
        st.mode = "analog";
        st.wave = "sine";
        st.rpull = "10k";
      }

      // 选择按键/外部数字信号源 → 自动切到输入（默认上拉更常见）
      if(value.startsWith("button") || value === "ext_src"){
        if(!String(st.mode).startsWith("in_")) st.mode="in_pu";
        st.wave = "button";
        st.rpull = "10k";
      }
    }

    // rpull 不需要做任何逻辑（固定选项）
  },

  getKnowledge(st){ return knowledgeForGpio(st); },
  getGlossary(st){ return glossaryForGpio(st); },

  renderCircuit(App, svgEl, hintEl){
    renderGpioCircuit(App, svgEl, hintEl);
  },
  renderTiming(App, svgEl, hintEl){
    renderGpioTiming(App, svgEl, hintEl);
  }
};

export default gpio;
