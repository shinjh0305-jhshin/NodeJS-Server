module.exports = function(app) {
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    var crypto = require('crypto');
    const dotenv = require('dotenv');
    const shortid = require('shortid');
    const path = require('path');
    var db = require('./db');
    
    dotenv.config({ path: path.resolve(__dirname, "../../.env" )});   

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
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLEID,
      clientSecret: process.env.GOOGLEPWD,
      callbackURL: process.env.GOOGLEURL,
      scope: ['profile', 'email']
    }, async function(accessToken, refreshToken, profile, done) { //구글로부터 accesstoken을 받은 뒤, 이를 바탕으로 API에 정보 요청을 하고 응답을 받은 뒤 이 함수가 실행된다.
      var email = profile.emails[0].value;
      var [result] = await db.query('SELECT * FROM USERS WHERE EMAIL = ?', [email]);

      if (result[0]) {
        await db.query('UPDATE USERS SET GOOGLEID = ? WHERE ID = ?', [profile.id, result[0].ID]);
        return done(null, result[0]);
      } else {
        var userId = shortid.generate();
        await db.query('INSERT INTO USERS(ID, EMAIL, DISPLAYNAME, GOOGLEID) VALUES(?, ?, ?, ?)', [userId, email, profile.displayName, profile.id]);

        var user = { ID : userId };
        return done(null, user);
      }
    }))
    return passport;
};

