require('dotenv').config();
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('./models/connection');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var productsRouter = require('./routes/products');
var advicesRouter = require('./routes/advices');
var rappelConsoRouter = require('./routes/rappelconso'); 
var frigoRouter = require('./routes/frigo');
var congeloRouter = require('./routes/congelo');
var placardRouter = require('./routes/placard');

var app = express();

const cors = require('cors');
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/advices', advicesRouter);
app.use('/rappels', rappelConsoRouter);
app.use('/frigo', frigoRouter);
app.use('/congelo', congeloRouter);
app.use('/placard', placardRouter);


module.exports = app;
