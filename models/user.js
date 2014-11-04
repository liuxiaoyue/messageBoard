var mongodb = require('./db');

function User(user){
	this.name = user.name;
	this.password = user.password;
}

User.prototype.save = function(callback){
	//存入mongodb的文档
	var user = {
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
			collection.insert(user,{safe:true},function(err,user){
				mongodb.close();
				callback(err, user);
			});
		});
	});
};

User.get = function(username,callback){
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
					var user = new User(doc);
					callback(err, User);
				}else{
					callback(err, null);
				}
			});
		});
	});
};

module.exports = User;

