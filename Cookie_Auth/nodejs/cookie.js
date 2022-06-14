const express = require('express');
const cookie = require('cookie');
const app = express();

app.set('port', process.env.PORT || 3000); 
app.get('/', (req, res) => {
    console.log(req.headers.cookie);
    
    let cookies = {};
    if (req.headers.cookie !== undefined) {
        cookies = cookie.parse(req.headers.cookie);
        console.log(cookies.yummy_cookie);
    }

    res.writeHead(200, { //서버에서 브라우저로 쿠키를 보낸다.
        'Set-Cookie': [
            'yummy_cookie=choco', 
            'tasty_cookie=strawberry',
            //Max-Age : 현재 시점에서 얼마나 쿠키가 생존할 것인가, Expires : 어느 시점에 쿠키가 만료될 것인가
            `Permanent=cookies; Max-Age=${60*60*24*30}`,
            'Secure=secure; Secure', //localhost를 제외하고 https가 아닌 http에서는 전송되지 않는다. (세션 ID에 적용)
            'HttpOnly=HttpOnly; HttpOnly', //자바스크립트(콘솔 창)을 통해서 접근 못하고, 서버-브라우저 통신 과정에서만 가능!
            'Path=Path; Path=/cookie', // /cookie이하의 경로에서만 살아있는 쿠키다.
            'Domain=Domain; Domain=o2.org' //o2.org 뿐만이 아닌 test.o2.org와 같은 서브 도메인에서도 살아 남는다.
        ]
    });
    res.end('Cookie!!');
})

app.listen(app.get('port'), () => {
    console.log(`server running on ${app.get('port')}`);
} )
