const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('<h1>Hello 삼일상고 Lunch Menu!</h1>')
});

module.exports = router;
