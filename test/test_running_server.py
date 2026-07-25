#!/usr/bin/env python3
"""
test_running_server.py - 专门测试当前已经在 6324 端口运行的真实开发服务器
"""

import unittest
import urllib.request


class TestRunningServer(unittest.TestCase):
    """直接探测测试已在 127.0.0.1:6324 端口运行的服务"""

    def setUp(self):
        self.url = "http://127.0.0.1:6324/index.html"

    def test_running_server_status_200(self):
        """测试已运行的 6324 服务返回 200 OK"""
        req = urllib.request.Request(self.url)
        with urllib.request.urlopen(req) as resp:
            self.assertEqual(resp.status, 200, "运行在 6324 端口的服务应返回 200 OK")

    def test_running_server_coop_coep_headers(self):
        """测试已运行的 6324 服务带有 WASM 跨源隔离响应头 (COOP/COEP)"""
        req = urllib.request.Request(self.url)
        with urllib.request.urlopen(req) as resp:
            headers = resp.headers
            self.assertEqual(headers.get("Cross-Origin-Opener-Policy"), "same-origin", "需带 COOP 隔离头")
            self.assertEqual(headers.get("Cross-Origin-Embedder-Policy"), "require-corp", "需带 COEP 隔离头")


if __name__ == "__main__":
    unittest.main(verbosity=2)
