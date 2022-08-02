const path = require('path');
const axios = require('axios');
const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const redis = require('redis');

dotenv.config({ path: path.resolve(__dirname, "../.env" )});

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const redisclient = redis.createClient();
redisclient.connect();

app.get('/', async (req, res) => {
    const API_CODE = process.env.COVID;
    const client = axios.create({
        baseURL : 'http://apis.data.go.kr/1790387/covid19CurrentStatusKorea/covid19CurrentStatusKoreaJason?serviceKey=' + API_CODE
    })
    
    const dt = new Date(Date.now());
    const todayDate = `${dt.getMonth() + 1}.${dt.getDate()}`;

    const todayCache = await redisclient.hGetAll(todayDate);
    console.log(todayCache);

    if (!todayCache.death) {
        console.log('Cache Miss');

        const response = await client.get();
        const todayStatus = response.data.response.result[0];
        console.log(todayStatus);

        await redisclient.hSet(todayDate, {infected: todayStatus.cnt_confirmations, death: todayStatus.cnt_deaths});

        res.send(`
            <h1>사망자 : ${todayStatus.cnt_deaths}</h1>
            <h1>확진자 : ${todayStatus.cnt_confirmations}</h1>    
        `)   
    } else {
        console.log('Cache hit');
        res.send(`
            <h1>사망자 : ${todayCache.death}</h1>
            <h1>확진자 : ${todayCache.infected}</h1>    
        `)  
    }
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})