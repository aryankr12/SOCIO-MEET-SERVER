const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const req_login =require('../middleware/require_login')
const Post = mongoose.model("Post")
const User = mongoose.model("user")


router.get('/user/:id',req_login,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
            Post.find({postedBy:req.params.id})
            .populate("postedBy","_id name")
            .exec((err,posts)=>{
                if(err){
                    return res.status(422).json({error:err})
                }
                res.json({user,posts})
            })
    }).catch(err=>{
        return res.status(404).json({error:"User Not Found"})
    })
})

router.put("/follow",req_login,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
    },{new:true
    },(err,result)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            User.findByIdAndUpdate(req.user._id,{
                $push:{following:req.body.followId}
            },{new:true}).select("-password").then(result=>{
                res.json(result)
            }).catch(err=>{
                return res.status(422).json({error:err})
            })
    }
    )
})

router.put("/unfollow",req_login,(req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
    },{new:true
    },(err,result)=>{
            if(err){
                return res.status(422).json({error:err})
            }
            User.findByIdAndUpdate(req.user._id,{
                $pull:{following:req.body.unfollowId}
            },{new:true}).select("-password").then(result=>{
                res.json(result)
            }).catch(err=>{
                return res.status(422).json({error:err})
            })
    }
    )
})

router.put("/updatepic",req_login,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{$set:{pic:req.body.pic}},{new:true},(err,result)=>{
        if(err){
            return res.status(422).json({error:"upload failed"})
        }
        res.json(result)
    })
})


router.post('/searchusers',(req,res)=>{
    let userPattern = new RegExp("^"+req.body.query)
    User.find({email:{$regex:userPattern}})
    .select("_id email")
    .then(user=>{
        res.json({user})
    }).catch(err=>{
        console.log(err)
    })

})



module.exports = router