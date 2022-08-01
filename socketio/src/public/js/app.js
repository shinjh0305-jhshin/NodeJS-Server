//웹소켓의 frontend

const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick');
const messageForm = document.querySelector('#message');
const socket = new WebSocket(`ws://${window.location.host}`); //window.location.host : 프런트에서 접속한 주소

socket.addEventListener("open", () => { //서버와 연결되었을 때
    console.log("Connected to server");
})

socket.addEventListener("message", (message) => { //서버로부터 메시지를 전달받았을 때
    const li = document.createElement('li');
    li.innerText = message.data;
    messageList.append(li);
    //console.log(message);
})

socket.addEventListener("close", () => { //서버와 연결이 종료되었을 때
    console.log("Disconnected from Server");
})

function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

function handleSubmit(event) {
    event.preventDefault(); 
    const input = messageForm.querySelector('input');
    socket.send(makeMessage("new_message", input.value));
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector('input');
    socket.send(makeMessage("nickname", input.value));
    input.value = "";
}

nickForm.addEventListener("submit", handleNickSubmit);
messageForm.addEventListener("submit", handleSubmit);