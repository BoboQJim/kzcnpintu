#!/bin/bash
set -Eeuo pipefail

PORT=5000

# 获取项目根目录
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLIC_DIR="${PROJECT_DIR}/public"

cd "${PROJECT_DIR}"

kill_port_if_listening() {
    local port=$1
    local pids=$(ss -H -lntp 2>/dev/null | awk -v port="${port}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | grep -v '^$' | paste -sd' ' - || true)
    if [[ -n "${pids}" ]]; then
      echo "Killing PIDs: ${pids}"
      echo "${pids}" | xargs -I {} kill -9 {} 2>/dev/null || true
      sleep 1
    fi
}

kill_port_if_listening ${PORT}

echo "> Starting static server on port ${PORT}..."
echo "> Project: ${PROJECT_DIR}"
echo "> Public:  ${PUBLIC_DIR}"

# 使用 Node.js 静态文件服务器
node << 'NODESCRIPT'
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.env.PORT || '5000', 10);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
};

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    
    // 安全检查
    if (urlPath.includes('..')) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    let filePath = path.join(PUBLIC_DIR, urlPath);
    
    // 默认 index.html
    if (urlPath === '/' || urlPath === '') {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    if (!fs.existsSync(filePath)) {
      // 尝试 index.html
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(indexPath));
      } else {
        res.writeHead(404);
        res.end('Not Found: ' + urlPath);
      }
      return;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // 目录 -> index.html
      const indexPath = path.join(filePath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(indexPath));
      } else {
        res.writeHead(403);
        res.end('Directory listing not allowed');
      }
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } catch (err) {
    console.error('Error:', err.message);
    res.writeHead(500);
    res.end('Server Error');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`> Server ready at http://localhost:${PORT}`);
});
NODESCRIPT
