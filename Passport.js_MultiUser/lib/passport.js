module.exports = function(app) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    
    var authData = {
        email: 'aaa@aaa.com',
        password: '111111',
        nickname: 'JaeHyun Shin'
      };
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function(user, done) { //로그인에 성공했을 때, authData를 user로 받는다. 로그인 성공시 1회만 호출된다.
        done(null, user.email); //세션에 user.email을 내부적으로 기록한다.
    });
    passport.deserializeUser(function(user, done) { //페이지에 방문할 때마다 호출된다. user(기본키)를 사용해서 데이터베이스(authData)에서 사용자를 검색한다.
        done(null, authData); //request.user객체에 authData 객체를 주입한다.
    });
    
    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'pwd' },
        function(username, password, done) {
          console.log('LocalStorage', username, password);
          if (username === authData.email) { //이메일을 올바르게 입력했을 때
            console.log(1);
            if (password === authData.password) { 
              console.log(2);
              return done(null, authData, { message: 'Welcome' }); //passport.serializeUser로 authData 객체를 전달한다
            } else { //비밀번호를 올바르지 않게 입력했을 때
              console.log(3);
              return done(null, false, { message: 'Incorrect password.' });
            }
          } else { //이메일을 올바르지 않게 입력했을 때
            console.log(4);
            return done(null, false, { message: 'Incorrect username.' });
          }
        }
     ));

     return passport;
};

