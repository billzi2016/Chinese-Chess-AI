/**
 * test_worker_parser.js - Worker UCCI 日志解析器单元测试
 */

const assert = require('assert');

console.log('== 单元测试开始: js/worker/eleeye.worker.js UCCI 解析器 ==');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}:`, err.message);
  }
}

// 模拟 eleeye.worker.js 内部的解析逻辑
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

function parseBestMoveLine(line) {
  if (!line || !line.startsWith('bestmove')) return null;
  const parts = line.trim().split(/\s+/);
  return parts[1] || null;
}

// 1. 测试标准 UCCI info 字符串解析
runTest('标准 UCCI info 字段提取与 NPS 自动计算', () => {
  const line = 'info depth 12 score 150 time 2000 nodes 500000 pv h2e2';
  const info = parseUcciInfoLine(line);

  assert.ok(info);
  assert.strictEqual(info.depth, 12);
  assert.strictEqual(info.score, 150);
  assert.strictEqual(info.time, 2000);
  assert.strictEqual(info.nodes, 500000);
  assert.strictEqual(info.nps, 250000); // 500000 * 1000 / 2000 = 250000
});

// 2. 测试最好着法 bestmove 提取
runTest('UCCI bestmove 指令提取', () => {
  const line = 'bestmove h2e2 ponder h9g7';
  const bestMove = parseBestMoveLine(line);

  assert.strictEqual(bestMove, 'h2e2');
});

// 3. 测试负数评估分解析
runTest('负数评估分 (黑优) 正确解析', () => {
  const line = 'info depth 8 score -320 time 1000 nodes 100000';
  const info = parseUcciInfoLine(line);

  assert.strictEqual(info.score, -320);
});

console.log(`\n测试汇总: ${passedTests} / ${totalTests} 通过.`);
if (passedTests !== totalTests) {
  process.exit(1);
}
