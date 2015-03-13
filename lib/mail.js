/**
 * send mail class
 */

var utils = require('./utils');
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

