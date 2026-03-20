const router = require('express').Router();

const { register, login, logout } = require("../controllers/user");
const { sensitiveLimiter } = require("../middleware/rateLimiter");
const authUser = require("../middleware/authUser");

router.post('/register', sensitiveLimiter, register);
router.post('/login', sensitiveLimiter, login);
router.post('/logout', authUser, logout);

module.exports = router;