/**
 * test_eleeye_wasm_real.js - 象眼 WASM 引擎真实算力搜索硬核集成测试
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

process.on('uncaughtException', (err) => {
  console.error('[未捕获异常]', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[未处理的 Promise 拒绝]', reason);
});

console.log('== 核心单元测试: 象眼 WASM C++ 引擎真实算力搜索 ==');

const workerDir = path.join(__dirname, '../js/worker');
process.chdir(workerDir);

const wasmPath = path.join(workerDir, 'eleeye.wasm');
const wasmBuffer = fs.readFileSync(wasmPath);

assert.ok(fs.existsSync(wasmPath), 'eleeye.wasm 二进制文件必须存在');

const capturedStdout = [];
let bestMoveReceived = null;
let infoCount = 0;

global.Module = {
  wasmBinary: wasmBuffer,
  locateFile: function (fileName) {
    return path.join(workerDir, fileName);
  },
  noInitialRun: true,
  print: function (text) {
    if (!text) return;
    capturedStdout.push(text);
    if (text.startsWith('info')) infoCount++;
    if (text.startsWith('bestmove')) {
      const parts = text.split(/\s+/);
      bestMoveReceived = parts[1];
    }
  }
};

require(path.join(workerDir, 'eleeye.js'));

setTimeout(() => {
  try {
    if (global.Module && typeof global.Module.ccall === 'function') {
      console.log('[WASM 运行时] 象眼 C++ 二进制模块已成功载入内存.');
      console.log('[测试 1] 调用 init_eleeye_engine() 初始化 C++ 评估内存...');
      global.Module.ccall('init_eleeye_engine', null, [], []);

      const startFen = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1';
      console.log(`[测试 2] 调用 execute_ucci_command("position fen ${startFen}")...`);
      global.Module.ccall('execute_ucci_command', null, ['string'], [`position fen ${startFen}`]);

      console.log('[测试 3] 调用 execute_ucci_command("go depth 6") 进行 6 层 Alpha-Beta 真实算力搜索...');
      const startTime = Date.now();
      global.Module.ccall('execute_ucci_command', null, ['string'], ['go depth 6']);
      const elapsedTime = Date.now() - startTime;

      console.log(`[引擎计算完成] 实际用时: ${elapsedTime}ms, 收集到 info 日志 ${infoCount} 条, 最佳着法: ${bestMoveReceived}`);

      assert.ok(infoCount > 0, '象眼 WASM 引擎在搜索中必须输出真实的 info 日志');
      assert.ok(bestMoveReceived, '象眼 WASM 引擎计算完成后必须返回有效的 bestmove');
      assert.ok(bestMoveReceived.length === 4, `bestmove 格式必须为 4 位 UCCI 坐标 (当前: ${bestMoveReceived})`);

      console.log('\n==========================================');
      console.log(' [PASS] 象眼 WASM 引擎真实算力测试完全成功!');
      console.log('==========================================\n');
      process.exit(0);
    } else {
      console.error('\n[FAIL] WASM ccall 尚未挂载, Module Keys:', Object.keys(global.Module));
      process.exit(1);
    }
  } catch (err) {
    console.error('\n[FAIL] WASM 真实算力测试失败:', err);
    process.exit(1);
  }
}, 500);
