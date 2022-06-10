const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write('<h1>Node.js로 만든 가장 간단한 서버</h1>');
    res.end('<p>made by 재현신</p>') //실제로 주는 응답이다. res.sendFile, res.send, res.json등도 사용 가능하다.
})
.listen(8080, () => { //8080 포트에서 대기하라는 지시. listen 하자마자 listening 이벤트를 전파한다.
    console.log('Server running on port 8080');
})

server.on('listening', () => { //on은 node에서 이벤트 핸들러를 등록하는 역할을 한다. listening 이벤트를 캐치한다.
    console.log('listening event has been emitted');
})
server.on('error', () => {
    console.error(error);
})