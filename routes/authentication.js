const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User= mongoose.model("user")
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const {jwt_source_key} = require('../keys')
const req_login =require('../middleware/require_login')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const app = express()
const cors = require('cors')
app.use(cors())



//protected signin route method 
/*router.get('/protected',req_login,(req,res)=>{
    res.send("user loged in")
})
/*router.get('/',(req,res)=>{
    res.send("hello")
})*/
//status code 422: the sever understood the request but cannot process

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key:"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"
    }
}))

router.post('/signup',(req,res)=>{
    //console.log(req.body.name)
    const {name,email,password,pic} = req.body
    if(!email || !password || !name){
        return res.status(422).json({error:"check the input fields"})
    }
    //res.json({message:"successfuly sent"})
    User.findOne({email:email})//finding the user in the database with the email
    .then((savedUser)=>{
        if(savedUser){
            return res.status(422).json({error:"email already exist"})   
        }
        bcrypt.hash(password,12)//encrypting the password using bcrypt.hash function & parameter are password entered by the user along with salt value.
                                //salt - [REQUIRED] - the salt to be used to hash the password. if specified as a number then a salt will be generated with the specified number of rounds and used
        .then(hashedpassword=>{
            const user = new User({
                email,
                password:hashedpassword,
                name,
                pic
            })
            user.save()
            .then(user=>{
                transporter.sendMail({
                    to:user.email,
                    from:"kumaruttam813@gmail.com",
                    subject:"signup success",
                    html:"<h1>welcome to sociomeet</h1>"
                })
                res.json({message:"signed up succesfully"})
            })
            .catch(err=>{
                console.log(err)
            })
        })
        
    })
    .catch(err=>{
        console.log(err)})
})

//signin route..
router.post('/signin',(req,res)=>{
    const {email,password} = req.body //getting email and password entered by the user
    if(!email||!password){
      return  res.status(422).json({error:"Please Add Email or Password"})
    }
    User.findOne({email:email})//searching in the database if the user email = email entered
    .then(savedUser=>{
        if(!savedUser){
           return res.status(422).json({error:"Please Add Email or Password"})
        }
        bcrypt.compare(password,savedUser.password)
        .then(doMatch=>{
            if(doMatch){
                //res.json({message:"successfully signed in"})
                //so instead of responding the user with the json we are giving user a token.
                //if user want to access any protected resource after getting loged in user should come with a given token
                //if it is the same token which is provided then only we allow them to see the protected resources 
                const token = jwt.sign({_id:savedUser._id},jwt_source_key)
                const {_id,name,email,followers,following,pic} = savedUser
                res.json({token,user:{_id,name,email,followers,following,pic}})
            }
            else{
                return res.status(422).json({error:"Invalid Email or Password"})
            }
        })
        .catch(err=>{
            console.log(err)
        })
    })
})

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                return res.status(422).json({error:"user-email not found"})
            }
            user.resetToken = token
            user.expireToken = Date.now() + 3600000
            user.save().then((result)=>{
                transporter.sendMail({
                    to:user.email,
                    from:"kumaruttam813@gmail.com",
                    subject:"password-reset",
                    html:`<p>You initiated password reset request@sociomeet-herokuapp.com</p>
                            <h5>click <a href="http://localhost:3000/reset/${token}">link</a>to reset password</h5>
                            `
                })
                res.json({message:"password reset link is sent to your email"})
            })
        })
    })
})

router.post('/newpassword',(req,res)=>{
    const newPassword = req.body.password
    const sentToken = req.body.token
    User.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
    .then(user=>{
        if(!user){
            return res.status(422).json({error:"session expired"})
        }
        bcrypt.hash(newPassword,12).then(hashedpassword=>{
           user.password = hashedpassword
           user.resetToken = undefined
           user.expireToken = undefined
           user.save().then((saveduser)=>{
               res.json({message:"password updated successfully"})
           })
        })
    }).catch(err=>{
        console.log(err)
    })
})


module.exports = router