const jwt = require('jsonwebtoken')
const {jwt_source_key} =require('../keys')
const mongoose = require('mongoose')
const User = mongoose.model("user")
module.exports = (req,res,next)=>{
    const {authorization} = req.headers
    if(!authorization){
       return res.status(401).json({error:"user must be logged in"})
    }
    const token = authorization.replace("Bearer ","")
    jwt.verify(token,jwt_source_key,(err,payload)=>{
        if(err){
            return res.status(401).json({error:"user must be logged in"})
        }

        const {_id} = payload 
        User.findById(_id)
        .then(userdata=>{
            req.user = userdata
            next()
        })
        
    })
}