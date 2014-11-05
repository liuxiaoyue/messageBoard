/**
 * @fileoverview 首页文件
 *
 * @create 2014－11-04
 * @author xiaoyue3
 */
define('conf/main', function(require, exports, module) {
	var $ = require('$');
	$('#loginOut').on('click', loginOut);

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
});
