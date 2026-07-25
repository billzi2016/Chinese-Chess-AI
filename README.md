# Chinese-Chess-AI (Web 象眼 WASM 版中国象棋对弈系统)

`Chinese-Chess-AI` 是一款零后端开销、纯前端运行的现代化中国象棋对弈应用。象眼引擎（ElephantEye）通过 WebAssembly (WASM) 纯本地运行，配合 Web Worker 单核并行计算，保持主 UI 线程 60fps 顺畅响应。

---

## 1. 核心亮点

* **零服务器算力开销**：象眼引擎（Eleeye）编译为 WebAssembly，在玩家本地浏览器内高效运行。
* **主线程零卡顿**：引擎计算任务放入 Web Worker，单核密集计算不阻塞主界面交互。
* **防“屎山” CSS 模块化体系**：采用 Design Tokens (CSS 原生变量) + 局部作用域组件拆分，彻底杜绝硬编码与样式混乱。
* **真实 AI 搜索评估面板**：侧边栏实时解析 UCCI 文本流，展示步数、落子方、来源、着法、搜索深度 (depth)、节点数 (nodes)、NPS (每秒节点数)、用时 (time) 与评估分数 (score)，**绝不伪造任何假数据**。

---

## 2. 本地开发服务器启动

项目内置多进程并发静态开发服务器 [server.py](server.py)，固定绑定 **`6324`** 端口，并自动配置 WASM 所需的 Cross-Origin 隔离响应头 (COOP/COEP)：

```bash
# 启动多进程并发服务器 (默认 6324 端口)
python3 server.py

# 启动后访问地址：
# http://127.0.0.1:6324/
```

---

## 3. 技术架构与解耦分层

应用遵循 **“视图 UI - 业务裁判 - 算力引擎” 三层解耦架构**：

```text
+---------------------------------------------------------+
|                    Web UI (视图层)                       |
|  xiangqiboard.js (DOM 棋盘/动画) + Modern Clean CSS       |
+----------------------------+----------------------------+
                             | (事件: 尝试落子)
                             v
+---------------------------------------------------------+
|                 xiangqi.js (规则裁判层)                 |
|  校验着法合法性 / 维护 FEN 状态 / 判断将军与胜负        |
+----------------------------+----------------------------+
                             | (PostMessage: FEN + 'go movetime 5000')
                             v
+---------------------------------------------------------+
|              Web Worker (后台算力桥接层)                 |
|  eleeye.js + eleeye.wasm (象眼引擎，限制 5s 思考)      |
+---------------------------------------------------------+
```

---

## 3. 致谢与引用的开源项目 (Open Source Attributions)

本项目离不开以下优秀开源项目的贡献与支持，特此表达由衷致谢：

### 3.1 核心算力引擎：ElephantEye (象眼)
* **项目名称**：ElephantEye (象眼中国象棋引擎)
* **原作者**：黄晨 (Morning Yellow)
* **源码位置**：`third-party/eleeye`
* **开源协议**：**GNU Lesser General Public License v2.1 (LGPL v2.1)**
* **说明**：提供精密的中国象棋 UCCI 通信协议、位棋盘 (Bitboard) 评估函数与 Alpha-Beta 剪枝搜索核心。

### 3.2 规则校验库：xiangqi.js
* **项目名称**：xiangqi.js
* **原作者**：Jeff Hlywa (jhlywa) & lengyanyu258
* **项目地址**：[https://github.com/lengyanyu258/xiangqi.js](https://github.com/lengyanyu258/xiangqi.js)
* **源码位置**：`third-party/xiangqi.js`
* **开源协议**：**BSD 2-Clause License**
* **说明**：提供标准中国象棋 FEN 解析、着法生成算法、别马腿与塞象眼限制及将军/困毙检测。

### 3.3 棋盘渲染视图库：xiangqiboardjs
* **项目名称**：xiangqiboardjs
* **原作者**：Chris Oakman & lengyanyu258
* **项目地址**：[https://github.com/lengyanyu258/xiangqiboardjs](https://github.com/lengyanyu258/xiangqiboardjs)
* **源码位置**：`third-party/xiangqiboardjs`
* **开源协议**：**MIT License**
* **说明**：提供 DOM 9x10 中国象棋棋盘绘制、像素坐标转换、拖拽落子与走法预判高亮逻辑。

### 3.4 UI 结构与视觉参考：Othello-AI (ui_example)
* **项目名称**：Othello-AI (黑白棋 AI)
* **原作者**：billzi2016
* **项目地址**：[https://github.com/billzi2016/Othello-AI](https://github.com/billzi2016/Othello-AI)
* **源码位置**：`ui_example` (仅作为本地设计参考，已被 `.gitignore` 排除)
* **说明**：本项目的 DOM 节点组织、深色科技风侧边栏 (`#ai-panel`)、开局遮罩菜单 (`#board-options`) 及响应式 CSS 样式布局均参考该项目的优秀设计。

---

## 4. 项目规范与说明文档

* [specs/prd.md](specs/prd.md)：产品需求文档 (PRD)，包含项目架构、功能优先级、CSS Token 规范与 UCCI 通信协议。
* [specs/ui.md](specs/ui.md)：UI 界面与交互设计规范，详细定义页面组件、多级菜单遮罩与侧边 AI 评估面板。
* [specs/project_tree.md](specs/project_tree.md)：项目目录结构说明，明确各模块与文件的定位职责。

---

## 5. 开源许可证与合规声明

本项目整体遵循与象眼引擎原作者保持完全一致的 **LGPL v2.1** 开源协议。所有引入的第三方开源项目版权均归原作者所有，并各自遵循其原生的开源授权许可（LGPL v2.1, BSD 2-Clause, MIT）。

完整协议全文请参阅项目根目录下的 `LICENSE` 文件。
