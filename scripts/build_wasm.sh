#!/usr/bin/env bash
# 象眼 (ElephantEye) C++ 引擎 WebAssembly 编译脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

OUT_DIR="$PROJECT_ROOT/js/worker"
mkdir -p "$OUT_DIR"

echo "开始使用 Emscripten (emcc) 编译 ElephantEye 象眼 C++ 引擎为 WebAssembly..."

emcc -O3 \
  -s WASM=1 \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s EXIT_RUNTIME=0 \
  -s MODULARIZE=0 \
  -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","FS"]' \
  -I"$PROJECT_ROOT/third-party/eleeye/base" \
  -I"$PROJECT_ROOT/third-party/eleeye/eleeye" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/eleeye.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/position.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/search.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/evaluate.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/genmoves.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/hash.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/movesort.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/book.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/preeval.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/pregen.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/eleeye/ucci.cpp" \
  "$PROJECT_ROOT/third-party/eleeye/base/pipe.cpp" \
  -o "$OUT_DIR/eleeye.js"

echo "象眼 WebAssembly 编译完成：$OUT_DIR/eleeye.js 与 $OUT_DIR/eleeye.wasm"
