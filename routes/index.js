var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');

/* GET home page. */
router.get('/',checkNotLogin);
router.get('/',checkLogin);
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

/* GET reg page. */
router.get('/reg', function(req, res) {
  res.render('reg', { title: 'sign up messageBoard' });
});

router.post('/reg', function(req, res){
	if(req.body['password'] != req.body['password_repeat']){
		req.flash('error','两次输入的密码不一致');
		return res.redirect('/reg');
	}
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		mail : req.body.mail,
		name : req.body.username,
		password : password
	});
	//检查用户名是否已经存在
	User.get(newUser.name, function(err,user){
		if(user){
			err = 'username already exists';
		}
		if(err){
			req.flash('error',err);
			return res.redirect('/reg');
		}
		newUser.save(function(err, user){
			if(err){
				req.flash('error',err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success','注册成功');
			res.redirect('/u/' + user.name);
		});
	});
});
function checkNotLogin(req, res, next){
	if(!req.session.user){
		req.flash('error','用户未登录,请登录');
		return res.redirect('/login');
	}
	next();
}
function checkLogin(req, res, next){
	if(req.session.user){
		req.flash('error','用户已经登录');
	}
	next();
}

/* GET login page. */
router.get('/login',function(req, res){
	res.render('login', { title: 'Express' });
});

router.post('/login',function(req, res){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	User.get(req.body.username, function(err,user){
		if(!user){
			req.flash('error','用户名不存在');
			return res.redirect('/login');
		}else{
			if(user.password === password){
				req.session.user = user;
				req.flash('success','用户登录成功');
				return res.redirect('/u/' + user.name);
			}

			if(user.password != password){
				req.flash('error','用户密码错误');
				return res.redirect('/login');
			}
		}
	});
});

router.get('/u/:user',checkNotLogin);
/* GET user center page. */
router.get('/u/:user', function(req, res) {
	User.get(req.params.user,function(err, user){
		if(err){
			req.flash('error','数据读取失败');
			return res.redirect('/');
		}
		if(!user){
			req.flash('error','用户不存在');
			//此处应该跳到登录页 或者注册页 反正不要是个人中心页面
			return res.redirect('/');
		}
		//如果用户存在 应该到数据库中查找发表的留言 返回给页面响应。
		Post.get(req.params.user, function(err, user){
			if(err){
				req.flash('error','获取数据留言内容失败');
				return res.redirect('/');
			}
			if(user && user.posts){
				user.posts.forEach(function(item){
					var time = new Date(parseInt(item.time, 10));
					item.time = time.getFullYear() +
					'.' + time.getMonth() +
					'.' + time.getDate() +
					' ' + time.getHours() +
					':' + time.getMinutes() +
					':' + time.getSeconds();
				});
				res.render('index', { title: 'Express',posts: user.posts, name : user.name});
			}else{
				res.render('index', { title: 'Express', posts : '', name : req.params.user});
			}
		});
	});
});

//发表留言
router.post('/post',function(req, res){
	var newMessage = new Post({
		content : req.body.content,
		time : req.body.time
	});
	//检查用户名是否已经存在
	Post.get(req.body.name, function(err,user){
		if(user){
			newMessage.save(req.body.name,function(err, post){
				if(post){
					res.send(post);
				}
			});
		}
	});
});

router.get('/logout',checkNotLogin);
router.get('/logout', function(req, res){
	req.session.user = null;
	req.flash('success','用户已经退出登录');
	res.redirect('/login');
});

module.exports = router;
