// var express = require('express');
// var router = express.Router();
//
// /* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'yuanmenglong' });
// });

 // module.exports = router;
 var crypto = require('crypto');
 var flash = require('connect-flash');
 var  User = require('../models/user.js');
 var  Post = require('../models/post.js');
 var Comment = require('../models/comment.js');
 var passport = require('passport');



module.exports = function(app) {
    global.log.debug("11111yuanmenglongyuanmenglong");
    function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('info', '未登录!');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('info', '已登录!');
            res.redirect('back');//返回之前的页面
        }
        next();
    }


    app.get('/test', function(req, res){

        // Set a flash message by passing the key, followed by the value, to req.flash().
        req.flash('info', 'test is back!','yuanmenglong');
        res.redirect('/');
    });

    //  路由根目录
  // app.get('/', function (req, res) {
  //     console.log(req.session);
  //     console.log(req.sessionID);
  //     console.log(res.cookie);
  //     Post.getAll(null, function (err, posts) {
  //         if (err) {
  //             posts = [];
  //         }
  //         res.render('index', {
  //             title: '主页',
  //             user: req.session.user,
  //             message: req.flash('info'),
  //             posts:posts,
  //
  //         });
  //     });
  //     // res.setHeader('Cache-Control', 'max-age=0');
  //     // res.render("index", {
  //     //     title: '主页',
  //     //     user: req.session.user,
  //     //     message: req.flash('info'),
  //     //     posts:[],
  //     // });
  // });

    app.post('/login', checkNotLogin);
    app.post('/login', function (req,res) {
        // console.log("login");
        global.log.debug("11111yuanmenglongyuanmenglong");

        // 生成密码的md5值
        var md5 = crypto.createHash('md5');
        var password = md5.update(req.body.password).digest('hex');
        // 检查用户是否存在
        console.log('登陆用户');
        // req.session.user = {user:1};
        // req.flash('info', '登陆成功!');
        // console.log(req.session);
        // res.redirect('/');//登陆成功后跳转到主页

        User.get(req.body.name,function(err,user){

            console.log('bodyName'+req.body.name);
            if(!user){
                console.log('用户不存在');
                req.flash('info','用户不存在');
                return  res.redirect('/login'); // 用户不存在则跳转到登陆页
            }

            // 检查密码是否一致
            if(user.password != password){
                console.log('输入密码错误');
                req.flash('info','输入密码错误！');
                return  res.redirect('/login');// 密码错误则跳转到登陆页
            }

            req.session.user = user;
            res.cookie('user',user);
            // global.log.debug(res);
            global.log.debug(req);
            console.log("/login/login/login/login/login/login");
            console.log(res.cookie);

            // req.flash('info','登陆成功');
            // res.render("index", {
            //     title: '主页',
            //     user: req.session.user,
            //     message: req.flash('info'),
            // });
            req.session.save();
            res.req.session.user = user;
            res.secret = "yuanmenglong";
            res.cookie('user',user,{
                path:'/',//访问哪一个路径的时候我们给你加上cookie
                maxAge:20*60*1000,//cookie的存活时间,单位毫秒
                signed:true//是否加签名
            });
            console.log(req.session);
            console.log(req.sessionID);
            console.log(res.cookie);
            req.flash('info', '登陆成功!');
            console.log(req.session);
            console.log(req.sessionID);
            // res.location('http://localhost:4000/');
            res.redirect('/');//登陆成功后跳转到主页
            // 用户名密码都匹配后，将用户信息错误 session

        })

    });
    //  新的
    app.get('/', function (req, res) {
            console.log("////////////////////");
            console.log(req.session);
            console.log(req.sessionID);
        //判断是否是第一页，并把请求的页数转换成 number 类型
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //查询并返回第 page 页的 10 篇文章
        Post.getTen(null, page, function (err, posts, total) {
            if (err) {
                posts = [];
            }
            if(!posts.tags)
            {
                posts.tags = [];
            }
            res.render('index', {
                title: '主页',
                posts: posts,
                page: page,
                isFirstPage: (page - 1) == 0,
                isLastPage: ((page - 1) * 10 + posts.length) == total,
                user: req.session.user,
                message: req.flash('info').toString(),
            });
        });
    });
    // 注册页
    app.get('/reg', checkNotLogin);
  app.get('/reg', function (req, res) {
    res.render('reg', {
      title: '注册',
      user:req.session.user,
        message: req.flash('info').toString(),
    });
  });
    app.get('/login', checkNotLogin);
  app.get('/login', function (req,res,next) {
    var sess = req.session;
    res.render('login', {
        title:'登陆',
        user:req.session.user,
        message:req.flash('info').toString(),
    });
  });

    app.get("/login/github", passport.authenticate("github", {session: false}));
    app.get("/login/github/callback", passport.authenticate("github", {
        session: false,
        failureRedirect: '/login',
        successFlash: '登陆成功！'
    }), function (req, res) {
        req.session.user = {name: req.user.username};
        res.redirect('/');
    });


    app.get('/post', checkLogin);
  app.get('/post', function (req, res) {
    res.render('post', {
        title: '发表',
        user:req.session.user,
        message:req.flash('info').toString(),
    });
  });

    app.get('/logout', checkLogin);
  app.get('/logout', function (req, res) {
      res.req.session.user = null;
      req.flash('info','登出成功');
      res.redirect("/");// 登出成功后跳到
  });

    app.get('/upload', checkLogin);
    app.get('/upload', function (req, res) {
        res.render('upload', {
            title: '文件上传',
            user: req.session.user,
            message:flash('info').toString(),

        });
    });
    app.post('/upload', checkLogin);
    app.post('/upload', function (req, res) {
        req.flash('info', '文件上传成功!');
        res.redirect('/upload');
    });

    app.post('/post', checkLogin);
  app.post('/post', function (req, res) {
      var currentUser = req.session.user;
      console.log(req.body);
      var tags = new Array();
      if(req.body.tag1){
          tags.push(req.body.tag1);
      }
      if(req.body.tag2){
          tags.push(req.body.tag2);
      }
      if(req.body.tag3){
          tags.push(req.body.tag3);
      }
      // var post = new  Post(currentUser.name,req.body.title,tags,req.body.post);
      var  post = new Post(currentUser.name,req.body.head,req.body.title, tags, req.body.post);
      post.save(function (err) {
          if(err) {
              req.flash('info', err);
              return res.redirect('/');
          }
          req.flash('info', '发布成功!');
          res.redirect('/');//发表成功跳转到
      });
  });






    app.get('/reg', checkNotLogin);
  app.post('/reg', function (req, res) {
      var name = req.body.name;
      var password = req.body.password;
      var password_re = req.body['password-repeat'];
      //  res.send("username:"+name+"\n"+"password:"+password+"\n"+"password_re:"+password_re);
      //检验用户两次输入的密码是否一致
      if (password_re != password) {
          req.flash('info', '两次输入的密码不一致!');
          return res.redirect('/reg');//返回注册页
      }
      //生成密码的 md5 值
      var md5 = crypto.createHash('md5'),
          password = md5.update(req.body.password).digest('hex');
      var newUser = new User({
          name: name,
          password: password,
          email: req.body.email
      });
      //检查用户名是否已经存在
      User.get(newUser.name, function (err, user) {
          if (err) {
              req.flash('info', err);
              return res.redirect('/');
          }
          if (user) {
              req.flash('info', '用户已存在');
              return res.redirect('/reg');//返回注册页
          }
          //如果不存在则新增用户
              newUser.save(function (err, user) {
                  if (err) {
                      req.flash('info', err);
                      return res.redirect('/reg');//注册失败返回主册页
                  }
                  req.session.user = user;//用户信息存入 session
                  req.flash('info', '注册成功!');
                  res.redirect('/');//注册成功后返回主页
              });
      });
  });





    app.get('/archive', function (req, res) {
        Post.getArchive(function (err, posts) {
            if (err) {
                req.flash('info', err);
                return res.redirect('/');
            }
            if(!posts.tags){
                posts.tags = [];
            }
            res.render('archive', {
                title: '存档',
                posts: posts,
                user: req.session.user,
                message: req.flash('info').toString(),
            });
        });
    });




    app.get('/u/:name', function (req, res) {
        var page = req.query.p ? parseInt(req.query.p) : 1;
        //检查用户是否存在
        User.get(req.params.name, function (err, user) {
            if (!user) {
                req.flash('info', '用户不存在!');
                return res.redirect('/');
            }
            //查询并返回该用户第 page 页的 10 篇文章
            Post.getTen(user.name, page, function (err, posts, total) {
                if (err) {
                    req.flash('info', err);
                    return res.redirect('/');
                }
                if(!posts.tags){
                    posts.tags = [];
                }
                res.render('user', {
                    title: user.name,
                    posts: posts,
                    page: page,
                    isFirstPage: (page - 1) == 0,
                    isLastPage: ((page - 1) * 10 + posts.length) == total,
                    user: req.session.user,
                    message: req.flash('info').toString(),
                });
            });
        });
    });


    // app.get('/u/:name',function (req,res) {
    //     //检查用户是否存在
    //     User.get(req.params.name,function (err,user) {
    //         if(!user){
    //             req.flash('info','用户不存在');
    //             return res.redirect('/');//用户不存在则跳转到主页
    //         }
    //         // 查询并返回该用户的所有文章
    //         Post.getAll(user.name,function (err,posts) {
    //             if(err){
    //                 req.flash('info',err);
    //                 return res.redirect('/');
    //             }
    //             res.render('user',{
    //                 title:user.name,
    //                 posts:posts,
    //                 user:req.session.user,
    //                 message:req.flash('info').toString(),
    //             });
    //         });
    //     });
    // });
     app.get('/u/:name/:day/:title', function (req, res) {
        Post.getOne(req.params.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('info', err);
                return res.redirect('/');
            }
            // console.log(post.tags);

            if(!post.tags){
                post.tags = [];
            }
            if(!(post.tags instanceof  Array))
            {
                post.tags = [];
            }
            console.log(post);
            // if(post.name == "errorName")
            // {
            //     post.name = req.session.user.name;
            // }            console.log(req.session.user);
            res.render('article', {
                title: req.params.title,
                posts: post,
                user: req.session.user,
                tags:req.tags,
                message: req.flash('info').toString(),
            });
        });
    });
    app.get('/edit/:name/:day/:title', checkLogin);
    app.get('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.edit(currentUser.name, req.params.day, req.params.title, function (err, post) {
            if (err) {
                req.flash('info', err);
                return res.redirect('back');
            }
            if(!post.tags){
                post.tags = [];
            }
            res.render('edit', {
                title: '编辑',
                posts: post,
                user: req.session.user,
                message: req.flash('info').toString(),
            });
        });
    });
    app.post('/edit/:name/:day/:title', checkLogin);
    app.post('/edit/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.update(currentUser.name, req.params.day, req.params.title, req.body.post, function (err) {
            var url = encodeURI('/u/' + req.params.name + '/' + req.params.day + '/' + req.params.title);
            if (err) {
                req.flash('info', err);
                return res.redirect(url);//出错！返回文章页
            }
            req.flash('info', '修改成功!');
            res.redirect(url);//成功！返回文章页
        });
    });

    app.get('/remove/:name/:day/:title', checkLogin);
    app.get('/remove/:name/:day/:title', function (req, res) {
        var currentUser = req.session.user;
        Post.remove(currentUser.name, req.params.day, req.params.title, function (err) {
            if (err) {
                req.flash('info', err);
                return res.redirect('back');
            }
            req.flash('info', '删除成功!');
            res.redirect('/');
        });
    });

    app.post('/u/:name/:day/:title', function (req, res) {
        var date = new Date(),
            time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
        // var comment = {
        //     name: req.body.name,
        //     email: req.body.email,
        //     website: req.body.website,
        //     time: time,
        //     content: req.body.content
        // };
        var md5 = crypto.createHash('md5'),
            email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
            head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";
        var comment = {
            name: req.body.name,
            head: head,
            email: req.body.email,
            website: req.body.website,
            time: time,
            content: req.body.content
        };
        var newComment = new Comment(req.params.name, req.params.day, req.params.title, comment);
        newComment.save(function (err) {
            if (err) {
                req.flash('info', err);
                return res.redirect('back');
            }
            req.flash('info', '留言成功!');
            res.redirect('back');
        });
    });

    app.get('/tags', function (req, res) {
        Post.getTags(function (err, posts) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/');
            }
            if(!posts.tags){
                posts.tags = [];
            }
            res.render('tags', {
                title: '标签',
                posts: posts,
                user: req.session.user,
                message: req.flash('info').toString(),
            });
        });
    });
    app.get('/tags/:tag', function (req, res) {
        Post.getTag(req.params.tag, function (err, posts) {
            if (err) {
                req.flash('info',err);
                return res.redirect('/');
            }
            if(posts.tags){
                posts.tags = [];
            }
            res.render('tag', {
                title: 'TAG:' + req.params.tag,
                posts: posts,
                user: req.session.user,
                message: req.flash('info').toString(),
            });
        });
    });


    app.get('/links', function (req, res) {
        res.render('links', {
            title: '友情链接',
            user: req.session.user,
            message:req.flash('info').toString(),
        });
    });
    
    
    app.get('/search', function (req, res) {
        Post.search(req.query.keyword, function (err, posts) {
            if (err) {
                req.flash('info', err);
                return res.redirect('/');
            }
            res.render('search', {
                title: "搜索:" + req.query.keyword,
                posts: posts,
                user: req.session.user,
                message: req.flash('info').toString()
            });
        });
    });
    app.get('/reprint/:name/:day/:title', checkLogin);
    app.get('/reprint/:name/:day/:title', function (req, res) {
        Post.edit(req.params.name, req.params.day, req.params.title, function (err, post) {
            console.log("err"+err);
            if (err) {
                req.flash('info', err);
                return res.redirect(back);
            }
            var currentUser = req.session.user;
            console.log(req.session.user);
            console.log(post);
                if(post){
                    var    reprint_from = {name: post.name, day: post.time.day, title: post.title};
                    var    reprint_to = {name: currentUser.name, head: currentUser.head};
                     console.log("reprint_from"+reprint_to);
                    console.log("reprint_from"+reprint_from);
                    Post.reprint(reprint_from, reprint_to, function (err, post) {
                        console.log("error  yuanemnglong");
                        console.log(err);
                        if (err) {
                            req.flash('info', err);
                            return res.redirect('back');
                        }
                        req.flash('info', '转载成功!');
                        var string = '/u/' + post.name + '/' + post.time.day + '/' + post.title;
                        var url = encodeURI(string);
                        console.log("url"+url);
                        //跳转到转载后的文章页面
                        // res.redirect(url);
                    });
            }
        });
    });
    
    
    
    
    
    native(app);
    error404(app);
    //   服务器端没有定义的路由跳转到 404 页面


}

var native = function (app) {
    // global.log.debug(app);
    // 提供native 登陆的接口
    app.use('/native/login',function (req,res) {
        res.send({name:"yuanmenglong",age:35,id:"12312421"});
    })
    //   提供服务器
    app.use('/native',function (req,res) {
        res.send({object:{yuan:"xiao",age:23,height:100,school:'xianlidaxue'},yy:'xuaizkag'});
    })
}
var error404 = function (app) {
    app.use(function (req, res) {
        if (!res.headersSent) {
            res.redirect('/');
            // res.render("404");
        }
    });
}