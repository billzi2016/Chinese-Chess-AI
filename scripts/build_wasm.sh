#!/usr/bin/env bash
# ElephantEye 象眼 C++ 引擎编译为 WebAssembly 脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ELEEYE_DIR="$PROJECT_ROOT/third-party/eleeye"
WORKER_DIR="$PROJECT_ROOT/js/worker"

echo "开始使用 Emscripten (emcc) 编译 ElephantEye 象眼 C++ 引擎为 WebAssembly..."

emcc -O3 \
  -I"$ELEEYE_DIR/base" \
  -I"$ELEEYE_DIR/eleeye" \
  "$ELEEYE_DIR/base/pipe.cpp" \
  "$ELEEYE_DIR/eleeye/book.cpp" \
  "$ELEEYE_DIR/eleeye/eleeye.cpp" \
  "$ELEEYE_DIR/eleeye/evaluate.cpp" \
  "$ELEEYE_DIR/eleeye/genmoves.cpp" \
  "$ELEEYE_DIR/eleeye/hash.cpp" \
  "$ELEEYE_DIR/eleeye/movesort.cpp" \
  "$ELEEYE_DIR/eleeye/position.cpp" \
  "$ELEEYE_DIR/eleeye/preeval.cpp" \
  "$ELEEYE_DIR/eleeye/pregen.cpp" \
  "$ELEEYE_DIR/eleeye/search.cpp" \
  "$ELEEYE_DIR/eleeye/ucci.cpp" \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s MODULARIZE=1 \
  -s EXPORT_NAME="createEleeyeModule" \
  -s EXPORTED_FUNCTIONS='["_init_eleeye_engine","_execute_ucci_command","_main"]' \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
  -o "$WORKER_DIR/eleeye.js"

echo "象眼 WebAssembly 编译完成：$WORKER_DIR/eleeye.js 与 $WORKER_DIR/eleeye.wasm"
