//미들웨어는 아래와 같은 순서로 작성한다.
const express = require('express');
const logger = require('morgan');
const app = express();

app.set('port', process.env.PORT || 8080);

//root 주소로 라우팅 하기 전에 미들웨어를 작성해야, 라우팅 시 정상 작동된다.
//미들웨어를 app.get이후에 작성하면 미들웨어가 실행되지 않는다.
//만약 불가피하게 app.get 이후에 작성할 경우, app.get의 콜백함수에 next를 전달하고 next()로 호출한다.

let returnMsg = '<h1>Hello World!</h1><br>';

const myLogger = function(req, res, next) { //next : 다음 미들웨어로 넘어간다
    console.log('LOGGED');
    console.log(`Requested at ${new Date(Date.now())}`);
    req.requestTime = new Date(Date.now());
    
    next(); //next 생략 안하면 일종의 무한 로딩 발생한다. 절대 생략 금지!!
}

const myInfo = function(req, res, next) {
    if (req.originalUrl === '/') console.log('Visited to landing page');
    next();
}

//use가 어떤 순서로 나왔냐에 따라 어떤 미들웨어가 먼저 실행될지 결정된다.
app.use(myLogger, myInfo);
app.use(logger('combined'));

app.get('/', (req, res) => {
    res.send(returnMsg + `<small>Requested at ${req.requestTime}</small>`);
});

app.get('/:id', (req, res) => {
    if (req.params.id === ':20171759') {
        console.log('Admin Logged in.');
        req.name = 'JaeHyun Shin'
    } else {
        console.log('Guest Logged in.');
        req.name = 'Guest';
    }

    res.send(returnMsg + `<small>Requested at ${req.requestTime}</small><br><br><h1>Welcome ${req.name}</h1>`);
});

app.use((err, req, res, next) => {
    console.err(err.stack);
    next();
})

app.listen(app.get('port'), () => {
    console.log('server running on 8080');
});
