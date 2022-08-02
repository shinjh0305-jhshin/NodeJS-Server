const express = require('express');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');
const template = require('./lib/template');
const topic = require('./lib/topic');
const db = require('./lib/db');
const author = require('./lib/author');

dotenv.config({ path: path.resolve(__dirname, "../.env" )});

const app = express();

app.set('port', 3000 || process.env.PORT)

app.use(express.json());
app.use(express.urlencoded()); //false : node의 querystring 모듈 사용, true : express의 qs모듈 사용
app.use(compression()); //응답 바디를 압축해서 보내준다.
app.use(express.static('public')); //public 폴더를 이용한다

app.get('*', function(req, res, next) { //get 요청이 들어왔을 때만 미들웨어를 실행한다.
    topic.common(req, next);
})
app.get('/' , function (req, res) {
    topic.home(req, res);
})

app.get('/author', function(req, res) {
    author.home(req, res);
})
app.post('/author/create_process', function(req, res) {
    author.create_process(req, res);
})
app.get('/author/update/:authorId', function(req, res) {
    author.update(req, res);
})
app.post('/author/update_process', function(req, res) {
    author.update_process(req, res);
})
app.post('/author/delete_process', function(req, res) {
    author.delete_process(req, res);
})
app.get('/topic/create', function(req, res) { // /topic/:pageId보다 먼저 있어야 /topic/create를 받을 수 있다,
    topic.create(req, res);
})

app.post('/topic/create_process', function(req, res) { //method가 post로 왔기 때문에 post로 받는다.
    topic.create_process(req, res);
})

app.get('/topic/:pageId', function(req, res) {
    topic.page(req, res);
})

app.get('/topic/update/:pageId', function(req, res) {
    topic.update(req, res);
})

app.post('/topic/update_process', function(req, res) {
    topic.update_process(req, res);
})

app.post('/topic/delete_process', function(req, res) {
    topic.delete_process(req, res);
})

app.get('/favicon.ico', (req, res) => res.status(204));

app.use(function(req, res, next) {
    res.status(400).send('Page not found');
})

app.listen(app.get('port'), () => {
    console.log(`server running on ${app.get('port')}.`)
})
