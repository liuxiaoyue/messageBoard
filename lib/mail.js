/**
 * send mail class
 */

var nodemailer = require('nodemailer');
var utils = require('./utils');
var transporter = nodemailer.createTransport("SMTP", {
	host: "smtp.qq.com", // 主机
	secureConnection: true, // 使用 SSL
	port: 465, // SMTP 端口
	auth: {
		user: "xinji082@qq.com", // 账号
		pass: "weixiao19900919" // 密码
	}
});

exports.sendMail = function(options, callback) {
	var _conf = {
		from : 'xinji082@qq.com'
	};
	utils.mix(_conf, options);
	transporter.sendMail(_conf, function(err, info){
		if(err){
			callback(err);
		}else{
			callback(null, info);
		}
	});
};

