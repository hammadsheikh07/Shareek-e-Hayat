const  express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');


const app = express();

//DB config
const db = require('./config/keys').MongoURI;
const { render } = require('express/lib/response');

// Passport Config
require('./config/passport')(passport);

//Connect to Mongo
mongoose.connect(db ,{
    useNewUrlParser: true,
}).then(()=>{
    console.log('MongoDB connected .....')
}).catch(err=> console.log(err))

//BodyParser
app.use(express.urlencoded({extended : false}));

app.use(expressLayouts);
app.set('view engine' ,'ejs');

//resources
app.use("/resources",express.static("./Resources"))
app.use("/uploads",express.static("./profile_pics"))
//BodyParser
app.use(express.urlencoded({extended : false}));

//Express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect Flash
app.use(flash());

//Global Vars
app.use(function(req, res, next){
res.locals.success_msg = req.flash('success_msg');
res.locals.error_msg = req.flash('error_msg');
res.locals.error = req.flash('error');
next();
});

//Routes
app.use('/' , require('./routes/index.js'))
app.use('/users' , require('./routes/user'))

const PORT = process.env.PORT || 5001;

app.listen(PORT , console.log(`server started on port successfully ${PORT}`));
