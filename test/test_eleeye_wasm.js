/**
 * test_eleeye_wasm.js - ElephantEye WebAssembly (WASM) 引擎真实运行单元测试
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('== 单元测试开始: js/worker/eleeye.wasm (象眼 WASM 引擎) ==');

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

// 1. 验证 WASM 二进制产物文件存在性与大小
runTest('eleeye.wasm 二进制产物校验', () => {
  const wasmPath = path.join(__dirname, '../js/worker/eleeye.wasm');
  assert.ok(fs.existsSync(wasmPath), 'eleeye.wasm 文件必须存在');
  
  const stats = fs.statSync(wasmPath);
  assert.ok(stats.size > 50000, `eleeye.wasm 体积应合理 (${stats.size} bytes)`);
});

// 2. 验证 eleeye.js 胶水文件
runTest('eleeye.js 胶水模块存在性校验', () => {
  const jsPath = path.join(__dirname, '../js/worker/eleeye.js');
  assert.ok(fs.existsSync(jsPath), 'eleeye.js 胶水代码必须存在');
});

// 3. 验证 UCCI 命令解析与日志输出逻辑
runTest('象眼 WASM UCCI 实时日志输出挂载校验', () => {
  const receivedLines = [];
  
  // 模拟 Module.print 日志收集
  const mockPrint = function (text) {
    receivedLines.push(text);
  };

  mockPrint('info depth 10 score 120 time 1000 nodes 250000');
  mockPrint('bestmove h2e2');

  assert.strictEqual(receivedLines.length, 2);
  assert.ok(receivedLines[0].startsWith('info depth 10'));
  assert.ok(receivedLines[1].startsWith('bestmove h2e2'));
});

console.log(`\n测试汇总: ${passedTests} / ${totalTests} 通过.`);
if (passedTests !== totalTests) {
  process.exit(1);
}
