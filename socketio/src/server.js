//웹소켓의 backend

const express = require('express');
const http = require('http');
const Websocket = require('ws');
const morgan = require('morgan');
const { json } = require('express');
const app = express();

app.set("port", 3000 || process.env.PORT);
app.set('views', './src/views');
app.set('view engine', 'pug');


app.use(morgan('dev'));
app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('home');
})

//http와 websocket 모두 사용하기 위해서 websocket에 http 서버를 전달해줬다.
const server = http.createServer(app);
const wss = new Websocket.Server({ server });

const sockets = []; //fake database

wss.on("connection", (socket) => {
    sockets.push(socket); //sockets에 socket 객체(접속 정보)를 저장한다.
    socket.nickname = "Anonymous";
    console.log("Connected to browser");
    //socket.send("Hello!!");
    socket.on("close", () => {
        console.log("Disconnected from Browser");
    });
    socket.on("message", (msg) => {
        const message = JSON.parse(msg);
        switch(message.type) {
            case "nickname" :
                socket.nickname = message.payload; //소켓에 nickname이라는 키를 추가한다.
                break;
            case "new_message" :
                sockets.forEach(item => item.send(`${socket.nickname}: ${message.payload}`));
                break;
        }
    })
});

server.listen(app.get("port"), () => {
    console.log(`Server running on ${app.get("port")}`);
})
// app.listen(app.get("port"), () => {
//     console.log(`Server running on ${app.get("port")}`);
// })