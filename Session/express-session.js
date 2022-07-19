var express = require('express')
var parseurl = require('parseurl')
var session = require('express-session')
var FileStore = require('session-file-store')(session);

var app = express()

//request에 자동으로 삽입되는 명세서다.
//key의 세션 ID과 동일한 세션 ID가 DB에 없으면 서버는 세션 ID를 새로 만들어서 세션 ID를 전달한다.
app.use(session({ //app.use(session({}))은 request에 자동으로 session을 추가시켜준다.
  //key: 'connect.sid', //default로 삽입되어 있다.
  secret: 'keyboard cat',
  resave: false, //세션 값이 바뀌지 않으면 다시 저장하지 않음
  saveUninitialized: true, //세션이 필요하기 전까지는 세션 구동시키지 않는다.
  store: new FileStore() //session은 default로 MemoryStore에 저장되어 있다. 서버 껐다 켜면 다 사라진다.
  //cookies 객체를 설정해서, session cookie의 설정을 부여할 수도 있다.
})) 

app.use(function (req, res, next) {
  if (!req.session.views) {
    req.session.views = {}
  }
  if (req.session.name != 'shin') {
    req.session.name = 'shin';
  } else {
    req.session.name = 'jaehyun'
  }

  // get the url pathname
  var pathname = parseurl(req).pathname

  // count the views
  req.session.views[pathname] = (req.session.views[pathname] || 0) + 1

  next()
})

app.get('/foo', function (req, res, next) {
    console.log(req.session);
  res.send('you viewed this page ' + req.session.views['/foo'] + ' times')
})

app.get('/bar', function (req, res, next) {
    console.log(req.session);
  res.send('you viewed this page ' + req.session.views['/bar'] + ' times')
})

app.listen(5000)