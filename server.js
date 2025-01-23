const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;

// Generate short URL code
function generateCode() {
    return crypto.randomBytes(3).toString('hex'); // 6 symbols
}

// Read & Write to JSON file
function readLinks() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'links.json'), 'utf8');
        return JSON.parse(data);
    } catch {
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

            res.writeHead(302, { 'Location': `/${code}` });
            res.end();
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
    console.log(`Server is running at http://localhost:${PORT}`);
});
