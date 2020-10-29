const { default: Axios } = require('axios');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  let Menu
  Axios.get(`https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=c3348cd4353d49b595fdd38c0eb035e1&Type=json&pIndex=1&pSize=1&SD_SCHUL_CODE=7530336&ATPT_OFCDC_SC_CODE=J10&MLSV_YMD=20201029`)
  .then(res => res.data.mealServiceDietInfo[1].row[0].DDISH_NM)
  .then(res => res.replace(/(<([^>]+)>)/ig,'쉼').match(/[가-힣*$]/g).join("").split("").join("").replace(/쉼/g,','))
  .then(data => {
    res.render('index', { title: 'Express' , Menu:data });
  })
});

module.exports = router;
