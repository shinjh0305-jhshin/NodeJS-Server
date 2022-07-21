var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var flash = require('connect-flash');
var db = require('./lib/db');

app.use(helmet());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());
app.use(session({ //app.use(session({}))은 request에 자동으로 session을 추가시켜준다.
  secret: 'keyboard cat',
  resave: false, //세션 값이 바뀌지 않으면 다시 저장하지 않음
  saveUninitialized: true, //세션이 필요하기 전까지는 세션 구동시키지 않는다.
  //store: new FileStore() //session은 default로 MemoryStore에 저장되어 있다. 서버 껐다 켜면 다 사라진다.
})) 

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');
var passport = require('./lib/passport')(app); //passport는 커다란 함수기 때문에, app을 매개변수로 전달해준다. operate(num)을 생각해보자.
var authRouter = require('./routes/auth')(passport);
app.use(flash()); //일회용 메시지인 플래시 메시지 사용

//주의
//session을 filestore 할 경우, 플래시 메시지가 뜨지 않는다.
/*
app.get('/flash', function(req, res) {
  req.flash('msg', 'Flash is back!'); //세션 스토어에 flash의 인자로 전달 된 데이터를 저장한다
  res.send('flash');
})
app.get('/flash-display', function(req, res) { //세션 스토어에 담긴 플래시 메시지를 사용 후 세션 스토어에서 지운다
  var fmsg = req.flash();
  console.log(fmsg);
  res.send(fmsg);

})
*/

app.get('*', async function(request, response, next){
  const [result] = await db.query('SELECT ID, TITLE FROM TOPICS');
  request.list = result;
  next();
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
