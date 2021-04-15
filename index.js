const { request, response } = require('express');
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');


const User = require("./models/user");


const app = express();

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

app.set('view engine','ejs');


const url = `mongodb+srv://bharath:bharath@cluster0.1tpbq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

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

app.listen(2000,()=> {
    console.log("server running on localhost 2000");
})

app.post('/users/register',async(request,response) => {
    try {
        const {firstName,lastName,email,mobileNumber} = request.body;
        const user = await User.findOne({email});
        if(user) {
            console.log("user already exists");
        }
        else {
            const newUser = {firstName,lastName,email,mobileNumber};
            const result = await User.create(newUser);    
            response.redirect('/login');    
        }
    }
    catch(e) {
        console.log(e.message);
    }
})

app.get('/login',async(request,response)=> {
    response.render('login')
})

app.post('/users/login',(request,response)=>{
    console.log(request.body);
})
