//웹소켓의 frontend

const socket = io();
const welcome = document.querySelector('#welcome');
const room = document.getElementById('room');
const form = welcome.querySelector('form');
let roomName;

room.hidden = true;

function showRoom(users) {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName} (${users})`

    const msgForm = room.querySelector('#msg');
    const nameForm = room.querySelector('#name');

    msgForm.addEventListener('submit', handleMessageSubmit);
    nameForm.addEventListener('submit', handleNicknameSubmit);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector('input');
    socket.emit("enter_room", input.value, showRoom); //emits event(Event name : enter_room), param #3 : 백엔드에서 호출 가능한 함수를 콜백으로 전달해준다.
    roomName = input.value;
    input.value = '';
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('#msg input');
    const value = input.value;
    socket.emit("new_message", value, roomName, () => {
        addMessage(`You: ${value}`);
    })
    input.value = '';
}

function handleNicknameSubmit(event) {
    event.preventDefault();
    const input = room.querySelector('#name input');
    const value = input.value;
    socket.emit("nickname", value);
    input.value = '';
}

function addMessage(message) {
    const ul = room.querySelector('ul');
    const li = document.createElement('li');
    li.innerText = message;
    ul.appendChild(li);
}

form.addEventListener('submit', handleRoomSubmit);
socket.on("welcome", (nickname, users) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${users})`
    addMessage(`${nickname} joined the room`);
})
socket.on("bye", (nickname, users) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName} (${users})`
    addMessage(`${nickname} left the room`);
})
socket.on("new_message", (message) => {
    addMessage(message);
})
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector('ul');
    roomList.replaceChildren();

    if(rooms.length === 0) return;

    const temp = document.createDocumentFragment();
    rooms.forEach((room) => {
        const li = document.createElement('li');
        li.innerText = room;
        temp.appendChild(li);
    })
    roomList.appendChild(temp);
})