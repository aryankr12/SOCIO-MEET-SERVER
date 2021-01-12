const express = require('express')
const app = express()
const mongoose = require('mongoose')
const PORT = 5000
const {mongo_url} = require('./keys')
const cors = require('cors')
app.use(cors())

mongoose.connect(mongo_url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: true
    })
    .then(() => {
      console.log('Connected to database !!');
    })
    .catch((err)=>{
      console.log('Connection failed !!'+ err.message);
    });

require('./user_models/user')
require('./user_models/post')
//middleware

app.use(express.json())
app.use(require('./routes/authentication'))
app.use(require('./routes/post'))
app.use(require('./routes/user'))

app.listen(PORT,()=>{console.log("server is running on",PORT)})