var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

router.get('/reg', function(req, res) {
  res.render('reg', { title: 'sign up messageBoard' });
});

router.post('/reg', function(req, res){
	//检验用户两次输入的口令是否一致
	console.log(req.body['password']);
	console.log(req.body['password_repeat']);

	if(req.body['password'] != req.body['password_repeat']){
		console.log('xiaoyue1:');
		req.flash('error','两次输入的密码不一致');
		return res.redirect('/reg');
	}
	//生成口令的散列值
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	var newUser = new User({
		name : req.body.username,
		password : req.body.password
	});
	console.log('xiaoyue1:' + newUser.name);
	//检查用户名是否已经存在
	User.get(newUser.name, function(err,user){
		console.log(user);
		if(user){
			err = 'username already exists';
		}
		if(err){
			console.log('xiaoyue1:' + err);
			req.flash('error',err);
			return res.redirect('/reg');
		}
		newUser.save(function(err){
			if(err){
				console.log('xiaoyue2:' + err);
				req.flash('error',err);
				return res.redirect('/reg');
			}
			req.session.user = newUser;
			req.flash('success','注册成功');
			res.redirect('/');
		});
	});
});
module.exports = router;
