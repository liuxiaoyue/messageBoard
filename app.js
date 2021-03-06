var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings');


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

//提供session支持
app.use(session({
    secret: settings.cookieSecret,
    store: new MongoStore({
        db: settings.db,
    })
}));

app.use('/', routes);
//注册页
app.use('/reg', routes);
app.use('/reg/invite', routes);
app.use('/reg/active/:active', routes);
//登陆页
app.use('/login', routes);
//修改密码
app.use('/set/pwd', routes);
//个人中心页
app.use('/u/:user', routes);
//首页
app.use('/home', routes);
//发布文章页
app.use('/publish', routes);
//忘记密码
app.use('/set/forgetpwd', routes);
//关于网站
app.use('/about', routes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//下面两行代码仅供开发时使用。
app.set('port', process.env.PORT || 3000);
app.listen(app.get('port'));

module.exports = app;
