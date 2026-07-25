# Chinese-Chess-AI (WebAssembly 驱动的高性能中国象棋 AI 系统)

[English Version](README.md) | **中文文档**

**在线体验 (GitHub Pages)**: [https://billzi2016.github.io/Chinese-Chess-AI/](https://billzi2016.github.io/Chinese-Chess-AI/)

`Chinese-Chess-AI` 是一款采用纯前端技术构建、基于 WebAssembly (WASM) 单线程（性能足够，击败所有业余选手）运行的高性能中国象棋对弈与算力分析系统。系统通过 Emscripten 交叉编译底层 C++ 算力引擎，利用 Web Worker 实现计算线程与 UI 主线程的彻底解耦，在浏览器本地提供极高算力的 Alpha-Beta 树搜索与实时 UCCI 分析。

---

## 1. 核心技术创新与工程亮点

* **C++ Engine to WebAssembly 交叉编译**：
  使用 Emscripten 工具链将 C++ 象棋评估引擎编译为 WASM 二进制字节码，支持 Zobrist 随机数哈希置换表 (Transposition Table)、位棋盘 (Bitboard) 估值与静态搜寻 (Quiescence Search)，实现纯本地浏览器高效率 Alpha-Beta 剪枝算力。

* **Web Worker 线程解耦与 UCCI 协议解析**：
  计算密集型 WASM 引擎常驻运行在独立 Web Worker 线程中，主 UI 线程维持 60fps 顺畅响应。系统基于 Universal Chinese Chess Interface (UCCI) 标准通信协议，实时流式解析引擎标准输出（包含 `depth` 深度、`nodes` 节点数、`nps` 每秒搜索节点数、`time` 耗时与 `score` 评估分）。

* **WASM 跨源隔离 Web 服务 (COOP / COEP)**：
  内置 Python 多并发开发服务器，强制自动注入 `Cross-Origin-Opener-Policy: same-origin` (COOP) 与 `Cross-Origin-Embedder-Policy: require-corp` (COEP) 响应头，为 WASM 运行开辟高精度 Timer 与内存隔离运行环境。

* **原生 CSS Design System 模块化架构**：
  采用 CSS 原生变量 (Design Tokens) 配合组件化样式拆分，零第三方 UI 框架依赖，提供古风水墨与现代科技感融合的交互界面。

* **全量自动化 CI/CD 测试流水线**：
  集成 GitHub Actions 自动化流水线，包含 Node.js 环境下的 WASM 真实 6 层搜索断言测试、UCCI 协议流正则解析单元测试、Web 服务器响应头探针校验与规则引擎合规测试。

---

## 2. 核心亮点与设计特色

* **三种灵活对弈模式**：支持人人对战（Player vs Player）、人机对战（Player vs AI）、机机对决（AI vs AI）三种完整对弈模式。
* **业余顶峰战力与 16 层搜索深度**：基于经典象眼 (Eleeye) 引擎与 Alpha-Beta 剪枝，默认搜索深度达 **16 层**，达到大师级棋力实现业余全灭。
* **零服务器算力开销**：象眼引擎（Eleeye）编译为 WebAssembly，在玩家本地浏览器内高效运行。
* **主线程零卡顿**：引擎计算任务放入 Web Worker，单核密集计算不阻塞主界面交互。
* **防“屎山” CSS 模块化体系**：采用 Design Tokens (CSS 原生变量) + 局部作用域组件拆分，彻底杜绝硬编码与样式混乱。
* **真实 AI 搜索评估面板**：侧边栏实时解析 UCCI 文本流，展示步数、落子方、来源、着法、搜索深度 (depth)、节点数 (nodes)、NPS (每秒节点数)、用时 (time) 与评估分数 (score)，**绝不伪造任何假数据**。

---

## 3. 本地开发服务器启动

项目内置多进程并发静态开发服务器 [server.py](server.py)，固定绑定 **`6324`** 端口，并自动配置 WASM 所需的 Cross-Origin 隔离响应头 (COOP/COEP)：

```bash
# 启动多进程并发服务器 (默认 6324 端口)
python3 server.py

# 启动后访问地址：
# http://127.0.0.1:6324/
```

---

## 4. 技术架构与解耦分层

应用遵循 **“视图 UI - 业务裁判 - 算力引擎” 三层解耦架构**：

```text
+---------------------------------------------------------+
|                    Web UI (视图层)                       |
|  xiangqiboard.js (DOM 棋盘/楚河汉界) + Modern CSS        |
+----------------------------+----------------------------+
                             | (事件: 尝试落子)
                             v
+---------------------------------------------------------+
|                 xiangqi.js (规则裁判层)                 |
|  校验着法合法性 / 维护 FEN 状态 / 判断将军与困毙        |
+----------------------------+----------------------------+
                             | (PostMessage: FEN + 'go movetime 5000')
                             v
+---------------------------------------------------------+
|              Web Worker (后台算力桥接层)                 |
|  eleeye.js + eleeye.wasm (象眼引擎，限制 5s 思考)      |
+---------------------------------------------------------+
```

---

## 5. 致谢与引用的开源项目 (Open Source Attributions)

本项目离不开以下优秀开源项目的贡献与支持，特此表达由衷致谢：

### 5.1 核心算力引擎：ElephantEye (象眼)
* **项目名称**：ElephantEye (象眼中国象棋引擎)
* **原作者**：黄晨 (Morning Yellow)
* **源码位置**：`third-party/eleeye`
* **开源协议**：**GNU Lesser General Public License v2.1 (LGPL v2.1)**
* **说明**：提供精密的中国象棋 UCCI 通信协议、位棋盘 (Bitboard) 评估函数与 Alpha-Beta 剪枝搜索核心。

### 5.2 规则校验库：xiangqi.js
* **项目名称**：xiangqi.js
* **原作者**：Jeff Hlywa (jhlywa) & lengyanyu258
* **项目地址**：[https://github.com/lengyanyu258/xiangqi.js](https://github.com/lengyanyu258/xiangqi.js)
* **源码位置**：`third-party/xiangqi.js`
* **开源协议**：**BSD 2-Clause License**
* **说明**：提供标准中国象棋 FEN 解析、着法生成算法、别马腿与塞象眼限制及将军/困毙检测。

### 5.3 棋盘渲染视图库：xiangqiboardjs
* **项目名称**：xiangqiboardjs
* **原作者**：Chris Oakman & lengyanyu258
* **项目地址**：[https://github.com/lengyanyu258/xiangqiboardjs](https://github.com/lengyanyu258/xiangqiboardjs)
* **源码位置**：`third-party/xiangqiboardjs`
* **开源协议**：**MIT License**
* **说明**：提供 DOM 9x10 中国象棋棋盘绘制、像素坐标转换、拖拽落子与走法预判高亮逻辑。



---

## 6. 项目规范与说明文档

* [specs/prd.md](specs/prd.md)：产品需求文档 (PRD)，包含项目架构、功能优先级、CSS Token 规范与 UCCI 通信协议。
* [specs/ui.md](specs/ui.md)：UI 界面与交互设计规范，详细定义页面组件、多级菜单遮罩与侧边 AI 评估面板。
* [specs/project_tree.md](specs/project_tree.md)：项目目录结构说明，明确各模块与文件的定位职责。

---

## 7. 开源许可证与合规声明

本项目采用 MIT 许可证开源。

本项目整体遵循与象眼引擎原作者保持完全一致的 **LGPL v2.1** 开源协议。所有引入的第三方开源项目版权均归原作者所有，并各自遵循其原生的开源授权许可（LGPL v2.1, BSD 2-Clause, MIT）。

完整协议全文请参阅项目根目录下的 `LICENSE` 文件。
