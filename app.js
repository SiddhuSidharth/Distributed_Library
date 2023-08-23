const express = require('express');
const app = express();
const bp = require("body-parser");
app.use(bp.urlencoded({extended: true}));
app.listen('https://distributed-library.onrender.com/', function() {
    console.log("running...");
});

const https = require("https");
const path = require("path");
const {MongoClient} = require('mongodb');// load mongodb
const { connect } = require('http2');
const { assert, profile, Console } = require('console');
const mongoose = require('mongoose');
const ejs = require('ejs');
const { stringify } = require('querystring');
const { query } = require('express');
app.use(express.json())
app.set("view engine", "ejs")

const userschema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    pswd: {type: String, required: true},
    phno: {type: String, required: true},
    
})

const requestschema = mongoose.Schema({
    name: {type: String, required: true},
    bookname: {type: String, required: true},
    ownername: {type: String, required: true}
})

const booksschema = mongoose.Schema({
    bookname: {type: String, required: true},
    edition: {type: String, required: true},
    author: {type: String, required: true},
    owner: {type: String, required: true},
    coursename: {type: String, required: true},

})

const usermodel = mongoose.model("users", userschema)
const bookmodel = mongoose.model("books", booksschema)
const requestmodel = mongoose.model("requests", requestschema)


app.use(express.static(__dirname+ "/public"))


app.get("/", function(req, res)
    {
        res.sendFile(path.join(__dirname, "./index.html"));

    }
)
app.get("/profile", function(req, res)
    {
        var query = req.query;
        // console.log(query.name)
        var profilename = query.name
        // console.log(profilename)
        usermodel.find(function(err, val){
            if(err)
            {
                console.log("ERRROR!!!!!!!!!")
                console.log(err)
            }
            else
            {
                for(let i = 0; i<val.length; i++)
                {
                    var temp = val[i]

                    if(temp.name === profilename)
                    {
                         res.render("profile", {"temp": temp})
                        return
                    }
    
                }
                
                res.sendFile(path.join(__dirname, "./404.html"));
                return
            }
        })
        
    }
)


app.get("/myprofile", function(req, res)
    {
        var query = req.query;
        // console.log(query.name)
        var profilename = query.name
        // console.log(profilename)
        usermodel.find(function(err, val){
            if(err)
            {
                console.log("ERRROR!!!!!!!!!")
                console.log(err)
            }
            else
            {
                for(let i = 0; i<val.length; i++)
                {
                    var temp = val[i]

                    if(temp.name === profilename)
                    {
                         res.render("myprofile", {"temp": temp})
                        return
                    }
    
                }
                
                res.sendFile(path.join(__dirname, "./404.html"));
                return
            }
        })
        
    }
)


app.get("/request", function(req, res)
    {
        var name = req.query.name
        var bookname = req.query.bookname
        var ownername = req.query.ownername
        if(ownername === name)
        {
            res.redirect("/home?name="+name);
            console.log("Iam here")
            return
        }  
        data=
        {
            name: name,
            bookname: bookname,
            ownername: ownername
        }
        requestmodel.find(function(err, requests){
            if(err)
            {
                console.log("ERRROR!!!!!!!!!")
                console.log(err)
            }
            else
            {
                // console.log(requests)
                for(let i = 0; i<requests.length; i++)
                {
                    // console.log(requests[i].ownername)
                    // console.log(i)
                    // console.log(requests[i].ownername === ownername)
                    // console.log(requests[i].name === name)
                    // console.log(requests[i].bookname === bookname)

                    if(requests[i].ownername === ownername && requests[i].name === name && requests[i].bookname === bookname)
                    {
                        res.redirect("/home?name="+name);
                        console.log("Iam here")
                        return
                    }   
                }

                db.collection("requests").insertOne(
                    data, (err, collection) => {
                    if (err) {
                        throw err;
                    }
                    console.log("Data inserted successfully!");
                    res.redirect("/home?name="+name);
                    return
                    });
            }
        })
        
    }
)



app.get("/requestlist", function(req, res)
    {
        var name = req.query.name
        var newdata;
        requestmodel.find(function(err, requests){
            if(err)
            {
                console.log("ERRROR!!!!!!!!!")
                console.log(err)
            }
            else
            {
                newdata = requests
                newdata = newdata.filter(function(val){
                    return val.ownername === name;
                })
                res.render("requestlist", {"requests": newdata, "name": name})
                return
            }
        })
        
        
    }
)


app.get("/login", function(req, res)
    {
        res.sendFile(path.join(__dirname, "./login.html"));
    }
)
app.get("/home", function(req, res)
    {
        var name= req.query.name
        bookmodel.find(function(err, books){
            if(err)
            {
                console.log("ERRROR!!!!!!!!!")
                console.log(err)
            }
            else
            {
                res.render("home", {"books": books, "name":name});
            }
        })

    }
)

app.get("/register", function(req, res)
    {
        res.sendFile(path.join(__dirname, "./register.html"));
    }
)

app.get("/search", function(req, res)
    {
        res.sendFile(path.join(__dirname, "./search.html"));
    }
)

app.get("/enterbooks", function(req, res)
    {
        res.sendFile(path.join(__dirname, "./enterbooks.html"));
    }
)


app.post("/search", function(req, res){
    var bookname = req.body.bookname
    var name = req.query.name
    bookmodel.find(function(err, val){
        if(err)
        {
            console.log("ERRROR!!!!!!!!!")
            console.log(err)
        }
        else
        {
            for(let i = 0; i<val.length; i++)
            {
                var temp = val[i]
                if(temp.bookname === bookname)
                {
                    res.render("search1", {"book": temp, "name": name})
                    return
                }

            }
            
            res.sendFile(path.join(__dirname, "./404.html"));
            return
        }
    })

})


app.post("/login", function(req, res){
    // console.log("Iam here")
    var email = req.body.email
    var pswd  = req.body.pswd
    var flag = 0
    usermodel.find(function(err, val){
        if(err)
        {
            console.log("ERRROR!!!!!!!!!")
            console.log(err)
        }
        else
        {
            for(let i = 0; i<val.length; i++)
            {
                var temp = val[i]
                if(temp.email === email && temp.pswd === pswd)
                {
                    flag = 1
                    var redsrting = "/home?name=" +temp.name
                    res.redirect(redsrting)   
                    return
                }

            }
            
            res.sendFile(path.join(__dirname, "./logfailed.html"));
            return
        }
    })

})
app.post("/register", async function(req, res){
    var name = req.body.fname;
    var email = req.body.email;
    var pswd = req.body.pswd;
    var phno = req.body.phno;

    try {
        await usermodel.create({
            name: name,
            email: email,
            pswd: pswd,
            phno: phno
        });

        console.log("Data inserted successfully!");
        res.redirect("/login");
    } catch (err) {
        console.error("Error inserting data:", err);
        // Handle error gracefully and respond to the client
        res.status(500).send("Internal Server Error");
    }
});


// app.post("/register", function(req, res){

//     var name = req.body.fname
//     var email = req.body.email
//     var pswd  = req.body.pswd
//     var phno = req.body.phno
//     var data = {
//         name: name,
//         email: email,
//         pswd: pswd,
//         phno: phno
//     };
//     db.collection("users").insertOne(
//         data, (err, collection) => {
//           if (err) {
//             throw err;
//           }
//           console.log("Data inserted successfully!");
//           res.redirect("/login")
//           return
//         });

// })

app.post("/enterbooks", function(req, res){
    console.log(req.body)
    var name = req.query.name
    var bookname = req.body.bookname
    var edition = req.body.edition
    var author = req.body.author
    var owner = req.body.owner
    var coursename = req.body.coursename

    var data = {
        bookname:bookname,
        edition: edition,
        author: author,
        owner: owner,
        coursename: coursename
    };
    db.collection("books").insertOne(
        data, (err, collection) => {
          if (err) {
            throw err;
          }
          console.log("Data inserted successfully!");
          res.redirect("/home?name="+name)   
          return
        });

})



app.post("/", function(req, res){
    console.log(req.body)
})




// mongoose.connect("mongodb://localhost:27017/dislib", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }, function(err){
//     if(err)
//         console.log(err)
//     else
//         console.log("database connected")
// });
// var db = mongoose.connection;

const atlasConnectionString = "mongodb+srv://Siddhu:SMltgZVEYovuP6VB@cluster0.mhgxld4.mongodb.net/?retryWrites=true&w=majority";
//mongodb+srv://Sidharth:mbeL0CwdentOcvM5@cluster0.b9cftsu.mongodb.net/
//SMltgZVEYovuP6VB
mongoose.connect(atlasConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}, function (err) {
    if (err)
        console.log(err);
    else
        console.log("Database connected");
});

var db = mongoose.connection;




