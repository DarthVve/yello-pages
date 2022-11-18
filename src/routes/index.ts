import express from 'express';
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.status(200).json({ message: 'Welcome to the Yello Pages API! We hope you enjoy our app!' });
});

export default router;
