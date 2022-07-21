var express = require('express');
var crypto = require('crypto');
var shortid = require('shortid');
var router = express.Router();
var db = require('../lib/db');
var template = require('../lib/template.js');

module.exports = function(passport) {
  router.get('/login', function(request, response){
    var fmsg = request.flash();
    var feedback = fmsg.error ? fmsg.error[0] : '';
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color: red;">${feedback}</div>
      <form action="/auth/login_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p>
          <p><input type="password" name="pwd" placeholder="password"></p>
        </p>
        <p>
          <input type="submit" value="login">
        </p>
      </form>
    `, '');
    response.send(html);
  });

  router.post('/login_process', 
    //failureFlash, successFlash : 로그인할 때 플래시 메시지를 표시할지. success는 구현 안 함.
    passport.authenticate('local', { failureRedirect: '/auth/login', successRedirect: '/', failureFlash: true, successFlash: true })
  );

  router.get('/logout', function(request, response){
    request.logout(function(err) {
      request.session.save(function(err) {
        response.redirect('/');
      })
    });
  });

  router.get('/register', function(request, response) {
    var fmsg = request.flash();
    var feedback = fmsg.error ? fmsg.error[0] : '';
    var title = 'WEB - login';
    var list = template.list(request.list);
    var html = template.HTML(title, list, `
      <div style="color: red;">${feedback}</div>
      <form action="/auth/register_process" method="post">
        <p><input type="text" name="email" placeholder="email"></p>
        <p><input type="password" name="pwd" placeholder="password"></p>
        <p><input type="password" name="pwd2" placeholder="password"></p>
        <p><input type="text" name="displayName" placeholder="display name"></p>
        <p>
          <input type="submit" value="register">
        </p>
      </form>
    `, '');
    response.send(html);
  })

  router.post('/register_process', async function(request, response){
    var post = request.body;
    var id = shortid.generate();
    var email = post.email;
    var pwd = post.pwd;
    var pwd2 = post.pwd2;
    var displayName = post.displayName;

    if (email === '') {
      request.flash('error', 'Enter email');
      response.redirect('/auth/register');
    } else if (pwd !== pwd2 || pwd == '' || pwd2 == '') {
      request.flash('error', 'Check password');
      response.redirect('/auth/register');
    } else {
      var [result] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', email); //동일 이메일에 대한 데이터 가져온다
      if (result[0]) { //동일 이메일이 존재하는지 확인
        request.flash('error', 'Email already exists');
        response.redirect('/auth/register');
      } else { //새로운 유효한 사용자 데이터
        var salt = crypto.randomBytes(16);
        crypto.pbkdf2(pwd, salt, 310000, 32, 'sha256', async function(err, hashedPassword) {
          if (err) console.log(err); 
          await db.query('INSERT INTO USERS(ID, PASSWORD, EMAIL, SALT, DISPLAYNAME) VALUES (?, ?, ?, ?, ?)', [id, hashedPassword, email, salt, displayName]);
          var user = {
            ID : id,
          };
          request.login(user, function(err) {
            return response.redirect('/')
          })
        })
      }
    }
  });

  router.get('/google', passport.authenticate('google'));
  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/auth/login', failureMessage: true }),
    function(req, res) {
      res.redirect('/');
  });

  return router;
}