
var express = require('express');
var app     = express();
var port    = 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash   = require('connect-flash');

var morgan  = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser  = require('body-parser');
var session    = require('express-session');

var configDB = require('./config/database.js');

mongoose.connect(configDB.url);

app.use(morgan('dev'));
app.use(cookieParser());//读取cookie
app.use(bodyParser());

app.set('view egine','ejs');

app.use(session({secret:'adminiisyangjiadong'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require('./app/routes.js')(app,passport);
require('./config/passport')(passport);
app.listen(port,function(){
    console.log('Application is running on '+port);
})