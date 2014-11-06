/**
 * @fileoverview 首页文件
 *
 * @create 2014－11-04
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	function loginOut(){
		$.ajax({
			url: '/logout',
			type: 'get',
			data: {
			},
			success: function(data) {
			}
		});
	}

	function postMessage(){
		var el = $(this);
		var val = $('textarea').val();
		var date = new Date().getTime();
		var name = $('#name').html();
		$.ajax({
			url: '/post',
			type: 'post',
			data: {
				content : val,
				time : date,
				name : name
			},
			success: function(data) {
				$('#list').append('<li><span>'+ $CONFIG.username +'</span><br/><span>'+ new Date(parseInt(data.time)) +'</span><p><span>'+ data.content+'</span></p></li>');
			}
		});
	}

	$('#loginOut').on('click', loginOut);
	$('#post').on('click', postMessage);
});
