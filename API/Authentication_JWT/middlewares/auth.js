const db = require('../lib/db');
const jwt = require('jsonwebtoken');

module.exports = {
    verifyToken : async function(req, res, next) {
        var token = req.cookies.access_token;
    
        req.tokenuser = {};
    
        if (token) {
            token = token.slice(7)
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded) {
                    const [result] = await db.query("SELECT access FROM user WHERE id=? AND user_id=?", [decoded.id, decoded.user_id]);
                    if (!result[0]) throw(new Error("error"));

                    req.tokenuser.code = 0;
                    req.tokenuser.id = decoded.id;
                    req.tokenuser.user_id = decoded.user_id;
                    req.tokenuser.access = result[0].access;
                }
            } catch (error) {
                req.tokenuser.code = 2;
                if (error.expiredAt) {
                    req.tokenuser.msg = `Your token has been expired.`
                } else {
                    req.tokenuser.msg = "Invalid token. Log in again."
                }
            }
        } else {
            req.tokenuser.code = 1;
            req.tokenuser.msg = "No token. Log in."
        }
        next();
    },
    
}