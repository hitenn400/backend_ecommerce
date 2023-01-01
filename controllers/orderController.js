const Order = require('../models/order');
const Product = require('../models/product');
exports.createOrder = async(req,res)=>{
    try {
        const{
            shippingInfo,
            orderItem,
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount
        }=req.body;
       const order = await Order.create({
            shippingInfo,
            orderItem,
            paymentInfo,
            taxAmount,
            shippingAmount,
            totalAmount,
            user:req.user._id
        });
        res.status(200).json({
            success:true,
            order
        })
    } 
    catch(error){
            res.status(400).json({
                error:error.message
            })
      }
    
}
exports.getOneOrder=async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id).populate('user','name email');
        if(!order){
            return res.status(400).json({
                message:"Please check order id"
            })
        }
        res.status(200).json({
            success:true,
            order
        })
        
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
exports.getLoggedInOrder=async(req,res)=>{
    try {
        const order = await Order.find({user:req.user._id});
        if(!order){
            return res.status(400).json({
                message:"Please check order id"
            })
        }
        res.status(200).json({
            success:true,
            order
        })
        
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
exports.adminUpdateOrder = async(req,res)=>{
    try {
         const order = await Order.findById(req.params.id);
         if(order.orderStatus==='Delivered'){
            return res.status(401).json({
                message:"order is already marked for delivered"
            })
         }
         order.orderStatus=req.body.orderStatus;
         order.orderItems.forEach(async(prod)=>{
            await updateProductStock(prod.product,prod.quantity);
         });
         await order.save();
         res.status(200).json({
            success:true,
            order
         })
        
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
exports.adminDeleteOrder = async(req,res)=>{
    try {
         const order = await Order.findById(req.params.id);
         await order.remove();
         res.status(200).json({
            success:true,
            
         })
        
    } catch (error) {
        res.status(400).json({
            error:error.message
        })
    }
}
async function updateProductStock(productId,quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock-quantity;
    await product.save({validateBeforeSave:false});
}