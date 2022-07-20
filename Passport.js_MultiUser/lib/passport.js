module.exports = function(app) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var crypto = require('crypto');
    var db = require('./db');
    
    app.use(passport.initialize());
    app.use(passport.session());
    
    passport.serializeUser(function(user, done) { //로그인에 성공했을 때, authData를 user로 받는다. 로그인 성공시 1회만 호출된다.
        //console.log('serializeUser', user);
        done(null, user.ID); //세션에 user.id를 내부적으로 기록한다.
    });
    passport.deserializeUser(async function(ID, done) { //페이지에 방문할 때마다 호출된다. user(기본키)를 사용해서 데이터베이스(authData)에서 사용자를 검색한다.
      var [user] = await db.query('SELECT * FROM USERS WHERE ID = ?', [ID]);
      //console.log('deserialize', user[0]);
      done(null, user[0]); //request.user객체에 authData 객체를 주입한다.
    });
    
    passport.use(new LocalStrategy(
        { usernameField: 'email', passwordField: 'pwd' },
        async function(email, password, done) {
          //console.log('LocalStorage', email, password);
          var [result] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', [email]);

          if (!result[0]) return done(null, false, { message : 'Incorrect username.' });

          crypto.pbkdf2(password, result[0].SALT, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) return done(err);
            if (!crypto.timingSafeEqual(result[0].PASSWORD, hashedPassword)) {
              return done(null, false, { message : 'Incorrect password' });
            }
            return done(null, result[0]);
          })
        }
    ));

    return passport;
};

