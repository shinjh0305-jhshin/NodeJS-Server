const path = require('path');
const axios = require('axios');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, "../.env" )});

const app = express();

app.use(morgan('dev'));
app.use(express.json());

const port = 8080;
app.get('/', async (req, res) => {
    const API_CODE = process.env.COVID;
    const client = axios.create({
        baseURL : 'http://apis.data.go.kr/1790387/covid19CurrentStatusKorea/covid19CurrentStatusKoreaJason?serviceKey=' + API_CODE
    })
    try {
        const response = await client.get();
        const todayStatus = response.data.response.result[0];
        console.log(todayStatus);
        res.send(`
           <h1>사망자 : ${todayStatus.cnt_deaths}</h1>
           <h1>확진자 : ${todayStatus.cnt_confirmations}</h1>        
        `)    
    } catch (e) {
        console.error(e);
        res.send(e.message);
    }
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})