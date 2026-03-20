const router = require('express').Router();

const { register, login, logout } = require("../controllers/user");
const { sensitiveLimiter } = require("../middleware/rateLimiter");

router.post('/register', sensitiveLimiter, register);
router.post('/login', sensitiveLimiter, login);
router.post('/logout', logout);

module.exports = router;