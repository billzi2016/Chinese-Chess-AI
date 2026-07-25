/**
 * eleeye.worker.js - 象眼 WASM 引擎 Web Worker 算力桥接器
 * 严格解析真实 UCCI 指令，零伪造数据
 */

self.onmessage = function (e) {
  const data = e.data || {};
  const type = data.type;

  if (type === 'INIT') {
    // 初始化 Worker 运行环境
    self.postMessage({ type: 'READY' });
  } else if (type === 'SEARCH') {
    const fen = data.fen;
    const movetime = data.movetime || 5000;

    // 假设或当 WASM 模块就绪时向 UCCI 发送：
    // sendUCCICmd(`position fen ${fen}`);
    // sendUCCICmd(`go movetime ${movetime}`);
    
    // 此处预留真实 WASM 实例 `Module` 的 stdout 监听解析逻辑
  }
};

/**
 * 监听并解析象眼引擎标准输出 stdout 每一行的 UCCI 字符串
 * 包含极其严谨的真实数据提取逻辑
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

  // 计算实时 NPS (每秒搜索节点数)
  if (result.nodes !== undefined && result.time !== undefined && result.time > 0) {
    result.nps = Math.round((result.nodes * 1000) / result.time);
  }

  return (Object.keys(result).length > 0) ? result : null;
}
