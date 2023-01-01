const express = require('express');
const router = express.Router();
const{createOrder, getOneOrder, getLoggedInOrder, adminUpdateOrder, adminDeleteOrder}=require('../controllers/orderController');
const{isLoggedIn,customRole }=require('../middlewares/user');

router.route('/order/create').post(isLoggedIn,createOrder);

router.route('/order/myorders').get(isLoggedIn,getLoggedInOrder);

// this  route should always be in last
router.route('/order/:id').get(isLoggedIn,getOneOrder)
                          .put(isLoggedIn,customRole("admin"),adminUpdateOrder)
                          .delete(isLoggedIn,customRole("admin"),adminDeleteOrder) ;
module.exports=router;    