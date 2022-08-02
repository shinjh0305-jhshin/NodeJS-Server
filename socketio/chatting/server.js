//웹소켓의 backend

const express = require('express');
const http = require('http');
const Server = require('socket.io').Server;
const instrument = require('@socket.io/admin-ui').instrument;
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
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
});

instrument(wsServer, { auth: false })

function publicRooms() {
    const sids = wsServer.sockets.adapter.sids;
    const rooms = wsServer.sockets.adapter.rooms;

    const publicRooms = [];
    rooms.forEach((_, key) => {
        if(sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    })

    return publicRooms;
}

function countUser(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket.nickname = "Anonymous";
    socket.emit("room_change", publicRooms());
    socket.on("enter_room", (roomname, changeVisibility) =>{ //changeVisibility : 프런트에서 전달받은 콜백함수를 프런트에서 실행한다.
        //console.log(roomname); //sogang(채팅방 이름)
       // console.log(socket.id); //0l8Ik2Vp_m7KxlS8AAAB(primary key of the socket)
        //console.log(socket.rooms); //Set(1) { '0l8Ik2Vp_m7KxlS8AAAB' } (sogang에 참여하기 전에는 '나' 채팅방 존재)
        socket.join(roomname); //sogang에 입장
        changeVisibility(countUser(roomname));
        //console.log(socket.rooms); //Set(2) { '0l8Ik2Vp_m7KxlS8AAAB', 'sogang' } ('나'와 'sogang'모두 존재)
        socket.to(roomname).emit("welcome", socket.nickname, countUser(roomname)); //roomname에 있는 소켓들에만 전파
        wsServer.sockets.emit("room_change", publicRooms()); //global namespace이하의 모든 소켓에 전파한다.
    });
    socket.on("disconnecting", () => { //연결이 해제되기 직전에 호출됨
        socket.rooms.forEach(roomname => socket.to(roomname).emit("bye", socket.nickname, countUser(roomname) - 1));
    });
    socket.on("disconnect", () => { //연결 해제 직후 호출됨
        wsServer.sockets.emit("room_change", publicRooms());
    })
    socket.on("new_message", (message, roomname, addMessage) => {
        socket.to(roomname).emit("new_message", `${socket.nickname}: ${message}`);
        addMessage();
    });
    socket.on("nickname", (nickname) => {
        socket.nickname = nickname;
    });
})


httpServer.listen(app.get("port"), () => {
    console.log(`Server running on ${app.get("port")}`);
})
