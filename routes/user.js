const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const Users = require('../models/Users');
const passport = require('passport');
const { redirect } = require('express/lib/response');
const upload = require("../config/multer")
const { ensuteAuthenticated,  } = require('../config/auth');

//Login page
router.get('/login', (req, res) => res.render('login'))

//Register Page
router.get('/register', (req, res) => res.render('register'))

//search Page
router.get('/search',ensuteAuthenticated, (req, res) => {
    res.render('search', {
        name: req.user.name
    })
}
)


//Register handle
router.post('/register', upload.single('profile_pic'), (req, res) => {
    const { name, email, age, City, Religion, Cast, password, password2 } = req.body
    const profile_pic = req.file.filename
    let errors = []
    //check required fields
    if (!name || !email || !age || !City || !Religion || !Cast || !password || !password2 || !profile_pic) {
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
            name,
            email,
            age,
            City,
            Religion,
            Cast,
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
                    name,
                    email,
                    age,
                    City,
                    Religion,
                    Cast,
                    password,
                    password2,
                    profile_pic
                })

            } else {
                const newUser = new Users({
                    name,
                    email,
                    age,
                    City,
                    Religion,
                    Cast,
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
                                res.render('dashboard', {
                                    name: name
                                })
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
            filters[filter] = searchParams.get(filter)
        }
        else if (filter === "search") {

            filters["$text"] = { $search: searchParams.get("search") }
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

module.exports = router;