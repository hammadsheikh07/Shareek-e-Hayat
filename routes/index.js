const express = require('express');
const router = express.Router();
const { ensuteAuthenticated,  } = require('../config/auth');

//Dashboard Route
router.get('/dashboard', ensuteAuthenticated, (req, res) =>
{
    res.render('dashboard', {
        username: req.user.firstname,
        name: req.user.firstname+" "+req.user.lastname,
        gender: req.user.gender
    })
}
);
module.exports = router;
//welcome Route
router.get('/', (req, res) =>
{
    res.render('welcome')
})

//Dashboard Route
router.get('/contactus', ensuteAuthenticated, (req, res) =>
{
    res.render('contactus', {
        username: req.user.firstname
    })
})

