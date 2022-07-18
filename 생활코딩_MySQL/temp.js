const http = require('http');

const app = http.createServer((req, res) => {
    const _url = req.url;
    const url = new URL('http://localhost:8080' + _url);
    console.log(url.searchParams.get('id')); //20171759
    console.log(url);

    res.end(`<h1>Hello world</h1>`)
})

app.listen(8080, () => {
    console.log("server running on 8080");
})