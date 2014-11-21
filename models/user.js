/**
 * @fileoverview 新注册用户存储在数据库中
 */

var mongodb = require('./db');

function User(){
	this.db = mongodb;
	this.db.open(function(){});
}

User.prototype.save = function(callback, mail, name, password){
	this.db.collection('users',function(err,collection){
		if(err){
			return callback(err);
		}
		//写入user文档
		collection.insert(user,function(err,user){
			callback(err, user[0]);
		});
	});
};

User.prototype.add = function(conf, post, callback){
	//读取users集合
	this.db.collection('users',function(err,collection){
		if(err){
			return callback(err);
		}
		collection.findOne(conf, function(err,user){
			if(!err && user){
				//更新文档数据
				collection.update(conf,{'$push': {"posts" : post}}, function(err){
					callback(err, user);
				});
			}else{
				callback(err);
			}
		});
	});
};

User.prototype.remove = function(conf, post, callback){
	this.db.collection('users',function(err,collection){
		if(err){
			return callback(err);
		}
		collection.findOne(conf, function(err,user){
			if(!err && user){
				collection.update(conf, {'$pull': {"posts" : post}}, function(err){
					callback(err, user);
				});
			}else{
				callback(err);
			}
		});
	});
};
User.prototype.setPwd = function(conf, oldpwd, newpwd, callback){
	this.db.collection('users',function(err,collection){
		if(err){
			return callback(err);
		}
		collection.findOne(conf, function(err,user){
			if(!err && user){
				if(user.password === oldpwd){
					//更新文档数据
					collection.update(conf,{'$set': {"password" : newpwd}}, function(err){
						callback(err, user);
					});
				}
			}else{
				callback(err);
			}
		});
	});
};
User.prototype.get = function(conf,callback){
	this.db.collection('users',function(err, collection){
		if (err) {
			return callback(err);
		}
		collection.findOne(conf,function(err,doc){
			if(doc){
				callback(err, doc);
			}else{
				callback(err, null);
			}
		});
	});
};
module.exports = new User();

