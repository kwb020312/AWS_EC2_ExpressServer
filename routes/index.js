const { default: Axios } = require('axios');
var express = require('express');
const router = express.Router();
const {Expo} = require('expo-server-sdk')
const Redis = require('ioredis')
const redis = new Redis({
  host: 'redis-10902.c244.us-east-1-2.ec2.cloud.redislabs.com',
  port: '10902',
  password:'woPKGAehd3lCNuHs9tTVKl5sJYoxGbI0',
  db:0
})

const expo = new Expo();

let savedPushTokens = [];

const saveToken = async(token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
  await redis.set('savedPushTokens',JSON.stringify(savedPushTokens))
  // console.log()
};

const handlePushTokens = async(message) => {
  let notifications = [];
  let getTokens = JSON.parse(await redis.get('savedPushTokens'))
  for (let pushToken of getTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    notifications.push({
      to: pushToken,
      sound: "default",
      title: "오늘 삼일상고 급식!",
      body: message,
      data: { message },
    });
  }
  let chunks = expo.chunkPushNotifications(notifications);
  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

/* GET home page. */
router.get('/', function(req, res, next) {
  const Today = new Date()
  Axios.get(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=c3348cd4353d49b595fdd38c0eb035e1&Type=json&pIndex=1&pSize=1&SD_SCHUL_CODE=7530336&ATPT_OFCDC_SC_CODE=J10&MLSV_YMD=${Today.getFullYear()}${(Today.getMonth()+1).toString().length === 2 ? Today.getMonth()+1 : '0'+(Today.getMonth()+1)}${Today.getDate().toString().length === 2 ? Today.getDate() : '0'+Today.getDate()}`)
  .then(res => res.data.mealServiceDietInfo[1].row[0].DDISH_NM)
  .then(res => res.replace(/(<([^>]+)>)/ig,'쉼').match(/[가-힣*$]/g).join("").split("").join("").replace(/쉼/g,',').match(/[^삼일]/g).join(""))
  .then(data => {
    res.render('index', {  Menu:data });
  })
});

router.post("/token", (req, res) => {
  saveToken(req.body.token.value);
  console.log(`Received push token, ${req.body.token.value}`);
  res.send(`Received push token, ${req.body.token.value}`);
});

router.post("/message", (req, res) => {
  handlePushTokens(req.body.message);
  console.log(`Received message, ${req.body.message}`);
  res.send(`Received message, ${req.body.message}`);
});

module.exports = router;
