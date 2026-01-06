const K = {
  pp_out: {
    title:"GPIO 输出：推挽（Push-Pull）",
    principle:"上下管都可导通：能主动拉高，也能主动拉低。",
    use:"LED、普通数字输出、短线脉冲/时钟输出。",
    cautions:"不要多个推挽并联到同一线；外部强驱动会造成打架过流。"
  },
  od_out_pu: {
    title:"GPIO 输出：开漏 + 上拉",
    principle:"只能拉低；输出 1=高阻态，由上拉把线抬高。",
    use:"I²C、线与总线、多设备共享中断线。",
    cautions:"上升沿由 Rpull×C 决定；上拉太小费电、太大上升慢。"
  },
  od_out_pd: {
    title:"GPIO 输出：开漏 + 下拉",
    principle:"只能拉低或放手；默认通过下拉保持为 0。",
    use:"默认低的共享线（较少见）。",
    cautions:"高电平需要外部提供；确认系统逻辑是否允许默认低。"
  },
  in_float: {
    title:"GPIO 输入：浮空",
    principle:"无明确偏置，电平易受噪声/耦合影响。",
    use:"外部已有稳定电平源时。",
    cautions:"容易误触发，通常建议用上拉/下拉或施密特输入。"
  },
  in_pu: {
    title:"GPIO 输入：上拉",
    principle:"默认高，外部按键/开漏信号拉低触发。",
    use:"按键输入（按下=0）、开漏信号采样。",
    cautions:"长线注意 EMI；上拉过大抗干扰差，过小功耗高。"
  },
  in_pd: {
    title:"GPIO 输入：下拉",
    principle:"默认低，外部事件拉高触发。",
    use:"按键输入（按下=1）、默认低控制脚。",
    cautions:"同上：抗干扰与功耗需权衡。"
  },
  af: {
    title:"GPIO 模式：复用功能（AF）",
    principle:"引脚由外设控制（UART/SPI/PWM 等），GPIO 不再直接驱动。",
    use:"外设引脚映射。",
    cautions:"注意复用冲突与电气特性（速度、驱动、上拉下拉）。"
  },
  analog: {
    title:"GPIO 模式：模拟（Analog）",
    principle:"通常关闭数字输入缓冲与上下拉，降低漏电与噪声注入。",
    use:"ADC 输入、模拟复用。",
    cautions:"注意源阻抗与采样保持；不要把模拟脚当数字口用。"
  }
};

export function knowledgeForGpio(st){
  return K[st.mode] || K.pp_out;
}

export function glossaryForGpio(st){
  const parts = [];
  parts.push(`<span class="tag">当前</span>${K[st.mode]?.title || "GPIO"}`);
  if(st.mode.startsWith("in_")){
    parts.push(`<br><span class="tag">输入</span>输入模式下负载会切换为按键/外部源（不再显示 LED 驱动）。`);
  }
  if(st.mode==="analog"){
    parts.push(`<br><span class="tag">模拟</span>时序图显示连续波形；电路显示 ADC + 模拟源。`);
  }
  return parts.join("");
}
