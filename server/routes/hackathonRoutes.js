const router = require('express').Router();
const auth = require('../middleware/auth');
const { confirmationResendLimiter } = require('../middleware/rateLimiters');
const c = require('../controllers/hackathonController');

router.post('/register', auth, c.register);
router.get('/my-entry', auth, c.myEntry);
router.post('/:id/resend-confirmation', auth, confirmationResendLimiter, c.resendConfirmation);
router.delete('/:id', auth, c.remove);
module.exports = router;
