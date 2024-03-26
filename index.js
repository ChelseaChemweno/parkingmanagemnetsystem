const express = require("express")
const mysql = require("mysql")

const conn = mysql.createConnection({
    database: "parkingms",
    host: "localhost",
    user: "root",
    password: ""
})

const app = express()
app.use(express.static("public"))


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
app.get("/signin", (req,res)=>{
    res.render("signin.ejs")
})

// 404 route 
app.get("*", (req,res)=>{
    res.render("404.ejs")
})

app.listen(8000, ()=>console.log("Server running on port 8000"))