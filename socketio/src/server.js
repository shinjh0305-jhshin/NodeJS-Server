//웹소켓의 backend

const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const morgan = require('morgan');
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
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
    socket.on("enter_room", (roomname, changeVisibility) =>{ //changeVisibility : 프런트에서 전달받은 콜백함수를 프런트에서 실행한다.
        changeVisibility();
        console.log(roomname); //sogang(채팅방 이름)
        console.log(socket.id); //0l8Ik2Vp_m7KxlS8AAAB(primary key of the socket)
        console.log(socket.rooms); //Set(1) { '0l8Ik2Vp_m7KxlS8AAAB' } (sogang에 참여하기 전에는 '나' 채팅방 존재)
        socket.join(roomname); //sogang에 입장
        console.log(socket.rooms); //Set(2) { '0l8Ik2Vp_m7KxlS8AAAB', 'sogang' } ('나'와 'sogang'모두 존재)
    });
})


httpServer.listen(app.get("port"), () => {
    console.log(`Server running on ${app.get("port")}`);
})
