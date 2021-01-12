const mongoose = require('mongoose')
const {ObjectId} = mongoose.Schema.Types

const userSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    }, 
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    resetToken:String,
    expireToken:String,
    pic:{
        type:String,
        default:"https://res.cloudinary.com/cloud-storage-813/image/upload/v1607198560/no_avatar_im9vz5.jpg"
    },
    followers:[{type:ObjectId,ref:"user"}]
    ,following:[{type:ObjectId,ref:"user"}]
})

mongoose.model("user",userSchema)