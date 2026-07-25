**English Version** | [中文文档](README_CN.md)

# Chinese-Chess-AI (WebAssembly-Powered High-Performance Xiangqi AI)

`Chinese-Chess-AI` is a modern, high-performance Chinese Chess (Xiangqi) gameplay and AI computation system running entirely on the front-end via WebAssembly (WASM). By cross-compiling a low-level C++ evaluation engine using Emscripten and leveraging Web Workers for complete decoupling of computation from the main UI thread, the application provides high-efficiency Alpha-Beta tree search and real-time UCCI analysis locally in the browser.

---

## 1. Technical Innovations & Engineering Highlights

* **C++ Engine to WebAssembly Cross-Compilation**:
  Uses the Emscripten toolchain to compile the C++ Xiangqi evaluation engine into WASM binary bytecode. Supports Zobrist Transposition Tables, Bitboard evaluation, and Quiescence Search, achieving pure local, high-efficiency Alpha-Beta pruning in the browser.

* **Web Worker Thread Decoupling & UCCI Protocol Streaming**:
  The computation-intensive WASM engine runs persistently inside a dedicated Web Worker, maintaining a smooth 60fps response on the main UI thread. Based on the Universal Chinese Chess Interface (UCCI) standard protocol, the system streams and parses engine output in real-time (`nodes`, `nps`, `time`, and `score`).

* **WASM Cross-Origin Isolation Server (COOP / COEP)**:
  Includes a multi-process Python development server that automatically injects `Cross-Origin-Opener-Policy: same-origin` (COOP) and `Cross-Origin-Embedder-Policy: require-corp` (COEP) headers, opening up high-precision Timers and an isolated memory runtime for WASM.

* **Native CSS Design System & Modular Architecture**:
  Utilizes native CSS variables (Design Tokens) combined with componentized style scoping, free of third-party UI framework overhead, delivering a visual interface that merges classical ink aesthetic with modern tech style.

* **Automated CI/CD Test Pipeline**:
  Integrates a GitHub Actions automated workflow including Node.js WASM real 6-depth search assertion tests, UCCI output regex parsing unit tests, web server response header probe verification, and rule engine compliance checks.

---

## 2. Core Highlights & Features

* **Zero Server Computation Cost**: The ElephantEye (Eleeye) engine is compiled to WebAssembly, running efficiently in the player's local browser.
* **Zero Main-Thread Lag**: Heavy engine computation is offloaded to Web Workers, ensuring single-core computation never blocks UI interaction.
* **Modular CSS Architecture**: Design Tokens (CSS native variables) + localized component scoping prevent hardcoding and style pollution.
* **Real-time AI Search Evaluation Panel**: The sidebar parses the UCCI text stream in real-time, displaying move number, side, source, notation, nodes count, NPS (Nodes Per Second), time, and evaluation score, **never displaying fake mock data**.

---

## 3. Local Development Server

The repository includes a multi-process static development server [server.py](server.py) bound to port **`6324`**, automatically configuring Cross-Origin Isolation headers (COOP/COEP) required for WASM:

```bash
# Start multi-process development server (default port 6324)
python3 server.py

# Access via browser:
# http://127.0.0.1:6324/
```

---

## 4. Architecture & Data Flow

The application follows a **"View UI - Business Rules - Engine Computation" 3-layer decoupled architecture**:

```text
+---------------------------------------------------------+
|                    Web UI (View Layer)                  |
|  xiangqiboard.js (DOM Board/River) + Modern Clean CSS   |
+----------------------------+----------------------------+
                             | (Event: Attempt Move)
                             v
+---------------------------------------------------------+
|                 xiangqi.js (Rule Engine)                |
|  Move Legal Verification / FEN State / Check & Mate     |
+----------------------------+----------------------------+
                             | (PostMessage: FEN + 'go movetime 5000')
                             v
+---------------------------------------------------------+
|              Web Worker (Computation Bridge)            |
|  eleeye.js + eleeye.wasm (WASM Engine, 5s Move Limit)   |
+---------------------------------------------------------+
```

---

## 5. Open Source Attributions & Compliance

This project is built upon the following open-source contributions:

### 5.1 Core Engine: ElephantEye (Eleeye)
* **Project Name**: ElephantEye (Eleeye Xiangqi Engine)
* **Original Author**: Morning Yellow (黄晨)
* **Source Location**: `third-party/eleeye`
* **License**: **GNU Lesser General Public License v2.1 (LGPL v2.1)**
* **Description**: Provides Xiangqi UCCI communication protocol, Bitboard evaluation functions, and Alpha-Beta pruning search core.

### 5.2 Rule Validation Library: xiangqi.js
* **Project Name**: xiangqi.js
* **Original Authors**: Jeff Hlywa (jhlywa) & lengyanyu258
* **Project Repository**: [https://github.com/lengyanyu258/xiangqi.js](https://github.com/lengyanyu258/xiangqi.js)
* **Source Location**: `third-party/xiangqi.js`
* **License**: **BSD 2-Clause License**
* **Description**: Provides standard Xiangqi FEN parsing, move generation, piece movement constraints, and checkmate detection.

### 5.3 Board Render Library: xiangqiboardjs
* **Project Name**: xiangqiboardjs
* **Original Authors**: Chris Oakman & lengyanyu258
* **Project Repository**: [https://github.com/lengyanyu258/xiangqiboardjs](https://github.com/lengyanyu258/xiangqiboardjs)
* **Source Location**: `third-party/xiangqiboardjs`
* **License**: **MIT License**
* **Description**: Provides DOM 9x10 Xiangqi board rendering, pixel coordinate mapping, and move hint highlight logic.

---

## 6. Specifications & Documentation

* [specs/prd.md](specs/prd.md): Product Requirement Document (PRD), detailing architecture, feature priority, CSS Tokens, and UCCI protocol.
* [specs/ui.md](specs/ui.md): UI & Interaction Specification, defining components, modal overlays, and AI evaluation panel.
* [specs/project_tree.md](specs/project_tree.md): Directory structure description specifying module responsibilities.

---

## 7. Open Source License

This project is licensed under the MIT License.

The overall project adheres strictly to the **LGPL v2.1** open-source license consistent with the original author of the ElephantEye engine. All third-party copyrights belong to their respective authors and abide by their original licenses (LGPL v2.1, BSD 2-Clause, MIT).
