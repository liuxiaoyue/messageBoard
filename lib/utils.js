/**
 * 工具集
 */
//对象的合并
exports.mix= function(target, source, covered) {
	var key;
	for(key in source){
		if(!covered || !(key in target)){
			target[key] = source[key];
		}
	}
	return target;
};
//解析url
exports.paramsUrl = function(url){
	var obj = {};
	var arr = url.split('&');
	arr.forEach(function(item){
		var ret = item.split('=');
		obj[ret[0]] = ret[1];
	});
	return obj;
};
//产生随机密码
exports.randomPwd = function(){
	var list = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
	var pwd = [];
	for(var i=0; i<8; i++){
		pwd.push(list[Math.floor((Math.random() * list.length))-1]);
	}
	return pwd.join('');
};

