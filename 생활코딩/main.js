const express = require('express');
const fs = require('fs');
const template = require('./lib/template');
const sanitizeHtml = require('sanitize-html');
const compression = require('compression');

const app = express();

app.set('port', 8080 || process.env.PORT)

app.use(express.json());
app.use(express.urlencoded()); //false : node의 querystring 모듈 사용, true : express의 qs모듈 사용
app.use(compression()); //응답 바디를 압축해서 보내준다.
app.use(express.static('public')); //public 폴더를 이용한다

app.get('*', function(req, res, next) { //get 요청이 들어왔을 때만 미들웨어를 실행한다.
    req.list = template.list(fs.readdirSync('./data'));
    next();
})

app.get('/' , function (req, res) {
    const title = 'Welcome';
    const description = 'Hello, Node.js';
    const createUpdate = '<a href="/topic/create">create</a>'; 
    const html = template.HTML(title, req.list, `
            <h2>${title}</h2><p>${description}</p><img src="/images/travel.jpg" style="width:300px; display:block; margin-top:10px;">`, 
            createUpdate);

    try {
        res.send(html);
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/topic/create', function(req, res) { // /topic/:pageId보다 먼저 있어야 /topic/create를 받을 수 있다,
    const title = 'Create';
    const html = template.HTML(title, req.list, `
        <form action="/topic/create_process" method="post">
            <p><input type="text" name="title" placeholder="title"></p>
            <p>
                <textarea name="description" placeholder="description"></textarea>
            </p>
            <p><input type="submit"></p>
        </form>
    `, '');
    try {
        res.send(html);
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/topic/create_process', function(req, res) { //method가 post로 왔기 때문에 post로 받는다.
    const body = req.body;
    const title = body.title;
    const description = body.description;

    fs.writeFileSync(`data/${title}`, description);

    try {
        res.redirect(`/topic/${encodeURI(title)}`); //한글로 입력될 경우!
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/topic/:pageId', function(req, res) {
    const title = sanitizeHtml(req.params.pageId);
    const description = sanitizeHtml(fs.readFileSync(`data/${title}`, 'utf8'), {allowedTags:['h1']});
    //주의 :: delete를 GET 방식으로 처리 할 경우, 링크로 타고 들어가서 아무나 다 망칠 수 있기에, POST 방식으로 한다.
    const createUpdate = `
        <a href="/topic/create">create</a> 
        <a href="/topic/update/${title}">update</a>
        <form action="/topic/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?');">
            <input type="hidden" name="id" value="${title}">
            <input type="submit" value="delete">
        </form>
    `;

    const html = template.HTML(title, req.list, `<h2>${title}</h2><p>${description}</p>`, createUpdate);

    try {
        res.send(html);
    } catch (error) {
        res.send(error.message);
    }
})

app.get('/topic/update/:pageId', function(req, res) {
    const title = sanitizeHtml(req.params.pageId);
    const description = fs.readFileSync(`data/${title}`, 'utf8');

    const html = template.HTML(title, req.list, `
        <form action="/topic/update_process" method="post">
            <input type="hidden" name="id" value="${title}">
            <p><input type="text" name="title" placeholder="title" value="${title}"></p>
            <p>
                <textarea name="description" placeholder="description" cols=100 rows=10>${description}</textarea>
            </p>
            <p><input type="submit"></p>
        </form>
    `, `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`);

    try {
        res.send(html);
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/topic/update_process', function(req, res) {
    const body = req.body;
    const title = body.title;
    const id = body.id;
    const description = body.description;

    try {
        fs.rename(`data/${id}`, `data/${title}`, function(e) {
            fs.writeFile(`data/${title}`, description, 'utf8', function(e) {
                res.redirect(`/topic/${encodeURI(title)}`); //한글로 입력될 경우!
            })
        });
    } catch (error) {
        res.send(error.message);
    }
})

app.post('/topic/delete_process', function(req, res) {
    const body = req.body;
    const id = body.id;

    fs.unlink(`data/${id}`, function(e) {
        res.redirect('/');
    })
})

app.use(function(req, res, next) {
    res.status(400).send('Page not found');
})

app.listen(app.get('port'), () => {
    console.log(`server running on ${app.get('port')}.`)
})
