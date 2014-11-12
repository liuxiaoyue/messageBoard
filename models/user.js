/**
 * @fileoverview 新注册用户存储在数据库中
 */

var mongodb = require('./db');

function User(user){
	this.mail = user.mail;
	this.name = user.name;
	this.password = user.password;
}

User.prototype.save = function(callback){
	//存入mongodb的文档
	var user = {
		mail : this.mail,
		name : this.name,
		password : this.password
	};

	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		//读取users集合
		db.collection('users',function(err,collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//写入user文档
			collection.insert(user,function(err,user){
				mongodb.close();
				callback(err, user[0]);
			});
		});
	});
};

User.get = function(mail,callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('users',function(err, collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({mail:mail},function(err,doc){
				mongodb.close();
				if(doc){
					callback(err, doc);
				}else{
					callback(err, null);
				}
			});
		});
	});
};

module.exports = User;

