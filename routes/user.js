const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const Users = require('../models/Users');
const passport = require('passport');


//Login page
router.get('/login' , (req , res)=>res.render('login'))

//Register Page
router.get('/register' ,(req , res)=>res.render('register'))

//Register handle
router.post('/register' ,(req , res)=>{
    const {name , email ,age, password , password2} = req.body

    let errors = []
    //check required fields
    if(!name || !email || !age || !password || !password2){
        errors.push({msg : "all fields are compulsory"})
    }

    if(password != password2){
        errors.push({msg : "Passwords do not match"})
    }

    if(password.length<6){
        errors.push({msg : "Password should be more than 6 chars"})
    }

    if(errors.length > 0){
        res.json({
            errors,
            name,
            email,
            password,
            password2
        })
    }else{
        //Validation pass
        Users.findOne({email : email}).then(user =>{
            if(user){
                //User Exists
                errors.push({msg : 'email is already registeredx'})
                res.json({
                    errors,
                    name,
                    email,
                    age,
                    password,
                    password2

                })
               
            }else{
              const newUser = new Users({
                  name,
                  email,
                  age,
                  password
              })

                //hash password
                bcrypt.genSalt(10, (err , salt)=>{
                    bcrypt.hash(newUser.password ,salt , (err , hash) =>{
                        if(err) throw err
                        //set pass to hashed
                        newUser.password = hash
                        //save User
                        newUser.save()
                            .then(user =>{
                                res.render('dashboard',{
                                    name: name
                                })
                            })
                    })
                })
                console.log(newUser)
            }
        });
    }

});

//Login Handle
router.post('/login' , (req, res, next)=> {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout();
    res.send('logged out');
});

module.exports = router;

