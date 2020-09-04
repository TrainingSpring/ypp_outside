/**
 * @param {Object} dom
 * @param {Object} className
 * 
 * 
 */

/**
 * @Author: Training
 * @Description:代理服务器地址
 * @Params: url
 **/
function proxyAjax(url){
	return "http://test-proxy-api.a345.cn/"+url; // 测试地址
	// return "http://api-proxy.a345.cn:8088/"+url; // 线上地址
	// return "http://192.168.0.120:8090/"+url; // 本地地址
}
function outsidePage(url=""){
	return "http://page.a345.cn/"+url;
}
/** 增加class */
function addClassName(dom,className){
	let name = dom.className;
	if(name.indexOf(className) == -1){
		dom.className = name + " " + className
	}
}
/** 移除class  */
function removeClassName(dom,className){
	let name = dom.className;
	dom.className = name.replace(className,'');
	console.log("removeClass" + name)
}
/** 格式化钱 */ 
function formatMoney(num){
	let ts = num.toString(); // num to string -> ts
	let ta = (ts.indexOf(".")!==-1)?ts.split('.'):[ts]; // num to array -> ta
	if(ta.length>2){
		return new Error("您输入的数据错误")
	}else{
		if(ta.length === 1){
			return ta[0] + ".00"
		}else{
			if(ta[1].length === 1){
				return ta[0] + "." + ta[1] + "0";
			}else{
				return num;
			}
		}
	}
}
/** 获取拼团码的id 需要提前引入app.js*/
function getPTCode(callback=()=>{}){
	let typeId = {}
	mui.ajax(app.getServiceIp("/spellType/getSpellTypeList.api"),{
		data:{},
		type:'get',//HTTP请求类型
		timeout:10000,//超时时间设置为10秒；
		success:function(data){
			var str = '';
			mui.each(data,function(index,item){
				console.log("查看获取数据: " + JSON.stringify(item))		
				let num = /[0-9.]*/.exec(item.typeName);
				typeId[num] = item.id;
			})
			callback({state:'success',typeId});
		},
		error:function(xhr,type,errorThrown){
			if(type === "timeout"){
				callback({state:'error',msg:"网络连接超时!"});
				return mui.toast("网络连接超时");
			}else{
				callback({state:'error',msg:"无法连接服务器!"});
				return console.log("无法连接服务器");
			}
		}
	});
}
/**
 * @param {Object} uid
 * @desc 获取支付宝授权信息
 */
function getAlipayConfigInfo(uid){
	let data =  {
		app_id: 2018071960720540,
		redirect_uri: "http://api.a345.cn/aliPayCallBack/user_info_auth_callback.api", //正式
		// redirect_uri: "http://test-api.a345.cn/aliPayCallBack/user_info_auth_callback.api",   // 测试
		scope: "auth_user",
		state:uid
	}
	let alipay_url = "alipays://platformapi/startapp?";
	let url = "https://openauth.alipay.com/oauth2/publicAppAuthorize.htm?"
	let url_data = ""
	for(let k in data){
		url_data += k + "=" + data[k]+"&"
	}
	url_data = url_data.slice(0,-1);
	url = "appId=20000067&url="+encodeURIComponent(url+url_data);
	return alipay_url+url;	
}
/**
 * @desc 检查版本更新
 */
function checkVersionUpdate(currentVersion,serverVersion){
	if(!serverVersion)return ;
	// 判断是否有更新版本
	let current = currentVersion.split('.');
	let server = serverVersion.split('.');
	let have_new = false;
	for(let i = 0; i < 3; i++){
		if(parseInt(current[i]) < parseInt(server[i])){
			have_new = true;
			break; 
		}
	}
	return have_new;
}
/**
 * @param {data:String(身份证号码),type:Number(加密类型: 0 身份证, 1 名字)}  
 * @description 加密名字和身份证号码
 * @return {String}
 */
function secretId(data,type = 0){
	let id = data+"";
	let format = "";
		for(let i = 0,len = id.length;i<len;i++){
			if(type === 0){
				if(i > 4 && i<len-4){
					format+="*"
				}else{
					format+=id[i];
				}
			}else{
				if(i<len-1) format+="*";
				else format+=id[i];
			}
		}
	return format;
}
/**
 * @description 检测输入框内容正确与否
 * @param {type,data}  
 * 		type: 
 * 			number: 输入数据是否为数字(或者小数)
 * 			phone : 输入数据与电话号码匹配
 * 			email : 输入数据是否为邮箱
 * 			id	  : 输入数据  身份证
 * 			bank  : 输入数据是否为银行卡号
 * 		data: 数据
 * */
function checkInput(type,data){
	let reg = false;
	switch(type){
		case "number":
			reg = /^[0-9.]+$/
		break;
		case "phone":
			reg = /^1[1,3,5,6,7,8,9][0-9]{9}$/
		break;
		case "email":
			reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/
		break;
		case "id":
			reg = /^(\d{6})(\d{4})(\d{2})(\d{2})(\d{3})([0-9]|[X,x]){1}$/
		break;
		case "bank":
			reg = /^([1-9]{1})(\d{16}|\d{15}|\d{18})$/
		break;
	}
	
	return reg && reg.test(data);
}
/**	
 * 获取用户实名信息
 */
function getUserIdentification(uid){
	return new Promise((resolve,reject)=>{
		mui.ajax(proxyAjax("/yppUser/getAuthMsg"),{
			data:{
				uid
			},
			timeout:10000,
			success:function(res){
				console.log(JSON.stringify(res)+"  uid:"+uid)
				if(res.code === 1){
					let alipay_money = res.result.isBind; // 支付宝获取红包状态
					let alipay_auth = res.result.isAuth; // 支付宝授权状态
					let id_number = res.result.idCard; // 身份证号码
					let id_name = res.result.realName; // 身份证名字
					let finish = id_name&&id_name?1:0; // 实名状态
					let data = {
							getMoney : alipay_money,
							alipayAuth: alipay_auth,
							idCardNumber: id_number,
							idCardName: id_name,	
						}
					resolve(data);
				}else{
					mui.alert("[错误]服务器错误,请联系管理员解决!", function(res){
						mui.back();
					});
					reject("[错误]服务器错误,请联系管理员解决!");
				}
			}
		})
	})
			
}