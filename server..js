
const express = require("express")
const server = express()
const cors = require("cors")
const dotenv = require("dotenv")
dotenv.config()
const path = require("path")
const bodyParser = require("body-parser")
const cookieParser =require("cookie-parser")

//adding the async handler(used for handling async errors)
const asyncHandler = require('express-async-handler')

//adding nodemailer
const mailer = require("nodemailer")

//add BCRYPT for password hashing
const bcrypt = require("bcrypt")

//Add MongoDB
const mongodb = require("mongodb")
// const MongoClient = mongodb.MongoClient
const client = new mongodb.MongoClient(process.env.DB_URL)

// use middleware
server.use(express.json())
server.use(express.static(path.join(__dirname,"public/css")))
server.use(cors())
server.use(bodyParser.urlencoded({extended:true}))
server.use(cookieParser())
server.set("view engine", "ejs")

//read the connection inside of the dotenv
const port = process.env.PORT || 3000
const db_name = process.env.DB_NAME;
const db_table = process.env.DB_TABLE;
server.get("/",(req,res)=>{
    res.render("home")
})

//setting up the mailer/nodemailer connection
const transporter = mailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: "tobilobasam300@gmail.com",
      pass: "bgjjpcbgblarccfw",
    },
  });


  // async..await is not allowed in global scope, must use a wrapper
async function main() {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: '"TOBILOBA" <tobilobasam300@gmail.com>', // sender address
      to: "tobilobasam300@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
  
  main().catch(console.error);

//call the register end point 
// server.use("/register", require("./routes/register"))
server.get("/register", (req,res)=>{
    res.render("register")
})
//process users data
server.post("/register", async(req,res)=>{
    const{username,password,confirm, email} =req.body
    if(password != confirm){
        res.status(400).send("password do not match")
    }
    const hashedPassword = await bcrypt.hash (password, 10)
    const profile = { username: username, password: hashedPassword, email: email};
    const feed = await client.db(db_name).
    collection(db_table).insertOne(profile);
    if(feed){
        res.send("registered successfully");
    }
    res.redirect("/login")
})


//call the login endpoint
server.get("/login", (req,res)=>{
    res.render("login")
})

//process login data
server.post("/login", (req,res)=>{
    res.redirect("/  ")
})

// server.get("/admin/login", (req,res)=>{
//     res.render("/admin/login")
// })

// server.post("/admin/login", (req,res)=>{
//     res.redirect("/  ")
// })


//connect to the express server 
server.listen (port,()=>{
    console.log (`server is running on port ${port}`)
})
