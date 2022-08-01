//웹소켓의 frontend

const socket = io();
const welcome = document.querySelector('#welcome');
const room = document.getElementById('room');
const form = welcome.querySelector('form');
let roomName;

room.hidden = true;

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector('h3');
    h3.innerText = `Room ${roomName}`
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = form.querySelector('input');
    socket.emit("enter_room", input.value, showRoom); //emits event(Event name : enter_room), param #3 : 백엔드에서 호출 가능한 함수를 콜백으로 전달해준다.
    roomName = input.value;
    input.value = '';
}

form.addEventListener('submit', handleRoomSubmit);
