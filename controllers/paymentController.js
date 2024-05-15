const stripe = require('stripe')(process.env.SRIPE_KEY )

exports.sendStripeKey=async(req,res)=>{
    res.status(200).json({
        stripeKey:process.env.SRIPE_API_KEY,
    });
}
exports.captureStripePayment=async(req,res)=>{
    try{
    const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: 'T-shirt',
              },
              unit_amount: req.body.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4000/success',
        cancel_url: 'http://localhost:4000/cancel',
      });
    
      res.redirect(303, session.url);
      res.json({
        success:true
      });
    }
      catch(error){
        res.status(400).json({
            error:error.message
        })
      }
}
