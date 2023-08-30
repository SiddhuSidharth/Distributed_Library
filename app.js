const express = require('express');

const session=require("express-session");
const bp = require("body-parser");
const app = express();
app.use(bp.urlencoded({extended: true}));
// app.listen('https://distributed-library.onrender.com/', function() {
//     console.log("running...");
// });

// Configure session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.listen(3000, function() {
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
    name: { type: String, required: true },
    email: { type: String, required: true },
    pswd: { type: String, required: true },
    phno: { type: String, required: true },
    notifications: [String],
    booksTaken: [{
        bookname: String,
        edition: String,
        author: String,
        coursename: String,
        owner:String,
        returned: { type: Boolean, default: false }
    }],
    // returnedBooks: [{
    //     bookname: String,
    //     edition: String,
    //     author: String,
    //     coursename: String,
    //     takenDate: Date,
    //     returnedDate: Date
    // }]
});

const requestschema = mongoose.Schema({
    name: { type: String, required: true },
    bookname: { type: String, required: true },
    ownername: { type: String, required: true },
    approved: { type: Boolean, default: false } // Add an 'approved' flag
});


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


app.get("/myprofile", async function(req, res) {
    var query = req.query;
    var profilename = query.name;

    try {
        const user = await usermodel.findOne({ name: profilename }).populate('booksTaken');
        
        if (!user) {
            console.log("User not found");
            return res.sendFile(path.join(__dirname, "./404.html"));
        }

        res.render("myprofile", { "temp": user });
    } catch (err) {
        console.log("Error fetching user:", err);
        res.sendFile(path.join(__dirname, "./404.html"));
    }
});
app.post("/return-book", async function(req, res) {
    const name = req.body.name;
    const bookId = req.body.bookId;

    try {
        // Find the user by name
        const user = await usermodel.findOne({ name: name });
        
        if (!user) {
            console.log("User not found");
            return res.redirect(`/myprofile?name=${encodeURIComponent(name)}`);
        }

        // Find the book in the user's booksTaken array
        const bookIndex = user.booksTaken.findIndex(book => book._id.toString() === bookId);
        if (bookIndex === -1) {
            console.log("Book not found in user's profile");
            return res.redirect("/myprofile?name=" + name);
        }

        // Get the book to be returned
        const returnedBook = user.booksTaken[bookIndex];

        // Remove the book from the user's profile
        user.booksTaken.splice(bookIndex, 1);
        await user.save();
        returnedBook.returned = true;
        // Create a new book object to be inserted into the bookmodel collection
        const newBook = {
            bookname: returnedBook.bookname,
            edition: returnedBook.edition,
            author: returnedBook.author,
            owner:returnedBook.owner,
            coursename: returnedBook.coursename
        };

        // Add the returned book back to the bookmodel collection
        await bookmodel.create(newBook);

        console.log("Book returned:", returnedBook);
        res.redirect(`/myprofile?name=${encodeURIComponent(name)}`);
    } catch (err) {
        console.log("Error returning book:", err);
        res.redirect(`/myprofile?name=${encodeURIComponent(name)}`);
    }
});



app.get("/request", function(req, res)
    {
        var name = req.query.name
        var bookname = req.query.bookname
        var ownername = req.query.ownername
        if(ownername === name)
        {
            res.redirect("/home?name="+name);
            alert("Sorry,the book is been published by you");
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
                //inserting the request in the

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




app.get("/requestlist", async function(req, res) {
    var name = req.query.name;
    var newdata;
    try {
        const requests = await requestmodel.find({ ownername: name });
        res.render("requestlist", { "requests": requests, "name": name });
    } catch (err) {
        console.log("Error fetching requests:", err);
        res.sendFile(path.join(__dirname, "./404.html"));
    }
});




app.post("/approve-request", async function(req, res) {
    const requestId = req.body.requestId;
    const name = req.body.name;

    try {
        const request = await requestmodel.findByIdAndDelete(requestId);
        if (!request) {
            console.log("Request not found");
            return res.redirect("/requestlist?name=" + name);
        }

        // Get the book to be approved
        const bookToApprove = await bookmodel.findOne({ bookname: request.bookname, owner: request.ownername });
        if (!bookToApprove) {
            console.log("Book not found");
            return res.redirect("/requestlist?name=" + name);
        }

        // Add a notification to the user
        const user = await usermodel.findOneAndUpdate(
            { name: request.name },
            { $push: { notifications: "Your request has been approved for " + request.bookname } },
            { new: true }
        );

        // Add the approved book to the user's profile
        console.log(bookToApprove);
        await usermodel.findOneAndUpdate(
        
            { name: request.name },
            { $push: { booksTaken: bookToApprove.toObject() }},
            { new: true }
        );
        

        // Delete the book from the book collection
        await bookmodel.findOneAndDelete({ _id: bookToApprove._id });

        console.log("Request approved and book deleted:", request);
        res.redirect("/requestlist?name=" + name);
    } catch (err) {
        console.log("Error approving request:", err);
        res.redirect("/requestlist?name=" + name);
    }
});






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
// app.post("/register", async function(req, res){
//     var name = req.body.fname;
//     var email = req.body.email;
//     var pswd = req.body.pswd;
//     var phno = req.body.phno;

//     try {
//         await usermodel.create({
//             name: name,
//             email: email,
//             pswd: pswd,
//             phno: phno
//         });

//         console.log("Data inserted successfully!");
//         res.redirect("/login");
//     } catch (err) {
//         console.error("Error inserting data:", err);
//         // Handle error gracefully and respond to the client
//         res.status(500).send("Internal Server Error");
//     }
// });


app.post("/register", function(req, res){

    var name = req.body.fname
    var email = req.body.email
    var pswd  = req.body.pswd
    var phno = req.body.phno
    var data = {
        name: name,
        email: email,
        pswd: pswd,
        phno: phno
    };
    usermodel.create(data, (err, user) => {
        if (err) {
            console.error("Error inserting data:", err);
            // Handle error gracefully and respond to the client
            res.status(500).send("Internal Server Error");
        } else {
            console.log("Data inserted successfully!");
            res.redirect("/login");
        }
    });
    

})

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
app.get("/logout", function(req, res) {
    // Assuming you're using session middleware
    req.session.destroy(function(err) {
        if (err) {
            console.log("Error logging out:", err);
        } else {
            res.redirect("/login");
        }
    });
});



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

const atlasConnectionString = "mongodb+srv://Siddhu:iA8I1LvGIqpwxJUT@cluster0.txgrwjo.mongodb.net/?retryWrites=true&w=majority";
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
//iA8I1LvGIqpwxJUT





