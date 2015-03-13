/**
 * send mail class
 */

var nodemailer = require('nodemailer');
var utils = require('./utils');
//TODO FIX
// var transporter = nodemailer.createTransport("SMTP", {
// 	host: "smtp.qq.com", // 主机
// 	secureConnection: true, // 使用 SSL
// 	port: 465, // SMTP 端口
// 	auth: {
// 		user: "xinji082@qq.com", // 账号
// 		pass: "weixiao19900919" // 密码
// 	}
// });

var nodemailer  = require("nodemailer");
var user = '1027116481',
	pass = 'weixiao123qwe';

var smtpTransport = nodemailer.createTransport({
	service: "QQ",
    auth: {
        user: user,
        pass: pass
    }
});

exports.sendMail = function(options, callback) {
	var _conf = {
		from : 'xinji082@qq.com'
	};
	utils.mix(_conf, options);
	smtpTransport.sendMail(_conf, function(err, info){
		console.log(err);
		if(err){
			callback(err);
		}else{
			callback(null, info);
		}
	});
};

