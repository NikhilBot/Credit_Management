const express = require('express');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const app = express();


app.set('view engine', 'ejs');
app.set('views', 'views');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect("mongodb://localhost:27017/User", {
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    credit: Number
});

const transactionSchema = new mongoose.Schema({
    from: userSchema,
    to: userSchema,
    credits: Number,
    status: String
});

const User = new mongoose.model("User", userSchema);
const Transaction = new mongoose.model("Transaction", transactionSchema);

const user1 = new User({
    name: "A",
    email: "A@test.com",
    credit: 100
});
const user2 = new User({
    name: "B",
    email: "B@test.com",
    credit: 100
});
const user3 = new User({
    name: "C",
    email: "C@test.com",
    credit: 100
});
const user4 = new User({
    name: "D",
    email: "D@test.com",
    credit: 100
});
const user5 = new User({
    name: "E",
    email: "E@test.com",
    credit: 100
});
const user6 = new User({
    name: "F",
    email: "F@test.com",
    credit: 100
});
const user7 = new User({
    name: "G",
    email: "G@test.com",
    credit: 100
});
const user8 = new User({
    name: "H",
    email: "H@test.com",
    credit: 100
});
const user9 = new User({
    name: "I",
    email: "I@test.com",
    credit: 100
});
const user10 = new User({
    name: "J",
    email: "J@test.com",
    credit: 100
});

const userArray = [user1, user2, user3, user4, user5, user6, user7, user8, user9, user10];

User.find(function (err, users) {
    if (users.length == 0) {
        User.insertMany(userArray, function (err) {
            if (err) console.log(err);
            else console.log("Success!!");
        });
    }

});

app.get("/", function (req, res) {
    res.render("home");
});
app.use("/users", function (req, res) {

    User.find(function (err, users) {
        if (!err) {
            res.render("users", { users: users });
        }
    });

});


app.post("/user/:id", function (req, res) {
    const uid = req.params.id;
    User.findOne({ _id: uid }, function (err, userId) {
        if (err) console.log(err);
        else {
            req.user = userId;
            res.render("user", { user: userId });
        }
    });
});

app.post("/transfer/:id", function (req, res) {


    User.find(function (err, users) {
        if (!err) {
            User.findById(req.params.id, function (error, user) {

                res.render("transfer", { users: users, userDiscard: user });

            });
        }
    });

});

app.post("/credit", function (req, res) {

    console.log(req.body,req.body.credit, req.body.userFrom, req.body.userTo);
    const credit =  req.body.credit;
    const userTo = req.body.userTo;
    const userFrom = req.body.userFrom; 
    User.findById(userFrom, function (err, foundUser1) {
        if (!err) { 
            if (foundUser1.credit < +credit) {

                const transaction = new Transaction({
                    from: { 
                        name: foundUser1.name,
                        email: foundUser1.email,
                    },
                    credits: credit,
                    status: "Failed"
                });
                transaction.save();

                res.render("status",{title:"FAILED",message:"SORRY, YOU DON'T HAVE ENOUGH CREDIT POINTS!!!"});

            } else {
                User.updateOne({ _id: userFrom }, { credit: foundUser1.credit - +credit }, function (err) {
                    if (!err) {
                        console.log(foundUser1);


                        User.findById(userTo, function (err, foundUser2) {
                            if (!err) {
                                User.updateOne({ _id: userTo }, { credit: foundUser2.credit + +credit }, function (err) {
                                    if (!err) {
                                        console.log(foundUser2);

                                        const transaction = new Transaction({
                                            from: {
                                                name: foundUser1.name,
                                                email: foundUser1.email,
                                            },
                                            to: {
                                                name: foundUser2.name,
                                                email: foundUser2.email,
                                            },
                                            credits: credit,
                                            status: "Successful"
                                        });
                                        transaction.save();
                                        res.render("status",{title:"SUCCESSFUL",message:"HAVE A NICE DAY AHEAD :)"});
                                    }

                                });
                            }

                        });

                    }
                });
            }

        }

    });


});

app.listen(3000, function () {
    console.log("Ready");
});