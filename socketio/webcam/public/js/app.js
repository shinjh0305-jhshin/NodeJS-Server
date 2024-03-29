//웹소켓의 frontend

const socket = io();

const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const cameraSelect = document.getElementById('cameras');
const call = document.getElementById('call');

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

///////////////////////////////
// 영상 스트림 설정과 관련된 코드 (시작점)
async function getCameras() { //현재 장치에 설치되어 있는 카메라에 대한 정보를 프론트에 뿌린다.
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((device) => device.kind === 'videoinput')
        const currentCamera = myStream.getVideoTracks()[0].label;
 
        const fragment = document.createDocumentFragment();
        cameras.forEach((camera) => {
            const option = document.createElement('option');
            option.value = camera.deviceId;
            option.innerText = camera.label;
            if (currentCamera == camera.label) {
                option.selected = true;
            }
            fragment.appendChild(option);
        })
        cameraSelect.appendChild(fragment);
    } catch (e) {
        console.error(e);
    }
}

async function getMedia(deviceId) { //초기 진입 및 카메라 변경 시, 스트림을 바꿔준다.
    try {
        myStream = await navigator.mediaDevices.getUserMedia({
            audio: true, 
            video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }
        })
        myFace.srcObject = myStream;
        if (!deviceId) { //초기 진입 시에는 인수에 카메라 id가 전달되지 않는다.
            await getCameras();
        }

        
    } catch(e) {
        console.log(e);
    }
}

function handleMuteClick() { //음소거 설정 및 해제
    myStream.getAudioTracks().forEach((track) => track.enabled = !track.enabled);
    if (!muted) {
        muteBtn.innerText = 'Unmute';
        muted = true;
    } else {
        muteBtn.innerText = 'Mute';
        muted = false;
    }
}

function handleCameraClick() { //카메라 설정 및 해제
    myStream.getVideoTracks().forEach((track) => track.enabled = !track.enabled);
    if (!cameraOff) {
        cameraBtn.innerText = 'Turn Camera On';
        cameraOff = true;
    } else {
        cameraBtn.innerHTML = 'Turn Camera Off';
        cameraOff = false;
    }
}

async function handleCameraChange() { //카메라의 스트림을 바꾸는 이벤트 처리 함수
    //console.log(cameraSelect.value);
    await getMedia(cameraSelect.value);
    if(myPeerConnection) {
        const newVideo = myStream.getVideoTracks()[0];
        const videoSender = myPeerConnection.getSenders()
        .find((sender) => sender.track.kind === 'video');
        videoSender.replaceTrack(newVideo);
    }
}

muteBtn.addEventListener('click', handleMuteClick);
cameraBtn.addEventListener('click', handleCameraClick);
cameraSelect.addEventListener('input', handleCameraChange);

// 영상 스트림 설정과 관련된 코드 (종료지점)
///////////////////////////////

///////////////////////////////
// 채팅방 입장 관련된 코드 (시작점)
const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');

call.hidden = true;

async function showMedia() { //채팅방 이름 입력 폼을 없애고, 채팅창(비디오)을 연다.
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection(); //RTCPeerConnection
}

async function handleWelcomeSubmit(event) { //채팅방 이름이 입력되면, 소켓 이벤트를 서버에 전파한다.
    event.preventDefault();
    const input = welcomeForm.querySelector('input');
    roomName = input.value;
    await showMedia(); //비디오 스트림을 받고, "RTC 객체를 생성한 뒤", 소켓 이벤트를 전파한다. 

    socket.emit("join_room", roomName);
    input.value = '';
}

welcomeForm.addEventListener('submit', handleWelcomeSubmit);


//socket
socket.on('welcome', async () => { //새로운 사용자가 입장했을 때, 기존 사용자에게 전파.
    myDataChannel = myPeerConnection.createDataChannel("chat"); //offer를 발송하는 측에서만 data channel을 만들면 된다.
    myDataChannel.addEventListener('message', (event) => { //myDataChannel.send("something")으로 콘솔에서 메시지 전파.
        console.log(event);
    })
    console.log("made data channel");
    const offer = await myPeerConnection.createOffer(); //peer to peer connection에 대한 offer (기존 사용자가 offer를 먼저 발송)
    //setLocalDescription : RTC 연결의 속성을 지정
    myPeerConnection.setLocalDescription(offer); //offer을 전송하기 위해서는 mypeerconnection에 offer을 포함시켜야 함
    socket.emit("offer", offer, roomName); //offer 발신
})

socket.on("offer", async (offer) => { //기존 사용자가 새로운 사용자의 입장에 따라 전파한 offer를 모든 사용자가 받는다.
    myPeerConnection.addEventListener('datachannel', (event) => {
        myDataChannel = event.channel;
        myDataChannel.addEventListener('message', (event) => {
            console.log(event.data);
        })
    })
    console.log('received the offer');
    console.log(offer);
    myPeerConnection.setRemoteDescription(offer); //offer 수신
    const answer = await myPeerConnection.createAnswer(); //offer을 보내준 상대한테 answer를 보낸다.
    myPeerConnection.setLocalDescription(answer); //myPeerConnection에 answer를 포함시켜야 함   
    socket.emit("answer", answer, roomName);
    console.log('sent the answer');
})

socket.on("answer", (answer) => { //offer를 처음에 보낸 쪽에서 answer를 받는다.
    console.log('received the answer');
    myPeerConnection.setRemoteDescription(answer);
})

socket.on("ice", (ice) => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})


//RTC
function makeConnection() { 
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302"
                ]
            }
        ]
    }); //peer간의 연결에 사용할 객체 생성
    myPeerConnection.addEventListener('icecandidate', handleIce); //offer 및 answer의 교환이 완료된 뒤 이벤트가 발생된다.
    myPeerConnection.addEventListener('addstream', handleAddStream); //peer 간의 연결에 stream을 추가하면 발생한다.
    // console.log('myStream', myStream.getTracks());
    // console.log('myPeerConnection', myPeerConnection);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) { //icecandidate(통신에 필요한 프로토콜과 라우팅 정보)를 교환한다.
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName); //data.candidate에는 여러 개의 candidate가 포함되어 있다.
}

function handleAddStream(data) { //미디어를 교환한다
    const peerFace = document.getElementById('peerFace');
    peerFace.srcObject = data.stream;
}