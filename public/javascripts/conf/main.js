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
		var name = $('#name').html();
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
					$('#list').append('<li><span>'+ $CONFIG.username +'</span><br/><span>'+ data.time +'</span><p><span>'+ data.content+'</span></p></li>');
				}else{
					alert(ret.message || '系统繁忙,请稍后再试！');
				}
			}
		});
	}
	$('#post').on('click', postMessage);
});
