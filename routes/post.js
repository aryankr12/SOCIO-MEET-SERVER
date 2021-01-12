const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const req_login =require('../middleware/require_login')
const Post = mongoose.model("Post")

router.get('/allpost',req_login,(req,res)=>{
    Post.find()
    .populate("postedBy","_id name")//populate is the method to get the actual name from the _id.
    .populate("comments.postedBy","._id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(e=>{
        console.log(e)
    })
})



router.get('/getsubpost',req_login,(req,res)=>{
    //if posted by is available in following 
    Post.find({postedBy:{$in:req.user.following}})
    .populate("postedBy","_id name")//populate is the method to get the actual name from the _id.
    .populate("comments.postedBy","._id name")
    .sort('-createdAt')
    .then(posts=>{
        res.json({posts})
    })
    .catch(e=>{
        console.log(e)
    })
})







router.post('/createpost',req_login,(req,res)=>{
    const {title,body,pic} = req.body
    console.log(title,body,pic)
    if(!title||!body||!pic){
        return res.status(422).json({error:"please add all the fields"})
    }
    req.user.password = undefined // if we dont use this it the password of another user will also get stored at the mongo database.
    const post = new Post ({
        title,
        body,
        photo:pic,
        postedBy:req.user
    })
    post.save()
    .then(result=>{
        res.json({post:result})
    })
    .catch(e=>
    {
        console.log(e)
    })
})

router.get('/mypost',req_login,(req,res)=>{
    Post.find({postedBy:req.user._id})//we are quering the post model where postedBy= id of the user logged in.
    .populate("postedBy","_id name")
    .then(mypost=>{
        res.json({mypost})
    })
    .catch(err=>{
        console.log(err)
    })
})

//like and unlike post//update operation 
router.put('/like',req_login,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
        },{
            new:true
            }).exec((err,result)=>{
                    if(err){
                        return res.status(422).json({error:err})
                    }
                    else{
                        res.json(result)
                    }
            })
})

router.put('/unlike',req_login,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
        },{
            new:true
            }).exec((err,result)=>{
                    if(err){
                        return res.status(422).json({error:err})
                    }
                    else{
                        res.json(result)
                    }
            })
})

//comment route
router.put('/comment',req_login,(req,res)=>{
    const comment = {
        text:req.body.text,
        postedBy:req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
        },{
            new:true
            })
            .populate("comments.postedBy","_id name")
            .populate("postedBy","._id name")
            
            .exec((err,result)=>{
                    if(err){
                        return res.status(422).json({error:err})
                    }
                    else{
                        res.json(result)
                    }
            })
})
//delete router 
router.delete('/deletepost/:postId',req_login,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err||!post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
                post.remove()
                .then(result=>{
                    res.json({result})
                }).catch(err=>{
                    console.log(err)
                })
        }
    })
})

//comment delete router 
/*router.delete('/deletecomment/:postId',req_login,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("comments.postedBy","_id")
    .exec((err,post)=>{
        if(err||!post){
            return res.status(422).json({error:err})
        }
        if(post.postedBy._id.toString() === req.user._id.toString()){
                post.remove()
                .then(result=>{
                    res.json({result})
                }).catch(err=>{
                    console.log(err)
                })
        }
    })
})
*/



















module.exports = router