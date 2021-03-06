/**
 * @fileoverview 首页文件
 *
 * @create 2014－11-04
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	function postMessage(){
		var el = $(this);
		var val = $('textarea').val();
		var date = new Date().getTime();
		var name = $CONFIG.username;
		$.ajax({
			url: '/post',
			type: 'post',
			data: {
				content : val,
				time : date,
				name : name
			},
			success: function(re){
				if(re && re.code === "A00006"){
					var data = re.data;
					$('#list').append('<li><span>'+ $CONFIG.username +'</span><br/><span>'+ data.time +'</span><a class="del">删除</a><p><span>'+ data.content+'</span></p></li>');
				}else{
					alert(ret.message || '系统繁忙,请稍后再试！');
				}
			}
		});
	}

	function delMessage(){
		var el = $(this);
		var li = el.parent();
		var val = li.find('span.content').html();
		var date = li.find('span.time').html();
		var name = $CONFIG.username;
		$.ajax({
			url: '/delPost',
			type: 'post',
			data: {
				content : val,
				time : date,
				name : name
			},
			success: function(re){
				if(re && re.code === "A00006"){
					li.remove();
				}else{
					alert(ret.message || '系统繁忙,请稍后再试！');
				}
				
			}
		});
	}

	function findPwd(){
		var el = $(this);
		var mail = el.prev().prev().val();
		$.ajax({
			url: '/set/forgetpwd',
			type: 'post',
			data: {
				mail : mail
			},
			success: function(){
				el.prev().prev().parent().html('<br/><br/>邮件发送成功，请查收<br/><br/>');
			}
		});
	}
	$('#forgetPwdBtn').on('click',findPwd);
	$('#post').on('click', postMessage);
	$('#list').delegate('a', 'click', delMessage);
});
