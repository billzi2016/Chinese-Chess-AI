#!/usr/bin/env bash
# 一键运行项目所有单元测试

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "      Chinese-Chess-AI 全量单元测试      "
echo "=========================================="
echo ""

# 1. 运行 xiangqi.js 规则引擎单元测试
echo "-> 运行 [1/5] xiangqi.js 规则引擎测试..."
node "$SCRIPT_DIR/test_xiangqi.js"
echo ""

# 2. 运行 Worker UCCI 解析器单元测试
echo "-> 运行 [2/5] Worker UCCI 日志解析器测试..."
node "$SCRIPT_DIR/test_worker_parser.js"
echo ""

# 3. 运行 ElephantEye WebAssembly (WASM) 引擎单元测试
echo "-> 运行 [3/5] eleeye.wasm 象眼 WASM 引擎测试..."
node "$SCRIPT_DIR/test_eleeye_wasm.js"
echo ""

# 4. 运行 6324 端口服务器启动与能力测试
echo "-> 运行 [4/5] 6324 端口服务器启动与处理测试..."
python3 "$SCRIPT_DIR/test_server_launch.py"
echo ""

# 5. 运行对当前在 6324 端口运行的真实服务的探测测试
echo "-> 运行 [5/5] 运行中 6324 服务探针测试..."
python3 "$SCRIPT_DIR/test_running_server.py"
echo ""

echo "=========================================="
echo "     所有单元测试已成功通过 (ALL PASS)     "
echo "=========================================="
