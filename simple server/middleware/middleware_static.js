//img, css, js 등 static file의 경로를 저장한다.
const express = require('express');
const app = express();

app.set('port', process.env.PORT || 8080);
//static은 상대 경로이므로, node 실행을 외부 디렉토리에서 할 경우, 문제가 발생할 수 있다.
app.use(express.static(__dirname + '/img'));  //반드시 절대 경로로 취급한다.

try {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    })
} catch (e) {
    console.error(e);
    res.send(e.message);
}

app.listen(8080, () => {
    console.log('server running on 8080');
})