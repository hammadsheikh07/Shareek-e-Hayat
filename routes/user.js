const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose');
const Users = require('../models/Users');
const request = require('../models/requests')
const friend = require('../models/friends')
const passport = require('passport');
const { redirect } = require('express/lib/response');
const upload = require("../config/multer")
const { ensuteAuthenticated, } = require('../config/auth');

//Login page
router.get('/login', (req, res) => res.render('login'))

//Register Page
router.get('/register', (req, res) => res.render('register'))

//search Page
router.get('/search', ensuteAuthenticated, (req, res) => {
    res.render('search', {
        name: req.user.firstname,
        gender: req.user.gender
    })
}
)


//show friends
router.get('/friends', ensuteAuthenticated, (req, res) => {
    res.render('displayfrens', {
        name: req.user.firstname,
        id: req.user._id
    })
}
)

//recommend Page
router.get('/recommendations', ensuteAuthenticated, (req, res) => {
    res.render('recommend', {
        name: req.user.firstname,
        gender: req.user.gender,
        City: req.user.City
    })
}
)

//show requests
router.get('/showrequests', ensuteAuthenticated, (req, res) => {
    res.render('request', {
        name: req.user.firstname,
        id: req.user._id
    })
}
)

//profile Page
router.get('/profile', ensuteAuthenticated, (req, res) => {
    res.render('myprofile', {
        name: req.user.firstname + " " + req.user.lastname,
        profile_pic: req.user.profile_pic,
        age: req.user.age,
        Cast: req.user.Cast,
        City: req.user.City,
        username: req.user.firstname
    })
}
)


//Register handle
router.post('/register', upload.single('profile_pic'), (req, res) => {
    const { firstname, lastname, email, age, City, Religion, Cast, gender, password, password2 } = req.body
    const profile_pic = req.file.filename
    let errors = []
    //check required fields
    if (!firstname || !lastname || !email || !age || !City || !Religion || !gender || !Cast || !password || !password2 || !profile_pic) {
        errors.push({ msg: "all fields are compulsory" })
    }

    if (password != password2) {
        errors.push({ msg: "Passwords do not match" })
    }

    if (password.length < 6) {
        errors.push({ msg: "Password should be more than 6 chars" })
    }

    if (errors.length > 0) {
        res.json({
            errors,
            firstname,
            lastname,
            email,
            age,
            City,
            Religion,
            Cast,
            gender,
            password,
            password2,
            profile_pic
        })
    } else {
        //Validation pass
        Users.findOne({ email: email }).then(user => {
            if (user) {
                //User Exists
                errors.push({ msg: 'email is already registered' })
                res.json({
                    errors,
                    firstname,
                    lastname,
                    email,
                    age,
                    City,
                    Religion,
                    Cast,
                    gender,
                    password,
                    password2,
                    profile_pic
                })

            } else {
                const newUser = new Users({
                    firstname,
                    lastname,
                    email,
                    age,
                    City,
                    Religion,
                    Cast,
                    gender,
                    password,
                    profile_pic
                })

                //hash password
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err
                        //set pass to hashed
                        newUser.password = hash
                        //save User
                        newUser.save()
                            .then(user => {
                                passport.authenticate('local', {
                                    successRedirect: '/dashboard',
                                    failureRedirect: '/users/login',
                                    failureFlash: true
                                })(req, res);
                            })
                    })
                })
            }
        });
    }

});

//Login Handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    return res.redirect('/');
});


router.get('/', (req, res) => {
    const searchParams = new URLSearchParams(req.query)
    const filters = {};
    const keys = searchParams.keys()
    for (let filter of keys) {
        if (filter !== "search") {
            if (filter == "age") {
                filters[filter] = Number(searchParams.get(filter))
            }
            else
                filters[filter] = searchParams.get(filter)
        }
        else if (filter === "search") {

            filters["$text"] = { $search: searchParams.get("search"), $language: "en" }
        }
    }
    Users.aggregate([{
        $match: {

            ...filters
        }
    }]).then(Users => {
        res.json({ Users })
    }).catch(err => {
        console.log(err)
        res.status(400).json({ err });
    })
});

router.get('/user/:id', ensuteAuthenticated, (req, res) => {
    const id = req.params.id;
    Users.findOne({ _id: id }).then(myuser => {
        res.render('profile-page', {
            id: myuser._id,
            name: myuser.firstname + " " + myuser.lastname,
            profile_pic: myuser.profile_pic,
            age: myuser.age,
            City: myuser.City,
            Cast: myuser.Cast,
            username: req.user.firstname,
            currid: req.user._id
        })
    }).catch(err => {
        res.status(400).json({ err })
        console.error(err)
    })
})



//send request
router.post('/user/sendrequest/:id', ensuteAuthenticated, (req, res) => {
    const sendid = req.user._id;
    const recid = req.params.id;
    const newrequest = new request({
        senderid: sendid,
        recieverid: recid
    })
    newrequest.save().then(newrequest => {
        res.status(200).json({ newrequest })
    }).catch(err => {
        console.log(err)
        res.status(400).json({ err });
    })
})


//check request
router.get('/user/checkrequest/:id', ensuteAuthenticated, (req, res) => {
    const sendid = req.user._id;
    const recid = req.params.id;
    request.findOne({
        senderid: sendid,
        recieverid: recid
    }).then(requs => {
        res.status(200).json({ requs })
    }).catch(err => {
        res.status(400).json({ err });
    })
})


//check friend
router.get('/user/checkfriend/:id/:id2', ensuteAuthenticated, (req, res) => {
    const sendid = req.params.id2;
    const recid = req.params.id;
    friend.findOne({
        userid2: sendid,
        userid1: recid
    }).then(requs => {
        res.status(200).json({ requs })
    }).catch(err => {
        res.status(400).json({ err });
    })
})



//request notifications
router.get('/user/countrequests/:id', ensuteAuthenticated, (req, res) => {
    const recid = req.params.id;
    request.find({
        recieverid: recid
    }).then(requs => {
        res.status(200).json({ requs })
    }).catch(err => {
        res.status(400).json({ err });
    })
})


//get requests
router.get('/user/showrequests/:id', ensuteAuthenticated, (req, res) => {
    const recid = req.params.id;
    request.find({
        recieverid: recid
    }).populate("senderid").then(requs => {
        res.status(200).json({ requs })
    }).catch(err => {
        res.status(400).json({ err });
    })
})


//addfriend
router.post('/user/addfriend/:id', ensuteAuthenticated, (req, res) => {
    const id1 = req.params.id;
    const id2 = req.user._id;
    console.log(id1)
    console.log(id2)
    const newfriends = new friend({
        userid1: id1,
        userid2: id2
    })
    const newfriends2 = new friend({
        userid1: id2,
        userid2: id1
    })
    newfriends.save().then(newfriends => {
        newfriends2.save().then(newfriends2 => {
            request.deleteOne({
                senderid: id1,
                recieverid: id2
            }).then(deleted => {
                res.status(200).json({ newfriends })
            }).catch(err => {
                console.log(err)
                res.status(400).json({ err });
            })
        }).catch(err => {
            console.log(err)
            res.status(400).json({ err });
        })
    }).catch(err => {
        console.log(err)
        res.status(400).json({ err });
    })
})


//delete request
router.post('/user/delreq/:id', ensuteAuthenticated, (req, res) => {
    const id1 = req.params.id;
    const id2 = req.user._id;
    request.deleteOne({
        senderid: id1,
        recieverid: id2
    }).then(deleted => {
        res.status(200).json({ deleted })
    }).catch(err => {
        console.log(err)
        res.status(400).json({ err });
    })
})



//get friends
router.get('/user/showfriends/:id', ensuteAuthenticated, (req, res) => {
    const id = req.params.id
    friend.find({ userid2: id })
    .populate("userid1").then(requs => {
    res.status(200).json({ requs })
}).catch(err => {
    res.status(400).json({ err, id: req.user._id });
})
})
module.exports = router;