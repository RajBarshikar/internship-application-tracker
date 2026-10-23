const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webapp': 'application/x-web-app-manifest+json',
  '.webmanifest': 'application/manifest+json'
};

const server = http.createServer((req, res) => {
  // Parse URL safely
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log('  InternTrack - Mobile Application Tracker Running! 📱');
  console.log('========================================================');
  console.log(`\n  Local Computer:   http://localhost:${PORT}`);
  
  const localIps = getLocalIpAddresses();
  if (localIps.length > 0) {
    console.log('\n  Open on your Girlfriend\'s Mobile Phone (same Wi-Fi):');
    localIps.forEach(ip => {
      console.log(`  👉  http://${ip}:${PORT}`);
    });
  }
  console.log('\n  Features active:');
  console.log('  - Light & Dark Theme');
  console.log('  - Applications List with time since application (days & hours)');
  console.log('  - Center "+" Quick Add Application');
  console.log('  - AI-Powered Tailored Email Generator with CV Context');
  console.log('  - Top-Right Profile Icon with Full Portfolio Website');
  console.log('  - 100% Local Device Persistence\n');
  console.log('========================================================\n');
});
