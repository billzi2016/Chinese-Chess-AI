# 项目目录结构说明 (Project Tree Specification)

## 1. 完整目录树

```text
Chinese-Chess-AI/
├── specs/                   # 项目规格与需求文档 (SDD 模式专用)
│   ├── prd.md               # 产品需求文档 (PRD)
│   ├── ui.md                # UI 界面与交互设计规范 (参考 ui_example)
│   └── project_tree.md      # 本文件: 项目目录结构说明
├── third-party/             # 第三方依赖与开源引擎源代码
│   └── eleeye/              # 象眼 (ElephantEye) C++ 源码仓库 (LGPL 2.1)
├── ui_example/              # UI 范例与参考代码 (被 .gitignore 排除)
├── styles/                  # 模块化 CSS 设计系统 (Design Tokens 架构)
│   ├── tokens.css           # 变量定义 (颜色、尺寸、动画、间距)
│   ├── base.css             # 基础与重置样式 (Reset & Typography)
│   ├── components/          # 组件局部样式
│   │   ├── layout.css       # 容器 Flexbox / Grid 响应式布局
│   │   ├── board.css        # 棋盘外壳修饰、棋子动画与走法高亮
│   │   ├── controls.css     # 对局控制按钮、仪表盘与时间进度条
│   │   └── modal.css        # FEN 导入/导出弹窗与对局胜负提示框
│   └── main.css             # 样式统一入口 (@import 汇总)
├── js/                      # 业务逻辑与核心模块
│   ├── xiangqiboard.js      # 棋盘 UI 渲染与拖拽/点击动画交互
│   ├── xiangqi.js           # 中国象棋规则裁判库 (合法性校验、FEN 维护)
│   ├── worker/              # Web Worker 算力桥接
│   │   ├── eleeye.worker.js # Web Worker 消息通信封装
│   │   ├── eleeye.js        # WASM 胶水代码 (Emscripten 生成)
│   │   └── eleeye.wasm      # 编译后的象眼引擎二进制核心
│   └── app.js               # 主应用入口，装配 UI、裁判与 Worker
├── index.html               # Web 页面主入口 (HTML5 语义化)
├── .gitignore               # Git 忽略文件配置
├── LICENSE                  # 开源协议许可全文 (LGPL v2.1)
└── README.md                # 项目介绍与开源声明
```

---

## 2. 核心模块与职责分工

### 2.1 需求规范 (`specs/`)
* **`prd.md`**：产品需求定义，涵盖零后端架构、5秒思考算力、CSS系统与UCCI协议。
* **`ui.md`**：UI 界面与交互设计规范，详细定义页面组件、多级菜单遮罩与侧边 AI 评估面板。
* **`project_tree.md`**：说明代码规范与目录划分。

### 2.2 依赖与参考 (`third-party/` & `ui_example/`)
* **`third-party/eleeye/`**：象眼引擎开源 C++ 源码。
* **`ui_example/`**：界面与交互参考（Git 忽略）。

### 2.3 模块化样式系统 (`styles/`)
* **`tokens.css`**：全局 Design Tokens 维护，拒绝魔法数字与硬编码样式。
* **`components/`**：高内聚组件样式分发，提升维护性。

### 2.4 业务逻辑层 (`js/`)
* **`xiangqiboard.js`**：DOM 渲染与用户交互响应。
* **`xiangqi.js`**：象棋着法生成器与裁判逻辑。
* **`worker/`**：多线程 WASM 密集计算，避免阻塞主 UI 线程。
