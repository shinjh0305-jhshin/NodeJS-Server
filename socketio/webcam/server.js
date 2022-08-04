//웹소켓의 backend

const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const morgan = require('morgan');
const app = express();

app.set("port", 3000 || process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use('/public', express.static(__dirname + '/public'))

app.get('/', (req, res) => {
    res.render('home');
})

//http와 websocket 모두 사용하기 위해서 websocket에 http 서버를 전달해줬다.
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("join_room", (roomName) => {
        socket.join(roomName);
        socket.to(roomName).emit("welcome");
    });
    socket.on("offer", (offer, roomName) => { //기존 사용자가 발송한 offer 이벤트를 해당 채팅방의 다른 사용자에게 전파
        socket.to(roomName).emit("offer", offer);
    });
    socket.on("answer", (answer, roomName) => {
        socket.to(roomName).emit("answer", answer);
    })
})

httpServer.listen(app.get("port"), () => {
    console.log(`Server running on ${app.get("port")}`);
})
