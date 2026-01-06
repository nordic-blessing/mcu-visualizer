import { $$ } from "./app.js";

export function initRouter(App, onRoute){
  window.addEventListener("hashchange", ()=> route(App, onRoute));
  route(App, onRoute);

  // keep active state in sync
  $$(".nav-item").forEach(a=>{
    a.addEventListener("click", ()=>{
      const p = a.dataset.page;
      location.hash = "#" + p;
    });
  });
}

export function setPage(page){
  location.hash = "#" + page;
}

function route(App, onRoute){
  const hash = (location.hash || "#gpio").slice(1);
  const page = App.modules[hash] ? hash : "gpio";
  onRoute(page);
}
