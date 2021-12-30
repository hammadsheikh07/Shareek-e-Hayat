const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const Users = require('../models/Users');
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

//recommend Page
router.get('/recommendations', ensuteAuthenticated, (req, res) => {
    res.render('recommend', {
        name: req.user.firstname,
        gender: req.user.gender,
        City:req.user.City
    })
}
)

//profile Page
router.get('/profile', ensuteAuthenticated, (req, res) => {
    res.render('profile-page', {
        name: req.user.firstname+" "+req.user.lastname,
        profile_pic: req.user.profile_pic,
        age:req.user.age,
        Cast:req.user.Cast,
        City:req.user.City,
        username:req.user.firstname
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
            name: myuser.firstname+" "+myuser.lastname,
            profile_pic:myuser.profile_pic,
            age:myuser.age,
            City:myuser.City,
            Cast:myuser.Cast,
           username:req.user.firstname
        })
    })
        .catch(err => {
            res.status(400).json({ err })
            console.error(err)
        })
})


module.exports = router;