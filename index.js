const express = require('express');
const mongoose = require("mongoose");

const User = require("./models/user");


const app = express();
app.use(express.json());

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
    response.render('register')
})

app.listen(2000,()=> {
    console.log("server running on localhost 2000");
})

app.post('/users/register',async(request,response) => {
    const {firstName,lastName,email,mobileNumber} = request.body;
    

})
