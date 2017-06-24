$(function(){
	var baseColor = '#f03468';
	//登录方式的切换
	
	$('.login_top li:not(".slide_line")').click(function(){	
		//1、移动下划线
		var lineWidth = $(this).find("span").outerWidth()+20;
		//设置下滑线宽度略宽于文字宽度
		//如若设置后下划线的宽度大于文字容器宽度，则宽度设置为容器宽度
		lineWidth = lineWidth > $(this).outerWidth() ? $(this).outerWidth() : lineWidth;
		var lineLeft = $(this).outerWidth() * $(this).index() 
		+ ($(this).outerWidth()-lineWidth) / 2;	
		 $(".slide_line").stop().animate({width:lineWidth,left:lineLeft});
		 //2、更改字体颜色
		 $(this).css({color:'#333'}).siblings().css({color:'#999'});
		 $('.loginlist').animate({"margin-left": - $(this).index() * $('.container').width()});
	})
	//账号登录
	$(".loginlist input[name='inpt']").keyup(function(){
		if($(this).val().length !== 0){
			$(this).css({"border-color":"#ddd"}).siblings('.error_info')
			.css({display:"none"});
		}
	})
	$('.userLogin input[type="submit"]').click(function(evt){
		//阻止刷新网页
		var e = evt || window.event;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		var userId = $(".userLogin .userId").find('input').val();
		var userPwd = $(".userLogin .pwd").find('input').val();
		var flag = true;
		if(userId.length === 0){
			$(".userLogin .userId").find("input").css({"border-color":baseColor})
			.end().find(".error_info").css({display:"block"})
			.find("em").html('请输入手机号或邮箱');
			flag = false;
		}
		if(userPwd.length === 0){
			$(".userLogin .pwd").find("input").css({"border-color":baseColor})
			.end().find(".error_info").css({display:"block"})
			.find("em").html('请输入密码');
			flag = false;
		}
		if(flag){
			var userInfo = JSON.parse($.cookie("user"+userId));
			console.log(userInfo);			
			if(userInfo && userInfo.pwd === userPwd){//登录成功
				$.cookie("loginUser",userId,{path:'/'});
				location.href="../index.html";
			}else{
				alert('您输入的账号或者密码不正确');
			}
		}
	});
})