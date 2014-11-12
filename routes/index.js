var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var Post = require('../models/post');
var base64 = require('../lib/base64');
var mail = require('../lib/mail');
var util = require('../lib/utils');

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

router.get('/home', function(req, res){
	if(req.session.user){
		res.render('index',{
			title : '留言首页',
			name : req.session.user.name
		});
	}else{
		return res.redirect('/login');
	}
});

/* GET reg page. */
router.get('/reg', function(req, res) {
	if(req.session.user){
		return res.redirect('/home');
	}else{
		res.render('reg', { title: 'sign up messageBoard' });
	}
});
router.post('/reg/invite', function(req, res){
	if(req.session.is_login){
		return res.redirect('/home');
	}else{
		var email = req.body.mail.trim(),
			nick = req.body.nickname.trim();
		var activeUrl = 'http://127.0.0.1:3000/reg/active/' + encodeURIComponent(base64.encode('accounts=' + encodeURIComponent(email) + '&timestamps=' + new Date().getTime() + '&nick=' + encodeURIComponent(nick)));
		console.log(activeUrl);
		User.get(email, function(err,user){
			if(!err || !user){
				mail.sendMail({
					to : email,
					subject: nick +',欢迎注册海蓝之星留言板!',
					html: 'hi'+ nick + '<br>欢迎注册海蓝之星留言板，请点击如下链接或复制链接到浏览器打开以激活您的账号！<a href="'+ activeUrl+'">'+ activeUrl +'</a>'
				}, function(err, info){
					console.log(err);
					console.log(info);
					if(!err && info){
						res.render('reg/invite', {
							title : '注册邀请页',
							message : '我们已经给您的邮箱' + email + '发送了激活信,他的有效期为30分钟,'
						});
					}
				});
			}
		});
	}
});
router.get('/reg/active/:active', function(req, res){
	if(req.session.is_login){
		return res.redirect('/home');
	}else{
		var activeData = util.paramsUrl(base64.decode(decodeURIComponent(req.params.active)));
		for(var i in activeData){
			activeData[i] = decodeURIComponent(activeData[i]);
		}
		var message,
			endTime = new Date().getTime(),
			password = util.randomPwd();

		var render = function(param){
			if(param === 'A00001'){
				message = '激活的url不合法或已经过期或者超时~~~';
			}else if(param === 'A00006'){
				message = activeData['accounts'] + "该账户已经被激活,您的密码是" + password + '您可以登录之后修改成自己喜欢的密码。'; 
			}else if(param === 'A00002'){
				message = '链接已经失效！请重新注册！！！';
			}else if(param === 'A00003'){
				message = '该账户已经被激活,请直接登录......';
			}
			res.render('reg/invite', {
				title : '注册激活页',
				message : message
			});
		};
		if(!activeData['accounts'] || !activeData['timestamps'] || !activeData['nick']){
			render('A00001');
		}else if(parseInt((activeData['timestamps'] - endTime),10) > 30*60*1000){
			render('A00002');
		}else{
			var newUser = new User({
				mail : activeData['accounts'],
				name : activeData['nick'],
				password : password
			});
			User.get(activeData['accounts'], function(err,user){
				if(user){
					err = 'accounts already exists';
					render('A00003');
				}else{
					newUser.save(function(err, user){
						if(err){
							req.flash('error',err);
							return res.redirect('/reg');
						}
						req.session.user = user;
						render('A00006');
						mail.sendMail({
							to : user.mail,
							subject: '您在海蓝之星留言板注册成功!',
							text: 'hi'+ nick + '您的账号'+ activeData['accounts']+'已经激活，您的密码是' + password +',热泪欢迎你.... 谢谢您对留言板的支持。'
						});
					});
				}
			});
		}
	}
});

// router.post('/reg', function(req, res){
// 	if(req.body['password'] != req.body['password_repeat']){
// 		req.flash('error','两次输入的密码不一致');
// 		return res.redirect('/reg');
// 	}
// 	//生成口令的散列值
// 	var md5 = crypto.createHash('md5');
// 	var password = md5.update(req.body.password).digest('base64');
// 	var newUser = new User({
// 		mail : req.body.mail,
// 		name : req.body.username,
// 		password : password
// 	});
// 	//检查用户名是否已经存在
// 	User.get(newUser.name, function(err,user){
// 		if(user){
// 			err = 'username already exists';
// 		}
// 		if(err){
// 			req.flash('error',err);
// 			return res.redirect('/reg');
// 		}
// 		newUser.save(function(err, user){
// 			if(err){
// 				req.flash('error',err);
// 				return res.redirect('/reg');
// 			}
// 			req.session.user = user;
// 			req.flash('success','注册成功');
// 			res.redirect('/u/' + user.name);
// 		});
// 	});
// });



/* GET login page. */
router.get('/login',function(req, res){
	res.render('login', { title: 'Express' });
});
router.post('/login',function(req, res){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var username = req.body.username;
	var remember = req.body.remember;
	User.get(username, function(err,user){
		if(err || !user){
			req.flash('error','用户名不存在等');
			return res.redirect('/login');
		}else{
			if(user.password === password){
				var maxAge = 0.5 * 60 * 60 * 1000;
				if(remember){
					maxAge = 7 * 24 * 60 * 60 * 1000;
					res.cookie('remember', 1, {
						maxAge: maxAge
					});
				}
				res.cookie('accounts',username, {
					maxAge : maxAge
				});
				res.cookie('pwd', password, {
					maxAge : maxAge
				});
				req.session.is_login = true;
				req.session.user = user;
				return res.redirect('/u/' + user.name);
			}
			if(user.password != password){
				req.flash('error','用户密码错误');
				return res.redirect('/login');
			}
		}
	});
});

/* GET user center page. */
router.get('/u/:user',checkNotLogin);
router.get('/u/:user', function(req, res) {
	User.get(req.params.user,function(err, user){
		if(err){
			req.flash('error','数据读取失败');
			return res.redirect('/error');
		}
		if(!user){
			req.flash('error','用户不存在');
			//此处应该跳到登录页 或者注册页 反正不要是个人中心页面
			return res.redirect('/error');
		}
		//如果用户存在 应该到数据库中查找发表的留言 返回给页面响应。
		Post.get(req.params.user, function(err, user){
			if(err){
				req.flash('error','获取数据留言内容失败');
				return res.redirect('/error');
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
				res.render('user', { title: 'Express',posts: user.posts, name : user.name});
			}else{
				res.render('user', { title: 'Express', posts : '', name : req.params.user});
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

//用户登出
router.get('/logout',checkNotLogin);
router.get('/logout', function(req, res){
	req.session.is_login = false;
	req.session.user = null;
	//此处应该清除cookie信息
	req.flash('success','用户已经退出登录');
	res.redirect('/login');
});

module.exports = router;
