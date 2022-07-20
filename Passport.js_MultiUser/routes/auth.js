var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
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

  return router;
}