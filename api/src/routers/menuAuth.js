const router = require('express').Router();

const { addMenu, updateMenu, deleteMenu, getMenu, currentAvailbleItems } = require('../controllers/menu');
const authUser = require('../middleware/authUser');
const validateRole = require("../middleware/authRole");

router.post('/additem', authUser, validateRole("admin"), addMenu);
router.put('/updateitem/:id', authUser, validateRole("admin"), updateMenu);
router.delete('/deleteitem/:id', authUser, validateRole("admin"), deleteMenu);
router.get('/getmenu', authUser, getMenu);
router.get('/available', authUser, currentAvailbleItems);

module.exports = router;
