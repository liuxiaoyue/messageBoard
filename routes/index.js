var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');
var base64 = require('../lib/base64');
var mail = require('../lib/mail');
var util = require('../lib/utils');

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
		User.get({mail:email}, function(err,user){
			if(!err || !user){
				mail.sendMail({
					to : email,
					subject: nick +',欢迎注册海蓝之星留言板!',
					html: 'hi'+ nick + '<br>欢迎注册海蓝之星留言板，请点击如下链接或复制链接到浏览器打开以激活您的账号！<a href="'+ activeUrl+'">'+ activeUrl +'</a>'
				}, function(err, info){
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
			var md5 = crypto.createHash("md5");
			md5.update(password);
			var pwd = md5.digest("hex");
			var newUser = new User({
				mail : activeData['accounts'],
				name : activeData['nick'],
				password : pwd
			});
			User.get({mail:activeData['accounts']}, function(err,user){
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
							text: 'hi'+ user.name + '您的账号'+ activeData['accounts']+'已经激活，您的密码是' + password +',热泪欢迎你.... 谢谢您对留言板的支持。'
						});
					});
				}
			});
		}
	}
});

/* GET login page. */
router.get('/login',function(req, res){
	if(req.session.user){
		res.redirect('/home');
	}else{
		res.render('login', { title: 'Express' });
	}
});
router.post('/login',function(req, res){
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('hex');
	var mail = req.body.mail;
	var remember = req.body.remember;
	User.get({mail : mail}, function(err,user){
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
				res.cookie('accounts',mail, {
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
router.get('/u/:user', function(req, res) {
	if(req.session.user){
		var conf = {mail : req.session.user.mail};
		User.get(conf,function(err, user){
			if(!err && user){
				if(user && user.posts){
					res.render('user', { title: 'Express',posts: user.posts, name : user.name});
				}else{
					res.render('user', { title: 'Express', posts : '', name : req.params.user});
				}
			}else{
				req.flash('error','用户数据读取失败');
				return res.redirect('/error');
			}
		});
	}else{
		return res.redirect('/login');
	}
});
//发表留言
router.post('/post',function(req, res){
	if(req.session.user){
		var post = {content : req.body.content, time : util.formateTime(req.body.time)};
		User.update({mail : req.session.user.mail}, post, function(err,user){
			if(!err && user){
				res.send({code : 'A00006', data : post});
			}else{
				res.send({code : 'A00002', message : '网络繁忙，请稍后再试！带来不便，请谅解....'});
			}
		});
	}else{
		return res.redirect('/login');
	}
});

//用户登出
router.get('/logout', function(req, res){
	req.session.is_login = false;
	req.session.user = null;
	//此处应该清除cookie信息
	res.redirect('/login');
});

module.exports = router;
