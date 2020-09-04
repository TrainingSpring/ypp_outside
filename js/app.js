/**
 * 演示程序当前的 “注册/登录” 等操作，是基于 “本地存储” 完成的
 * 当您要参考这个演示程序进行相关 app 的开发时，
 * 请注意将相关方法调整成 “基于服务端Service” 的实现。
 **/
(function($, owner) {
	owner.getServiceIp = function(url,options){
		url = url || '';
		options = options || '';
		//return "http://192.168.0.127:8080/ypp-api"+url+"?version=H552E41F2"+options;
		//return "http://192.168.1.251:8081"+url+"?version=H552E41F2"+options;
		return "http://test-api.a345.cn"+url; // 测试
		// return "http://api.a345.cn"+url;   // 线上
		// return "http://192.168.0.120:8082"+url;   // 本地
		
	};

	owner.sessionError = function(){
		plus.webview.currentWebview().close();
		// plus.webview.getWebviewById("main.html").close();
		plus.webview.getWebviewById("main.html").close();
	}

	/**
	 * 获取当前状态 
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};
	
	/**
	 * 删除用户信息
	 */
	owner.removeUser = function(){
		app.removerItem("userInfo");
	}
	/**
	 * 获取用户信息
	 */
	owner.getUser = function(){
		var user =	app.getItem("userInfo");
//		var user = "{}";
		return user;
	}
	/**
	 * 刷新用户信息
	 */
	owner.reUser = function(uid,callback){
		callback = callback || $.noop;
		mui.ajax(app.getServiceIp("/user/getUserInfo.api"),{
			data:{
				'uid':uid
			},
		   	dataType:'json',//服务器返回json格式数据
		   	type:'post',//HTTP请求类型
		   	timeout:10000,//超时时间设置为10秒；
		   	headers:{'Content-Type':'application/json'}, 
		   	success:function(data){
		   		app.setItem("userInfo",data);
		   		return callback("success",data);
		   	},
		   	error:function(xhr,type,errorThrown){
		   		switch(type){
        			case "abort":
        				mui.toast("无法连接服务器,请检查网络");
        			break;
        			case "parsererror":
        				mui.toast("登录超时,请重新登录");
        				console.log("parsererror");
        				plus.webview.currentWebview().close();
        				plus.webview.getWebviewById("main.html").close();
        			break;
        			case "timeout":
        				mui.toast("连接超时");
        			break;
        			case "error":
        				mui.toast("服务器异常");
        			break;
        		}
		   		return callback("error",'{}');
		   	}
	  });
	}
	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};
	
	owner.setItem = function(str,obj){
		localStorage.setItem(str,JSON.stringify(obj));
	}
	owner.getItem = function(str){
		var sta = localStorage.getItem(str)||"{}";
		return JSON.parse(sta);
	}
	owner.removerItem = function(str){
		localStorage.removeItem(str);
	}
	
	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 保存账号和密码
	 */
	owner.setAccount = function(user){
		localStorage.setItem('$user',JSON.stringify(user));
	}
	/**
	 * 获取保存的账号和密码
	 */
	owner.getAccount = function(){
		var users = localStorage.getItem("$user");
		return JSON.parse(users);
	}
	/**
	 * 保存账号和密码
	 */
	owner.removeAccount = function(){
		localStorage.removeItem('$user');
	}
	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
			var settingsText = localStorage.getItem('$settings') || "{}";
			return JSON.parse(settingsText);
		}
		/**
		 * 获取本地是否安装客户端
		 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
}(mui, window.app = {}));
(function (doc, win) {
        var docEl = doc.documentElement,
            resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
            recalc = function () {
                var clientWidth = docEl.clientWidth;
                if (!clientWidth) return;
                if(clientWidth>=750){
                    docEl.style.fontSize = '100px';
                }else{
                    docEl.style.fontSize = 100 * (clientWidth / 750) + 'px';
                }
            };

        if (!doc.addEventListener) return;
        win.addEventListener(resizeEvt, recalc, false);
        doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
function checkNet() {
	console.log("网络监听");
	var nt = plus.networkinfo.getCurrentType();
	switch(nt) {
		case plus.networkinfo.CONNECTION_ETHERNET:
		case plus.networkinfo.CONNECTION_WIFI:
			mui.toast("已连接wifi网络")
			break;
		case plus.networkinfo.CONNECTION_CELL2G:
			mui.toast("已连接2G网络");
			break;
		case plus.networkinfo.CONNECTION_CELL3G:
			mui.toast("已连接3G网络");
			break;
		case plus.networkinfo.CONNECTION_CELL4G:
			mui.toast("已连接4G网络");
			break;
		default:
			mui.toast("未连接任何网络");
			mui.openWindow('missNet.html');
			break;
	}
}

function updateStatus(id,num){
	mui.ajax(app.getServiceIp("/spell/editUseStatus.api"),{
		data:{
			'id':id,
			'useStatus':num
		},
		type:'put',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},
		success:function(data){
			console.log(data.code);
		},
		error:function(xhr,type,errorThrown){
			if(type === "timeout"){
				return mui.toast("网络连接超时");
			}else{
				return console.log("无法连接服务器");
			}
		}
	});
}
function updateStatuss(id,num){
	mui.ajax(app.getServiceIp("/orderAccount/editUseStatus.api"),{
		data:{
			'id':id,
			'useStatus':num
		},
		type:'put',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		headers:{'Content-Type':'application/json'},
		success:function(data){
			console.log(data.code);
		},
		error:function(xhr,type,errorThrown){
			if(type === "timeout"){
				return mui.toast("网络连接超时");
			}else{
				return console.log("无法连接服务器");
			}
		}
	});
}