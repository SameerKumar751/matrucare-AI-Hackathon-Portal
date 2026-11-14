const router = require('express').Router();
const auth = require('../middleware/auth');
const { contactLimiter } = require('../middleware/rateLimiters');
const c = require('../controllers/contactController');

router.post('/', auth, contactLimiter, c.sendContact); // protected per assignment rule
module.exports = router;
