const express = require("express")
const mysql = require("mysql")
const bcrypt = require("bcrypt")
const session = require("express-session")
const conn = mysql.createConnection({
    database: "parkingms",
    host: "localhost",
    user: "root",
    password: ""
})

const app = express()
app.use(express.static("public"))
app.use(express.urlencoded({extended: true})) // bodyparser -- req.body - with form data
app.use(session({
    secret: "cat",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 600000}
}))
app.use((req,res,next)=>{
    const protectedRoutes = [,"/profile","/bookspace"]
    if(req.session && req.session.user ){
        res.locals.user = req.session.user
        next()
    }else if(protectedRoutes.includes(req.path)){
        // cookie
        res.redirect("/signin?message=signin")
    }else {
        next()
    }   
})

app.get("/", (req,res)=>{
    res.render("home.ejs")
})
app.get("/about", (req,res)=>{
    res.render("about.ejs")
})
app.get("/contact", (req,res)=>{
    res.render("contact.ejs")
})
app.get("/services", (req,res)=>{
    res.render("services.ejs")
})
app.get("/booknow", (req,res)=>{
    conn.query("SELECT * FROM locations", (sqlErr, locations)=>{
        if(sqlErr){
            res.status(500).render("500.ejs", {message: "Server Error: Contact Admin if this persists"})
        }else{
            console.log(locations);
            // destructuring objects in js -- es6 feature
            res.render("locations.ejs", {locations: locations})
        }
    })    
})

app.get("/spaces", (req,res)=>{
    // depending the location, we will fetch all spaces for that location
    // console.log(req.path);
    // console.log(req.query);
    const location = req.query.location
    const spacesQuery = `SELECT * FROM spaces WHERE space_location='${location}'`

    conn.query(spacesQuery, (sqlErr, spaces)=>{
        if(sqlErr){
            res.status(500).render("500.ejs", {message: "Server Error: Contact Admin if this persists"})
        }else{
            res.render("spaces.ejs", {spaces: spaces})
        }
    })
})
app.get("/signup", (req,res)=>{
    res.render("signup.ejs")
})
app.post("/signup", (req,res)=>{
  if(req.body.pass === req.body.confirmPass){
     conn.query(`SELECT email FROM users WHERE email = "${req.body.email}"`, (sqlError, emailData)=>{
        if(sqlError){
            res.status(500).render("signup.ejs", {error: true, errMessage: "Server Error: Contact Admin if this persists.", prevInput: req.body  } )
        }else{
            if(emailData.length>0){
                res.render("signup.ejs", {error: true, errMessage: "Email Already Registered. Login with email and password!", prevInput: req.body  } )
            }else{
                let sqlStatement = `INSERT INTO users(email,fullname,password,phone) VALUES( "${req.body.email}", "${req.body.fullname}", "${bcrypt.hashSync(req.body.pass, 5)}", "${req.body.phone}")`
                conn.query(sqlStatement, (sqlErr)=>{
                    if(sqlErr){
                        res.status(500).render("signup.ejs", {error: true, errMessage: "Server Error: Contact Admin if this persists.", prevInput: req.body  } )
                    }else{
                        res.status(304).redirect("/signin?signupSuccess=true")
                    }
                }) 
            }
        }
     })             
  }else{
      res.render("signup.ejs", {error: true, errMessage: "password and confirm password do not match!", prevInput: req.body  } )
  }
})

app.get("/signin", (req,res)=>{   
    if(req.query.signupSuccess){
        res.render("signin.ejs", {message: "Signup successful!! You can now log in."})
    }else if(req.query.message){
        res.render("signin.ejs", {message: "Sign in to book a space."})
    }else{
         res.render("signin.ejs")
    }
})

app.post("/signin", (req,res)=>{
    const loginStatement = `SELECT email,fullname, password FROM users WHERE email = '${req.body.email}'`
    conn.query(loginStatement, (sqlErr, userData)=>{
        if(sqlErr){
            console.log(sqlErr.message);
            res.status(500).render("signin.ejs", {error: true, message: "Server Error, Contact Admin if this persists!",  prevInput: req.body })
        }else{
            console.log(userData);
            if(userData.length == 0){
                res.status(401).render("signin.ejs", {error: true,message: "Email or Password Invalid", prevInput: req.body })
            }else{
                if( bcrypt.compareSync(req.body.pass,userData[0].password ) ){
                    // create a session
                    // res.cookie("email",userData[0].email, {maxAge: 60} )
                    req.session.user = userData[0]
                    res.redirect("/")
                }else{
                    res.status(401).render("signin.ejs", {error: true,message: "Email or Password Invalid", prevInput: req.body })
                }
            }
        }
    })
})

// 404 route 
app.get("*", (req,res)=>{
    res.render("404.ejs")
})

app.listen(8000, ()=>console.log("Server running on port 8000"))