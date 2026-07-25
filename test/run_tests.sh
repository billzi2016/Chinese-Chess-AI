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
echo "-> 运行 [1/3] xiangqi.js 规则引擎测试..."
node "$SCRIPT_DIR/test_xiangqi.js"
echo ""

# 2. 运行 Worker UCCI 解析器单元测试
echo "-> 运行 [2/3] Worker UCCI 日志解析器测试..."
node "$SCRIPT_DIR/test_worker_parser.js"
echo ""

# 3. 运行 server.py HTTP 服务器与 COOP/COEP 测试
echo "-> 运行 [3/3] server.py 静态服务器与响应头测试..."
python3 "$SCRIPT_DIR/test_server.py"
echo ""

echo "=========================================="
echo "     所有单元测试已成功通过 (ALL PASS)     "
echo "=========================================="
