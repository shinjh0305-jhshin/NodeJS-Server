const http = require('http');
const fs = require('fs/promises')

const server = http.createServer(async (req, res) => {
    try {
        const file = await fs.readFile('./index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(file);
    } catch (e) { 
        console.error(e);
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(e.message);
    }
})

server.listen(8080, () => {console.log('server running on port 8080')});