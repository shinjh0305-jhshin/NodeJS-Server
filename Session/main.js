var express = require('express');
var app = express();
var fs = require('fs');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
app.use(helmet());

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var authRouter = require('./routes/auth');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({ //app.use(session({}))은 request에 자동으로 session을 추가시켜준다.
  secret: 'keyboard cat',
  resave: false, //세션 값이 바뀌지 않으면 다시 저장하지 않음
  saveUninitialized: true, //세션이 필요하기 전까지는 세션 구동시키지 않는다.
  store: new FileStore() //session은 default로 MemoryStore에 저장되어 있다. 서버 껐다 켜면 다 사라진다.
})) 
app.get('*', function(request, response, next){
  fs.readdir('./data', function(error, filelist){
    request.list = filelist;
    next();
  });
});

app.use('/', indexRouter);
app.use('/topic', topicRouter);
app.use('/auth', authRouter);


app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});
