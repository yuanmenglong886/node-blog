

//  自带中间件->session-> flash -> 路由
 var fs = require('fs');
var fileMkdir = require('./Utils/fileUtils');
var logPath = './public/log/';
var accessLogName = 'accessLog.log';
var errorLogName = 'errorLog.log';
//创建目录
fileMkdir(logPath);
var accessLog = fs.createWriteStream(logPath+'/'+accessLogName, {flags: 'a'});
var errorLog = fs.createWriteStream(logPath+'/'+errorLogName, {flags: 'a'});



///  日志  保存功能

var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var settings = require('./settings');

//////
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
///////
var flash = require('connect-flash');

var multer = require('multer');


var log4js = require('log4js');
var logger4js = log4js.getLogger();

global.log = logger4js;
log4js.configure({
  appenders:[
    {type:'console'},
    {type:'file',filename:logPath+'/'+accessLogName,"maxLogSize":2048,'backups':3}
  ]
})

logger4js.trace('path='+__filename+':'+'trace log');
logger4js.debug('debug log');
logger4js.info('info log');
logger4js.warn('warn log');
logger4js.error('error log');
logger4js.fatal('fatal log');


var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

app.use(passport.initialize());

app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('trust proxy', 1);


// app.use(favicon(__dirname + '/public/favicon.ico'));
//    增加日志保存功能

app.use(logger('dev'));
var  dbStream = {
  write:function (line) {
     console.log(line);
  }
}
app.use(logger('short',{stream:dbStream}));
app.use(logger({stream: accessLog}));//

////////////////


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser("yuanmenglong"));
app.use(bodyParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

var  sess = {
  resave: false,  // 新增
  saveUninitialized: true, // 新增
  secret: settings.cookieSecret,
  key: settings.db,//cookie name
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port,
    url:"mongodb://127.0.0.1:27017/blog",
    auto_reconnect: true,
    ttl: 14 * 24 * 60 * 60, // = 14 days. Default
  }),
};
sess.cookie.secure = false;
app.use(session(sess));

/////////////////////////
app.use(multer({
  dest: './public/upload',
  rename: function (fieldname, filename) {
    return filename;
  }
}));


app.use(flash());




///////////////////


app.use(function(req, res, next){
  res.locals.error = req.flash('info') || "";
  res.locals.success = req.flash('info') || "";
  next();
});


 routes(app);
//////////////////

passport.use(new GithubStrategy({
  clientID: "8e3842da84d8da156bc2",
  clientSecret: "913ac614981ca714aec9f6efcd629f73584e2b56",
  callbackURL: "http://localhost:4000/login/github/callback"
}, function(accessToken, refreshToken, profile, done) {
  done(null, profile);
}));


app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;








































//
// var express = require('express');
// var path = require('path');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
// var cookieParser = require('cookie-parser');
// var bodyParser = require('body-parser');
// var ejs = require('ejs');
// var session = require('express-session');
// var MongoStore = require('connect-mongo')(session);
// var flash = require('connect-flash');
//
// var routes = require('./routes/index');
// var settings = require('./settings');
//
// var app = express();
//
//
// // app.set('port',process.env.PORT || 3000)
// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
//
//
// // uncomment after placing your favicon in /public
// //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
//
//
// // app.use('/', index);
// // app.use('/users', users);
// // // app.use('/login', login);
// // app.use('/login',function(req,res){
// //    res.send("hello world");
// // });
//
//
//
// app.use(session({
//   resave: true,  // 新增
//   saveUninitialized: true, // 新增
//   secret: settings.cookieSecret,
//   key: settings.db,//cookie name
//   cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},//30 days
//   store: new MongoStore({
//      url: 'mongodb://localhost/blog',
//      host:settings.host,
//      port:settings.port,
//      auto_reconnect: true,
//      ttl: 14 * 24 * 60 * 60 // = 14 days. Default
//   })
// }));
// app.use(flash());
// // app.use(function(req, res, next){
// //   res.locals.error = req.flash('error') || "";
// //   res.locals.success = req.flash('success') || "";
// //   next();
// // });
// routes(app);
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });
//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });
//
// app.listen(app.get('port'),function(){
//    console.log('Express server listening on port ' + app.get('port'));
// });
// module.exports = app;
