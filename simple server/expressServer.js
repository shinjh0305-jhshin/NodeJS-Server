const express = require('express');
const app = express();

app.set('port', process.env.PORT || 8080);
app.get('/', (req, res) => {
    try {
        res.sendFile(__dirname + '/index.html');
    } catch (e) {
        console.error(e);
        res.send(e.message);
    }
})
app.listen(app.get('port'), () => {
    console.log(`server running on ${app.get('port')}`)
})