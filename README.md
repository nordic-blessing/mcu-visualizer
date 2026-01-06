# MCU Visualizer

轻量级的 MCU 外设与总线交互可视化工具（前端静态项目）。适用于教学、原型演示和功能验证。

## 主要特点

- 模块化外设可视化：包含 GPIO、UART、SPI、I2C、CAN、FDCAN 等模块。
- 时序与连线展示，便于观察外设之间的交互。
- 前端静态项目：核心为 HTML/原生 ES6 JavaScript/CSS，易于扩展。

## 仓库概览

- `index.html` — 应用入口。
- `core/` — 应用核心：`app.js`、`router.js`、`timing.js` 等。
- `modules/` — 各外设实现子目录（每个外设含 circuit/logic/knowledge/timing 文件）。
- `style/` — 样式文件（如 `theme.css`）。

## 快速开始（推荐）

> 注意：本项目使用 ES 模块，直接用 `file://` 打开 `index.html` 会产生模块加载或同源策略问题。

- 在开发机器上使用 VS Code Live Server

- 在 VS Code 打开项目，右键 `index.html` -> "Open with Live Server"，或使用 Live Server 的命令面板。

## 贡献

- 欢迎提交 issue 与 PR。请在 PR 描述中说明变更意图并尽量将改动拆小。
