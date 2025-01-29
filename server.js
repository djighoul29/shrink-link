const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DOMAIN = 'http://localhost';

// Generate short URL code
function generateCode() {
    const CHARKIT = [
        ...Array.from({ length: 10 }, (_, i) => String.fromCharCode(48 + i)), // 0-9
        ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
        ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i))  // a-z
    ].join('');
    let code = '';
    for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * CHARKIT.length);
        code += CHARKIT[randomIndex];
    }
    return code;
}

// Read & Write to JSON file. Create the file if it doesn't exist
function readLinks() {
    const filePath = path.join(__dirname, 'data', 'links.json');

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}, null, 2), 'utf8');
        console.log('Created links.json as it did not exist.');
    }

    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading or parsing links.json:', error);
        return {};
    }
}

function saveLinks(links) {
    fs.writeFileSync(path.join(__dirname, 'data', 'links.json'), JSON.stringify(links, null, 2), 'utf8');
}

// Server creation
const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        // Main page
        fs.readFile(path.join(__dirname, 'views', 'index.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server error');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.url === '/style.css' && req.method === 'GET') {
        // Serve style.css
        fs.readFile(path.join(__dirname, 'public', 'style.css'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('CSS not found');
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });
    } else if (req.url === '/script.js' && req.method === 'GET') {
        // Serve script.js
        fs.readFile(path.join(__dirname, 'public', 'script.js'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('JavaScript file not found');
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });
    } else if (req.url === '/shrink' && req.method === 'POST') {
        // Form processing
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = new URLSearchParams(body);
            const longUrl = params.get('longUrl');

            if (!longUrl) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('Bad Request: No URL provided');
            }

            const links = readLinks();
            const code = generateCode();
            links[code] = longUrl;
            saveLinks(links);

            const shortUrl = `${DOMAIN}:${PORT}/${code}`;
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(shortUrl);
        });
    } else if (req.url.startsWith('/') && req.method === 'GET') {
        // Redirection
        const code = req.url.slice(1);
        const links = readLinks();

        if (links[code]) {
            res.writeHead(302, { 'Location': links[code] });
            res.end();
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found: Invalid short URL');
        }
    } else {
        // 404
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running at ${DOMAIN}:${PORT}`);
});
