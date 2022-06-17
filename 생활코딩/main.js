var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template');
var sanitizeHtml = require('sanitize-html');

var app = http.createServer((req, res) => {
    var _url = req.url;
    //url.parse : 사용자가 접근한 URL에 대한 거의 모든 정보가 담겨있다.
    var queryData = url.parse(_url, true).query; //URL의 쿼리 스트링을 받는다. 주의: 쿼리 이전까지가 URL이다.
    var pathName = url.parse(_url, true).pathname;
    var path = url.parse(_url, true).path;
    var title = sanitizeHtml(queryData.id);

    if (pathName === '/') { //주의 : localhost:3000/?id=HTML도 루트 경로다!! 쿼리 스트링은 경로로 안 쳐준다.
        if (path === '/') { //랜딩페이지 일 경우
            title = 'Welcome';
            var description = 'Hello, Node.js';
            var createUpdate = '<a href="/create">create</a>'; //랜딩페이지에서는 update가 안 보이도록 한다
        } else { //쿼리스트링이 존재 할 경우
            var description = sanitizeHtml(fs.readFileSync(`data/${title}`, 'utf8'), {allowedTags:['h1']});
            //주의 :: delete를 GET 방식으로 처리 할 경우, 링크로 타고 들어가서 아무나 다 망칠 수 있기에, POST 방식으로 한다.
            var createUpdate = `
            <a href="/create">create</a> 
            <a href="/update?id=${title}">update</a>
            <form action="/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?');">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
            </form>
            `;
        }

        var list = template.list(fs.readdirSync('./data'));
        var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`, createUpdate);

        try {
            res.writeHead(200);
            res.end(html);
        } catch (e) {
            res.end(e.message);
        }
    } else if (pathName === '/create') {
        var list = template.list(fs.readdirSync('./data'));
        var html = template.HTML(title, list, `
            <form action="/create_process" method="post">
                <p><input type="text" name="title" placeholder="title"></p>
                <p>
                    <textarea name="description" placeholder="description"></textarea>
                </p>
                <p><input type="submit"></p>
            </form>
        `, '');

        try {
            res.writeHead(200);
            res.end(html);
        } catch (e) {
            res.end(e.message);
        }
    } else if (pathName === '/create_process') { //제출 버튼을 누른 직후 이곳으로 온다
       var body = '';
       req.on('data', function(data) { //노드에서는 POST 방식으로 데이터가 오면, 데이터를 일부분씩 처리한다. 이때, 콜백 함수가 매 번 호출된다.
            body = body + data;
       });
       req.on('end', function() { //모든 data가 다 오면 호출되는 콜백함수.
            var post = qs.parse(body);
            title = post.title;
            var description = post.description;

            try {
                fs.writeFileSync(`data/${title}`, description);
                res.writeHead(302, {Location: `/?id=${encodeURI(title)}`}); //한글로 입력될 경우!
                res.end();
            } catch (e) {
                res.end(e.message);
            }
       })
    } else if (pathName === '/update') {
        var list = template.list(fs.readdirSync('./data'));
        var description = fs.readFileSync(`data/${title}`, 'utf8');

        var html = template.HTML(title, list, `
            <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                    <textarea name="description" placeholder="description" cols=100 rows=10>${description}</textarea>
                </p>
                <p><input type="submit"></p>
            </form>
        `, `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        try {
            res.writeHead(200);
            res.end(html);
        } catch (e) {
            res.end(e.message);
        }
    } else if (pathName === '/update_process') { //제출 버튼을 누른 직후 이곳으로 온다
        var body = '';
        req.on('data', function(data) { //노드에서는 POST 방식으로 데이터가 오면, 데이터를 일부분씩 처리한다. 이때, 콜백 함수가 매 번 호출된다.
             body = body + data;
        });
        req.on('end', function() { //모든 data가 다 오면 호출되는 콜백함수.
             var post = qs.parse(body);
             var id = post.id;
             var description = post.description;
             title = post.title;

             try {
                fs.rename(`data/${id}`, `data/${title}`, function(e) {
                    fs.writeFile(`data/${title}`, description, 'utf8', function(e) {
                        res.writeHead(302, {Location: `/?id=${encodeURI(title)}`});
                        res.end();
                    })
                });

             } catch (e) {
                 res.end(e.message);
             }
        })
     } else if (pathName === '/delete_process') { //제출 버튼을 누른 직후 이곳으로 온다
        var body = '';
        req.on('data', function(data) { //노드에서는 POST 방식으로 데이터가 오면, 데이터를 일부분씩 처리한다. 이때, 콜백 함수가 매 번 호출된다.
             body = body + data;
        });
        req.on('end', function() { //모든 data가 다 오면 호출되는 콜백함수.
             var post = qs.parse(body);
             var id = post.id;

             try {
                fs.unlink(`data/${id}`, function(e) {
                    res.writeHead(302, {Location: '/'});
                    res.end();
                })
             } catch (e) {
                 res.end(e.message);
             }
        })
     } else {
        console.log(pathName);
        res.writeHead(404);
        res.end('Not Found!');
    }
})

app.listen(3000, () => {
    console.log("server running on 3000");
});