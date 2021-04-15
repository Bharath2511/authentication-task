//for config
require('dotenv').config()

//node packages
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

//user model
const User = require("./models/user");

//global vars
let newUser;
let code;
let queryEmail;

//initializing express
const app = express();

//mongoose middleware
mongoose.set('useFindAndModify', false);

//body-parser middleware
app.use(bodyParser.urlencoded({extended:true}));

// for accessing public images,css
app.use(express.static(__dirname + '/public'));

//setting template engine as ejs
app.set('view engine','ejs');

// mongo atlas uri
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


 //for sending emails   
const sendEmail = (firstName,lastName,email,mobileNumber) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.PASSWORD,
        }
      });
      
      const mailOptions = {
        from: process.env.EMAIL_ID,
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
        }
      });
}

//for generating code
const codeGenerator = async () => {
    const code =  await (Math.floor(100000 + Math.random() * 900000));
    return code;
}

//index API
app.get('/',async(request,response) => {
    response.render("index")
})

//register form API
app.get('/register',async(request,response)=> {
    response.render("register");
})

//register API
app.post('/users/register',async(request,response) => {
    try {
        const {firstName,lastName,email,mobileNumber} = request.body;
        const user = await User.findOne({email});
        if(user) {
            console.log("user already exists");
        }
        else {
            await sendEmail(firstName,lastName,email,mobileNumber);
            response.redirect('/password');
        }
    }
    catch(e) {
        console.log(e.message);
    }
})

//reset password form
app.get('/password',async(request,response)=>{
    response.render("password")
})

//reset password API
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

//login form
app.get('/login',async(request,response)=> {
    response.render('login')
})

// login API
app.post('/users/login',async (request,response)=>{
    const {email,password} = request.body
    const user = await User.findOne({email});
    if(user){
        const isPasswordValid = bcrypt.compare(password,user.password);
        if(isPasswordValid){
            queryEmail = await user.email
            response.redirect('/dashboard')
        }
        else{
            console.log("Password Incorrect")
        }
    }
    else {
        console.log("Invalid User")
    }
})

//forgot password form
app.get('/forgot-password',async(request,response)=>{
    const {email} = request.body;
    response.render("forgot-password-email")
})

//forgot password API
app.post('/users/forgotpassword-email',async(request,response)=>{
try {
    let {email} = request.body;
    let user = User.findOne({email});
    if(user) {
        code = await codeGenerator();
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_ID,
              pass: process.env.PASSWORD,
            }
          });
          
          const mailOptions = {
            from: process.env.EMAIL_ID,
            to: email,
            subject: 'Forgot Password',
            text: `Hi ${email}, ${code} is your one time passcode`
          };
          
          transporter.sendMail(mailOptions,async (error, info) => {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              response.render("forgot-password-passcode")
            }
          });
    }
}
catch(e){

}
    
})

app.post('/users/forgotpassword-passcode',async(request,response)=>{
    try {
        const {passcode} = request.body;
        if(parseInt(passcode) === code) {
            response.render('reset-password')
        }
    }
    catch(e){
        console.log(e.message)
    }

})

// reset password api
app.post('/users/reset-password',async(request,response)=>{
    try {
        const {email,password,confirmPassword} = request.body
        const user = await User.findOne({email})
        if(user) {
            if(password === confirmPassword) {
                const {id,firstName,lastName,email,mobileNumber} = user
                const newPassword = await bcrypt.hash(password,10)
                const updatedUser = {
                    firstName,
                    lastName,
                    email,
                    mobileNumber,
                    newPassword
                }
                const updateUser = await User.findByIdAndUpdate(id,updatedUser);
                queryEmail = await email
                response.redirect('/dashboard')
            }
            else {
                console.log("enter valid password")
            }
            
        }
    }
    catch(e) {
        console.log(e.message)
    }
})

// dashboard API
app.get('/dashboard',async(request,response)=>{
    const userDetails = await User.findOne({email:queryEmail})
    response.render('dashboard',{user:userDetails})
})

const port = process.env.port || 2000

app.listen(port,()=> {
    console.log("server running on localhost 2000");
})

