/**
 * eleeye.worker.js - 象眼 WASM 引擎 Web Worker 算力桥接器
 * 严格连接真实象眼 WASM 实例与 UCCI 协议，零伪造数据
 */

var wasmModule = null;
var searchPending = null;

// 使用 Emscripten 工厂模式异步初始化象眼 WASM 模块
try {
  importScripts('eleeye.js');
  if (typeof createEleeyeModule === 'function') {
    createEleeyeModule({
      noInitialRun: true,
      print: function (text) {
        if (!text) return;
        handleEngineStdoutLine(text);
      },
      printErr: function (text) {
        console.warn('[ElephantEye WASM Engine Log]', text);
      }
    }).then(function (mod) {
      wasmModule = mod;
      if (typeof wasmModule.ccall === 'function') {
        wasmModule.ccall('init_eleeye_engine', null, [], []);
      }
      self.postMessage({ type: 'READY' });
      if (searchPending) {
        executeSearch(searchPending.fen, searchPending.movetime);
        searchPending = null;
      }
    }).catch(function (err) {
      console.error('象眼 WASM 模块实例化失败:', err);
    });
  }
} catch (e) {
  console.error('加载 eleeye.js 胶水代码失败:', e);
}

self.onmessage = function (e) {
  const data = e.data || {};
  const type = data.type;

  if (type === 'INIT') {
    if (wasmModule) {
      self.postMessage({ type: 'READY' });
    }
  } else if (type === 'SEARCH') {
    const fen = data.fen;
    const movetime = data.movetime || 5000;

    if (!wasmModule) {
      searchPending = { fen: fen, movetime: movetime };
    } else {
      executeSearch(fen, movetime);
    }
  }
};

// 向 WASM 象眼引擎发送 UCCI 指令
function sendUCCICmdToEngine(cmd) {
  if (wasmModule && typeof wasmModule.ccall === 'function') {
    try {
      wasmModule.ccall('execute_ucci_command', null, ['string'], [cmd]);
    } catch (e) {
      console.error('发送 UCCI 指令到 WASM 引擎失败:', e);
    }
  }
}

function executeSearch(fen, movetime) {
  sendUCCICmdToEngine(`position fen ${fen}`);
  sendUCCICmdToEngine(`go movetime ${movetime}`);
}

/**
 * 监听并解析象眼引擎标准输出 stdout 每一行的 UCCI 字符串
 */
function handleEngineStdoutLine(line) {
  if (!line) return;
  const trimmed = line.trim();

  // 1. 解析 UCCI 实时搜索状态 info 消息
  if (trimmed.startsWith('info')) {
    const infoObj = parseUcciInfoLine(trimmed);
    if (infoObj) {
      self.postMessage({
        type: 'INFO',
        info: infoObj
      });
    }
  }

  // 2. 解析引擎最终决策 bestmove 消息
  if (trimmed.startsWith('bestmove')) {
    const parts = trimmed.split(/\s+/);
    const bestMove = parts[1]; // 例如 "h2e2"
    if (bestMove && bestMove !== '(none)' && bestMove !== 'nobestmove') {
      self.postMessage({
        type: 'BEST_MOVE',
        move: bestMove
      });
    }
  }
}

/**
 * 解析 UCCI info 文本流
 * 例如: "info depth 10 score 120 time 1500 nodes 350000 pv h2e2..."
 */
function parseUcciInfoLine(line) {
  const tokens = line.split(/\s+/);
  const result = {};

  for (let i = 1; i < tokens.length; i += 2) {
    const key = tokens[i];
    const val = tokens[i + 1];

    if (key === 'depth') result.depth = parseInt(val, 10);
    else if (key === 'score') result.score = parseInt(val, 10);
    else if (key === 'time') result.time = parseInt(val, 10);
    else if (key === 'nodes') result.nodes = parseInt(val, 10);
  }

  if (result.nodes !== undefined && result.time !== undefined && result.time > 0) {
    result.nps = Math.round((result.nodes * 1000) / result.time);
  }

  return (Object.keys(result).length > 0) ? result : null;
}
