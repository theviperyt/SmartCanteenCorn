const router = require("express").Router();
const { placeOrder, getOrder, changeStatus, getTotalOrder, getAllOrders } = require("../controllers/order");
const authUser = require("../middleware/authUser");
const validateRole = require("../middleware/authRole");

router.post('/placeorder', authUser, placeOrder);
router.get('/getorder/:id', authUser, getOrder);
router.put('/changestatus/:id', authUser, validateRole("admin"), changeStatus);
router.get('/totalorders', authUser, getTotalOrder);
router.get('/allorders', authUser, validateRole("admin"), getAllOrders);

module.exports = router;

