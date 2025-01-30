const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DOMAIN = 'http://localhost';

const logger = require('./logger');
const { addLink, getLink } = require('./database');

// Short URL code generator
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
        // CSS file
        fs.readFile(path.join(__dirname, 'public', 'style.css'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('CSS not found');
            }
            res.writeHead(200, { 'Content-Type': 'text/css' });
            res.end(data);
        });

    } else if (req.url === '/script.js' && req.method === 'GET') {
        // script.js file
        fs.readFile(path.join(__dirname, 'public', 'script.js'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('JavaScript file not found');
            }
            res.writeHead(200, { 'Content-Type': 'application/javascript' });
            res.end(data);
        });

    } else if (req.url === '/about.html' && req.method === 'GET') {
        // About page
        fs.readFile(path.join(__dirname, 'views', 'about.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server error');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });

    } else if (req.url === '/shrink' && req.method === 'POST') {
        // Form submission
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

            const code = generateCode();
            addLink(code, longUrl, (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error saving to database');
                }

                const shortUrl = `${DOMAIN}:${PORT}/goto/${code}`;
                logger.log('SHRINK', `New URL: ${longUrl} -> ${shortUrl}`);

                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(shortUrl);
            });
        });

    } else if (req.url.startsWith('/goto/') && req.method === 'GET') {
        // Redirect to long URL
        const code = req.url.replace('/goto/', '');

        getLink(code, (err, longUrl) => {
            if (err || !longUrl) {
                logger.log('ERROR', `Invalid short URL accessed: ${req.url}`);
                fs.readFile(path.join(__dirname, 'views', '404.html'), 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Server error');
                    }
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(data);
                });
            } else {
                logger.log('REDIRECT', `Redirecting ${DOMAIN}:${PORT}/goto/${code} to ${longUrl}`);
                res.writeHead(302, { 'Location': longUrl });
                res.end();
            }
        });

    } else {
        // 404 Not Found
        fs.readFile(path.join(__dirname, 'views', '404.html'), 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Server error');
            }
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }
});

// Start the server
server.listen(PORT, () => {
    logger.log('INFO', `Server is running at ${DOMAIN}:${PORT}`);
});
