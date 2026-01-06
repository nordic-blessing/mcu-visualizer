import { initRouter, setPage } from "./router.js";

import gpio from "../modules/gpio/gpio.js";
import uart from "../modules/uart/uart.js";
import i2c  from "../modules/i2c/i2c.js";
import spi  from "../modules/spi/spi.js";

export const App = {
  modules: { gpio, uart, i2c, spi },
  page: "gpio",
  playing: false,
  progress: 0,
  speed: 1.0,
  state: {
    gpio: gpio.defaultState(),
    uart: uart.defaultState(),
    i2c:  i2c.defaultState(),
    spi:  spi.defaultState(),
  }
};

export const $ = (s)=>document.querySelector(s);
export const $$ = (s)=>Array.from(document.querySelectorAll(s));
export const clamp = (x,a,b)=>Math.max(a,Math.min(b,x));

export function setPlaying(on){
  App.playing = !!on;
  document.body.classList.toggle("playing", App.playing);
}

export function setProgress(p){
  App.progress = clamp(p, 0, 1);
  $("#scrub").value = String(App.progress);
}

export function currentCell(cells){
  return clamp(Math.floor(App.progress * cells), 0, Math.max(0,cells-1));
}

function renderNavActive(){
  $$(".nav-item").forEach(a=>{
    a.classList.toggle("active", a.dataset.page === App.page);
  });
}

/* ================= 配置渲染（已增强） ================= */
function renderConfig(){
  const mod = App.modules[App.page];
  const st  = App.state[App.page];
  const area = $("#configArea");
  area.innerHTML = "";

  for(const f of mod.config){

    // ✅ 条件显示
    if(typeof f.showIf === "function" && !f.showIf(st)) continue;

    const wrap = document.createElement("div");
    wrap.className = "field";

    const lab = document.createElement("label");
    lab.textContent = (typeof f.label === "function") ? f.label(st) : f.label;

    let input;

    if(f.type === "select"){
      input = document.createElement("select");

      // ✅ options 支持函数
      const opts = (typeof f.options === "function") ? f.options(st) : f.options;

      for(const [val, text] of opts){
        const opt = document.createElement("option");
        opt.value = String(val);
        opt.textContent = String(text);
        input.appendChild(opt);
      }

      // 当前值非法 → 自动回正
      const values = new Set(opts.map(o=>String(o[0])));
      if(!values.has(String(st[f.key])) && opts.length){
        st[f.key] = String(opts[0][0]);
      }

      input.value = String(st[f.key]);

    }else if(f.type === "number"){
      input = document.createElement("input");
      input.type = "number";
      if(f.min!=null) input.min = String(f.min);
      if(f.max!=null) input.max = String(f.max);
      if(f.step!=null) input.step = String(f.step);
      input.value = String(st[f.key]);

    }else{
      input = document.createElement("input");
      input.type = "text";
      input.value = String(st[f.key] ?? "");
    }

    input.addEventListener("input", ()=>{
      mod.onConfigChange?.(st, f.key, input.value);
      if(f.type === "number") st[f.key] = parseFloat(input.value||"0");
      else st[f.key] = input.value;
      renderAll();
    });

    wrap.appendChild(lab);
    wrap.appendChild(input);
    area.appendChild(wrap);
  }

  $("#configHint").textContent = mod.configHint || "";
}

/* ================= 知识区 ================= */
function renderKnowledge(){
  const mod = App.modules[App.page];
  const st  = App.state[App.page];
  const k = mod.getKnowledge(st);

  $("#knowledgeBox").innerHTML = `
    <div class="kTitle">${k.title}</div>
    <div class="kRow"><div class="kKey">原理</div><div class="kVal">${k.principle}</div></div>
    <div class="kRow"><div class="kKey">用途</div><div class="kVal">${k.use}</div></div>
    <div class="kRow"><div class="kKey">注意</div><div class="kVal">${k.cautions}</div></div>
  `;

  $("#miniGlossary").innerHTML = mod.getGlossary(st);
}

export function renderAll(){
  const mod = App.modules[App.page];
  renderNavActive();
  $("#pageTitle").textContent = mod.title;
  $("#pageSubtitle").textContent = mod.subtitle;

  renderConfig();
  renderKnowledge();
  mod.renderCircuit(App, $("#circuitSvg"), $("#circuitHint"));
  mod.renderTiming(App, $("#timingSvg"), $("#timingHint"));
}

/* ================= UI 绑定 ================= */
function bindUI(){
  $("#themeBtn").addEventListener("click", ()=>{
    const cur = document.body.getAttribute("data-theme");
    document.body.setAttribute("data-theme", cur==="dark" ? "light" : "dark");
  });

  $("#playBtn").onclick  = ()=>setPlaying(true);
  $("#pauseBtn").onclick = ()=>setPlaying(false);
  $("#resetBtn").onclick = ()=>{
    setPlaying(false); setProgress(0); renderAll();
  };

  $("#speed").oninput = ()=>{
    App.speed = clamp(parseFloat($("#speed").value||"1"),0.2,4);
  };

  $("#scrub").oninput = ()=>{
    setPlaying(false);
    setProgress(parseFloat($("#scrub").value||"0"));
    const mod = App.modules[App.page];
    mod.renderCircuit(App, $("#circuitSvg"), $("#circuitHint"));
    mod.renderTiming(App, $("#timingSvg"), $("#timingHint"));
  };

  $$(".nav-item").forEach(a=>{
    a.onclick = ()=>{ if(App.modules[a.dataset.page]) setPage(a.dataset.page); };
  });
}

let lastT = performance.now();
function tick(t){
  const dt = (t-lastT)/1000;
  lastT = t;

  if(App.playing){
    App.progress += dt * 0.22 * App.speed;
    if(App.progress>1) App.progress=0;
    $("#scrub").value = String(App.progress);

    const mod = App.modules[App.page];
    mod.renderCircuit(App, $("#circuitSvg"), $("#circuitHint"));
    mod.renderTiming(App, $("#timingSvg"), $("#timingHint"));
  }
  requestAnimationFrame(tick);
}

/* ================= init ================= */
bindUI();
initRouter(App, page=>{
  App.page = page;
  setPlaying(false);
  setProgress(0);
  renderAll();
});

renderAll();
requestAnimationFrame(tick);
