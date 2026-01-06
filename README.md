# MCU Visualizer

一个用于可视化 MCU 外设与总线交互的轻量级前端工具，基于静态 HTML/JS/CSS。适合用于教学、演示与原型验证。

**主要功能**
- 可视化外设模块（GPIO、UART、SPI、I2C、CAN、FDCAN 等）的连线与时序。
- 模块化结构，便于扩展和添加新外设。
- 轻量、零后端依赖：直接打开 `index.html` 即可使用。

**项目结构（主要文件/目录）**
- `index.html`：应用入口页面。
- `core/`：核心逻辑（`app.js`、`router.js`、`timing.js`）。
- `modules/`：各外设模块目录（`gpio/`、`uart/`、`spi/`、`i2c/`、`can/`、`fdcan/`）。
- `style/`：样式文件（`theme.css`）。

**快速开始**
1. 克隆或下载本仓库到本地。
2. 直接用浏览器打开仓库根目录下的 `index.html` 即可查看和交互。  
   - 推荐使用本地静态服务器以避免部分浏览器对本地文件的限制，例如使用 Python：

```bash
# 若安装了 Python 3
python -m http.server 8000
# 然后在浏览器访问 http://localhost:8000
```

**开发**
- 代码均为原生 JavaScript（ES6 模块风格），可在 `modules/` 下添加或修改外设实现。
- 请遵循已有模块命名与文件组织规范：每个外设包含 `*.circuit.js`、`*.js`、`*.knowledge.js`、`*.timing.js` 四类文件。

**贡献**
欢迎提交 issue 或 pull request。请在 PR 中说明变更目的并尽量保持变更小且可复现。

**许可与联系方式**
- 本项目未指定特定开源许可，请在使用或发布前联系作者确认许可信息。  
- 若需联系或有问题，请在仓库 issue 中留言。

---

如果你想要更详细的使用示例、截图或添加项目徽章（tests/CI/licence），我可以继续完善文档。