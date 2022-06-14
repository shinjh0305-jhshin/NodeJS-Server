const axios = require('axios');
const express = require('express');
const morgan = require('morgan');

const app = express();
const clientID = 'ufRe3eAjvpvQ3BWfADOT';
const clientSecret = 'G0Av7ENQMs';

app.use(morgan('dev'));
app.use(express.json());

app.set('port', process.env.PORT || 8080);
app.get('/', async(req, res) => {
    const apiClient = axios.create({
        baseURL : 'https://openapi.naver.com/v1/search/movie.json?query=' + encodeURI('라디오 스타') + '&country=' + encodeURI('KR')
         + '&yearfrom=1980&yearto=2022',
        headers: { 'X-Naver-Client-Id':clientID, 'X-Naver-Client-Secret': clientSecret }
    })
    try {
        const response = await apiClient.get();
        console.log(response.data);
        res.json(response.data);
    } catch (e) {
        console.error(e);
        res.send(e.message);
    }
})
app.listen(8080, () => {
    console.log('server running on 8080');
})
