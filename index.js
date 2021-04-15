require('dotenv').config()

const { request, response } = require('express');
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');


const User = require("./models/user");
let newUser;

const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');


const url = process.env.MONGO_URI;

const connectionParams={
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })




app.get('/',async(request,response) => {
    response.render("index")
})

app.get('/register',async(request,response)=> {
    response.render("register");
})


app.post('/users/register',async(request,response) => {
    try {
        const {firstName,lastName,email,mobileNumber} = request.body;
        const user = await User.findOne({email});
        if(user) {
            console.log("user already exists");
        }
        else {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: process.env.EMAIL_ID,
                  pass: process.env.PASSWORD,
                }
              });
              
              const mailOptions = {
                from: 'bharathchandra630@gmail.com',
                to: email,
                subject: 'Sending Email using Node.js',
                text: `Hi ${email}, This is just to verify your email.`
              };
              
              transporter.sendMail(mailOptions,async (error, info) => {
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response);
                   newUser = await {firstName,lastName,email,mobileNumber};
                  response.redirect('/password');
                }
              });
        }
    }
    catch(e) {
        console.log(e.message);
    }
})

app.get('/password',async(request,response)=>{
    response.render("password")
})

app.post('/users/password',async(request,response)=>{
    try {
        const {password} = request.body;
        const hashedPassword = await bcrypt.hash(password,10);
        newUser["password"] = hashedPassword;
        const user = await User.create(newUser);
        response.redirect("/login")
    }
    catch(e) {
        console.log(e.message);
    }
})


app.get('/login',async(request,response)=> {
    response.render('login')
})

app.post('/users/login',async (request,response)=>{
    const {email,password} = request.body
    const user = await User.findOne({email});
    if(user){
        const isPasswordValid = bcrypt.compare(password,user.password);
        if(isPasswordValid){
            response.redirect('/')
        }
        else{
            console.log("Password Incorrect")
        }
    }
    else {
        console.log("Invalid User")
    }
})

app.listen(2000,()=> {
    console.log("server running on localhost 2000");
})

