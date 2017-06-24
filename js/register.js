$(function(){
	//注册验证
	var patten_phone = /^1[34578]\d{9}$/;
	var patten_email = /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/;
	var baseColor = "#f03468";
	var regStyle = -1;//注册方式标记0---代表手机号注册；1--代表邮箱注册；
	//判断用户输入手机号或者邮箱是否正确，
	//若正确，判断是手机号还是邮箱号，对下面布局做出相应的改变
	$(".userId input").blur(function(){
		var userId = $(this).val();
		if(patten_phone.test(userId)){
			regStyle = 0;
			$(".userId .error_info").css({display:"none"});
			$(".userId").css({"border-color":"green"});
			$(".confirm_pwd").css({display:"none"});
			$(".reg_more").css("display","block");
			$(".check_code").find("input[type='text']").attr({placeholder:"短信验证码"});
			$(".check_code").find("input[type='button']").val("获取短信验证码");
			return;
		}
		if(patten_email.test(userId)){
			regStyle = 1;
			$(".userId .error_info").css({display:"none"});
			$(".userId").css({"border-color":"green"});
			$(".confirm_pwd").css({display:"block"});
			$(".reg_more").css("display","block");
			$(".check_code").find("input[type='text']").attr({placeholder:"邮箱验证码"});
			$(".check_code").find("input[type='button']").val("获取邮箱验证码");
			return;
		}
		//如果输入既不是手机号也不是正确的邮箱，则给出错误提示
		$(".userId").css({"border-color":baseColor});
		$(".userId .error_info").css({display:"block"})
		.find("em").html('请输入正确的手机号或邮箱');
	})

	//注册按钮点击
	$(".regBtn").click(function(){
		//对所有input系统模拟失焦事件
		$(".main input").each(function(){
			$(this).trigger('blur');
		})
		var flag = false;
		$(".main p").each(function(){
			//如果是手机号注册且当前p是确认密码输入框的p，则跳过本次判断，继续下一次循环
			//因为手机号注册没有确认密码这一项,不要用className 亲测，没用
			if(regStyle === 0 && $(this).attr("class") === 'confirm_pwd'){
				return true;//相当于js里的continue
			}
			console.log($(this).find(".error_info").css("display"));
			if($(this).find(".error_info").css("display") === 'block'){
				flag = true;
				return false;//相当于js里的break；
			}
		})
		if(flag){//如果为真，表明还有某一项注册信息填写错误，返回继续填写
			return 0;
		}
		//表明填写信息正确，保存用户数据，跳转页面
		var userInfo = {"username":$(".userId input").val(),"pwd":$(".pwd input").val()};
		$.cookie("user"+$(".userId input").val(),JSON.stringify(userInfo),{expires:30,path:'/'});
		location.href = "../index.html";
	})
	//密码框失焦事件
	$(".pwd input").blur(function(){
		if($(this).val().length < 6){
			$('.pwd').css({"border-color":baseColor});
			$(".pwd .error_info").css({display:"block"})
				.find("em").html("密码最少为6个字符");
		}else{
			if(/^(\d+|[a-zA-Z]+)$/.test($(this).val())){
				$('.pwd').css({"border-color":baseColor});
				$(".pwd .error_info").css({display:"block"})
				.find("em").html("不能输入纯数字或纯字母");
			}else{
				$('.pwd').css({"border-color":"green"});
				$(".pwd .error_info").css({display:"none"});
			}
		}

		
	});
	//密码框按键判断密码强度
	$(".pwd input").keyup(function(){
		var level = pwdLevel($(this).val());
		switch(level){ 
			case 0 : 
				$(".strong_level").fadeIn().find("em").eq(0).css({background:"orange"})
				.siblings('em').css({background:"#ccc"}); 
				break; 
			case 1 : 
				$(".strong_level em").eq(1).css({background:"red"})
				.next('em').css({background:"#ccc"});
				break;
			case 2 : $(".strong_level em").eq(2).css({background:baseColor});
				break;
			
			default : $(".strong_level em").css({background:"#ccc"});
				break;
		}
	})
	//密码再次输入验证
	$(".confirm_pwd input").blur(function(){
		if($(".pwd input").val() !== $(this).val()){
			$(".confirm_pwd").css({"border-color":baseColor});
			$(".confirm_pwd .error_info").css({display:"block"})
				.find("em").html("两次密码输入不一致");
		}else{
			$(".confirm_pwd").css({"border-color":"green"});
			$(".confirm_pwd .error_info").css({display:"none"});
		}
	})
	//图片验证码输入框失焦事件
	$(".imgcode input").blur(function(){
		if($(this).val().length === 0){
			$(".imgcode p").css({"border-color":baseColor});
			$(".imgcode .error_info").css({display:"block"})
				.find("em").html("验证码不能为空");
		}else{
			$(".imgcode p").css({"border-color":"green"});
			$(".imgcode .error_info").css({display:"none"});
		}
	})
	//短信或邮箱验证码
	$(".check_code input").eq(0).blur(function(){
		if($(this).val().length === 0){
			$(".check_code").css({"border-color":baseColor});
			$(".check_code .error_info").css({display:"block"})
				.find("em").html("验证码不能为空");
		}else{
			$(".check_code").css({"border-color":"green"});
			$(".check_code .error_info").css({display:"none"});
		}
	})
	var imgcodeIndex = 1;
	//点击图片切换验证码
	$(".imgcode img").click(function(){
		imgcodeIndex ++;
		if(imgcodeIndex > 3){
			imgcodeIndex = 1;
		}
		$(this)[0].src = "../imgs/log_reg/checkCode"+imgcodeIndex+".jpg"; 
	})
	//换一个
	$(".imgcode a").click(function(){
		$(".imgcode img").trigger('click');
	})
	if(regStyle === 0){//手机输入方式

	}
	//判断密码等级 -1 无等级 0--低级  1--中级  2--高级
	function pwdLevel(pwd){
		var level = 0;
		if(pwd.length < 6){
			return -1;
		}else if(pwd.length < 10){
			level = 0;//1-4
		}else{
			level = 2;//3-6
		}
		if(/\d/.test(pwd)){
			level ++;
		}
		if(/[a-z]/.test(pwd)){
			level ++;
		}
		if(/[A-Z]/.test(pwd)){
			level ++;
		}
		if(/\W/.test(pwd)){
			level ++;
		}
		if(level <=2){
			return 0;
		}else if(level <= 4){
			return 1;
		}else{
			return 2;
		}
	}
})