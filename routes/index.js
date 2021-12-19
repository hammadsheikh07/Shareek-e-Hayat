const express = require('express');
const router = express.Router();
const { ensuteAuthenticated,  } = require('../config/auth');

//Dashboard Route
router.get('/dashboard', ensuteAuthenticated, (req, res) =>
{
    res.render('dashboard', {
        name: req.user.name
    })
}

);
module.exports = router;
//welcome Route
router.get('/', (req, res) =>
{
    res.render('welcome')
})

