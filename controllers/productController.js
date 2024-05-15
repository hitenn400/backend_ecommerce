const Product = require('../models/product');
const cloudinary = require('cloudinary');
const WhereClause = require('../utils/whereClause');
exports.addProduct = async (req,res)=>{
        try {
            // images
            let imageArray = [];
            if(!req.files){
                return res.status(401).json({
                    error:"Images are required"
                })
            }
            if(req.files){
                for (let index = 0; index < req.files.photos.length; index++) {
                    let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                        folder:"products"
                    });
                    imageArray.push({
                        id:result.public_id,
                        secure_url:result.secure_url
                    })
                }
            }
            req.body.photos = imageArray;
            req.body.user = req.user.id;
            const product = await Product.create(req.body);
            res.status(200).json({
                success:true,
                product
            })
            
        } catch (error) {
            res.status(400).json({
                msg:error.message
            });
        }
    
};
exports.getAllProduct=async(req,res)=>{
    try{
        const resultPerPage=5;
    const totalcountProduct = await Product.countDocuments();
    const productsObj = new WhereClause(Product.find(),req.query).search().filter();
    let products = await productsObj.base;
    const filteredProductNumber = products.length;
    productsObj.pager(resultPerPage);
    products=await productsObj.base.clone();
    res.status(200).json({
        success:true,
        products,
        filteredProductNumber,
        totalcountProduct
    });
    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}
exports.getOneProduct=async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({
                error:'product not found'
            });
        }
        res.status(200).json({
            success:true,
            product
        });
  
    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}
exports.adminUpdateOneProduct=async(req,res)=>{
    try{
        let product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({
                error:'not found product'
            })
        }
        let imageArray = [];
        if(req.files){
            // destroy the existing images
            for (let index = 0; index < product.photos.length; index++) {
                
                const res=await cloudinary.v2.uploader.destroy(product.photos[index].id);
                
            }
            // upload and save the images
            for (let index = 0; index < req.files.photos.length; index++) {
                let result = await cloudinary.v2.uploader.upload(req.files.photos[index].tempFilePath,{
                    folder:"products"
                });
                imageArray.push({
                    id:result.public_id,
                    secure_url:result.secure_url
                })
            }
        }
        req.body.photos=imageArray;
        product = await Product.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true,
            
        });
        res.status(200).json({
            success:true,
            product
        })

    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}   
exports.adminDeleteOneProduct=async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(400).json({
                error:'not found product'
            })
        }
        // destroy the existing images
        for (let index = 0; index < product.photos.length; index++) {
                
            await cloudinary.v2.uploader.destroy(product.photos[index].id);
            
        }
        await product.remove();
       
      
        res.status(200).json({
            success:true,
            message:"product was deleted"
        })

    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}
exports.addReview=async(req,res)=>{
    try{
        const {rating,comment,productId} = req.body;
        const review={
            user:req.user._id,
            name:req.user.name,
            rating:Number(rating),
            comment
        }
        const product = await Product.findById(productId);
        const alreadyReview=product.reviews.find(
            (rev)=>rev.user.toString()===req.user._id.toString()
        );
        if(alreadyReview){
            product.reviews.forEach((review) => {
                if (review.user.toString() === req.user._id.toString()) {
                  review.comment = comment;
                  review.rating = rating;
                }
              });
        }
        else{
            product.reviews.push(review);
            product.numberOfReviews=product.reviews.length;
        }
        product.ratings=product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length;
        await product.save({
            validateBeforeSave:false
        });
        res.status(200).json({
            success:true
        })

    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}   
exports.deleteReview=async(req,res)=>{
    try{
        const {productId} = req.query;
        const product = await Product.findById(productId);
        const reviews = product.reviews.filter(
            (rev)=>rev.user.toString()===req.user._ud.toString()
        );
        const numberOfReviews = reviews.length;
        // adjust ratings 
        product.ratings=product.reviews.reduce((acc,item)=>item.rating+acc,0)/product.reviews.length;

        // update product
        await Product.findByIdAndUpdate(
            productId,
            {
              reviews,
              ratings,
              numberOfReviews,
            },
            {
              new: true,
              runValidators: true,
              useFindAndModify: false,
            }
          );
        
          res.status(200).json({
            success: true,
          }); 
    }
    catch (error) {
        res.status(400).json({
            msg:error.message
        });
    }
    
}   
exports.getOnlyReviewsForOneProduct = async (req,res) => {
    try{
    const product = await Product.findById(req.query.id);
  
    res.status(200).json({
      success: true,
      reviews: product.reviews,
    });
}
    catch{
        res.status(400).json({
            msg:error.message
        });
    }
};

