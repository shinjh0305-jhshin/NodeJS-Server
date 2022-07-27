const express = require('express');
const app = express();

app.set("port", 3000 || process.env.PORT);
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    res.render('home');
})
app.listen(app.get("port"), () => {
    console.log(`Server running on ${app.get("port")}`);
})