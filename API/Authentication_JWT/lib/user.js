module.exports = function(body) {
    const id_re = /^.{4,12}$/;
    const pwd_re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const email_re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phone_re = /^(?:\d{3}|\(\d{3}\))([-\/\.])\d{4}\1\d{4}$/;

    //contains result of validation

    const user_id = body.user_id;
    const pwd = body.pwd;
    const pwd2 = body.pwd2;
    const email = body.email;
    const phone = body.phone;

    let result = {};

    if (user_id && pwd && pwd2 && email && phone) {
        if (pwd !== pwd2) {
            result.code = 1;
            result.msg = "Password and confirmation does not match";
        } else if (!id_re.exec(user_id)) {
            result.code = 2;
            result.msg = "User ID shoud be 4-12 characters long.";
        } else if (!pwd_re.exec(pwd)) {
            result.code = 3;
            result.msg = "Password should contain at least of following : 1+lowercase, 1+uppercase, 1+number, 1+special, 8+chars long.";
        } else if (!email_re.exec(email)) {
            result.code = 4;
            result.msg = "Invalid email address.";
        } else if (!phone_re.exec(phone)) {
            result.code = 5;
            result.msg = "Phone number should be in form of ###-####-####";
        } else {
            result.code = 0;
            result.msg = "SUCCESS";
        }
    } else {
        result.code = 10;
        result.msg = "Missing information."
    }
    

    return result;
}