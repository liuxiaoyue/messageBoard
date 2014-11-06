/**
 * @fileoverview 新注册用户存储在数据库中
 */

var mongodb = require('./db');

function Post(user){
	this.content = user.content;
	this.time = user.time;
}

Post.prototype.save = function(name, callback){
	//存入mongodb的文档
	var post = {
		content : this.content,
		time : this.time
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
			collection.findOne({name:name}, function(err,user){
				if(!user.posts){
					user.posts = [];
				}
				user.posts.push(post);

				collection.update({name:name},user,function(err){
					mongodb.close();
					callback(err, post);
				});
			});
		});
	});
};

Post.get = function(username,callback){
	mongodb.open(function(err, db){
		if(err){
			return callback(err);
		}
		db.collection('users',function(err, collection){
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.findOne({name:username},function(err,doc){
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

module.exports = Post;

