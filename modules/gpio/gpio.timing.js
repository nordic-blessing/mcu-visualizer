import { currentCell } from "../../core/app.js";
import { renderDigitalTiming, renderAnalogTiming } from "../../core/timing.js";
import { gpioAnalogValues, gpioDerivedDigital } from "./gpio.circuit.js";

export function renderGpioTiming(App, svgEl, hintEl){
  const st = App.state.gpio;

  // Analog timing
  if(st.mode==="analog" || st.load==="analog_src"){
    const v = gpioAnalogValues(st);
    const idx = currentCell(v.length);
    renderAnalogTiming(svgEl, [
      { name:"AIN", values:v, stroke:"var(--accent)" }
    ], { width:1200, height:360, cells:v.length, rowH:140, progress: App.progress });

    hintEl.innerHTML = `当前点 <span class="tag">#${idx}</span> 模拟值 <span class="tag">${v[idx].toFixed(2)}</span>（归一化 0..1）`;
    return;
  }

  const { out, line, drive } = gpioDerivedDigital(App);
  const idx = currentCell(out.length);

  renderDigitalTiming(svgEl, [
    { name:"外部/MCU", levels: out,  stroke:"var(--accent)" },
    { name:"线电平",  levels: line, stroke:"var(--ok)" }
  ], { width:1200, height:360, cells: out.length, rowH:92, progress: App.progress });

  hintEl.innerHTML =
    `当前格 <span class="tag">#${idx}</span> ` +
    `源=<span class="tag">${out[idx]}</span> ` +
    `线=<span class="tag">${line[idx]}</span> ` +
    `驱动=<span class="tag">${drive[idx]}</span>`;
}
