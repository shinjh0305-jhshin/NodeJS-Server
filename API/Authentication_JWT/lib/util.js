const jwt = require('jsonwebtoken');

module.exports = {
    sendMessage : function(code, msg, res, token="") {
        var result = {
            code: code,
            msg: msg
        }
        if(token !== "") result.token = token;
        return res.json(result);
    },
    generateToken : function (id, user_id) {
        return jwt.sign({ id: id, user_id: user_id }, process.env.JWT_SECRET, { expiresIn: '60m', issuer: 'myapi' });
    }
}