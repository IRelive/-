$(function(){
	//获取购物车数据，先判断用户是否登录，登录则采用用户购物车数据，否则采用普通购物车
	 var cartKey = "cartGoods";//保存购物车cookie的键
	 var cartExpires = 1;//保存购物车数据的有效期	
	//加载top_bar
	$(".top_bar").load("http://localhost/aomygod/html/public.html .top_bar_con",function(){
		userLogin();
		top_bar();		
	});
	//加载header头部
	 $(".header").load("http://localhost/aomygod/html/public.html .header_con");
	 //加载导航部分
	 $('.nav').load("http://localhost/aomygod/html/public.html .nav_con",function(){
	 	handlerIndexJson();
	 });
	 //加载脚部公共部分
	 $('.footer').load("http://localhost/aomygod/html/public.html .footer_con");
	 //加载右侧侧边栏
	 $('.sidebar').load("http://localhost/aomygod/html/public.html .right_sidebar",function(){
	 	sidebar();
	 });
	 toBigGlass();
	 $.getJSON("../data/detail.json")
	 .then(function(res){
	 	//加载商品所有参数
	 	loadGoodsParas(res.goodsInfo);
	 	
	 },function(){
		console.log("detail.json数据加载失败");
	 });
	 $.getJSON("../data/goodslist.json")
	 .then(function(res){
		addCart(res.goodsList);
	 },function(){
	 	console.log("goodslist.json数据加载失败");
	 })
	 //右侧参数交互
	 do_showParas();
	 //商品参数底部芝麻开门效果
	 do_goodsPara_bottom();

	 //点击加入购物车
function addCart(res){
	changeCart(res);
	var goodsId = location.search.substring(1);
	//商品列表加入购物车按钮点击,因为按钮是动态添加的，所以采用事件委托
	 $('.showParas .btnAdd_buy a').eq(1).click(function(){
	 	var that = this;
	 	var goodsArr = [];
	 	if($.cookie(cartKey)){
	 		goodsArr = JSON.parse($.cookie(cartKey));
	 	} 		
	 	var flag = true;
	 	//遍历cookie数组，判断该商品是否已经存在，若存在，则里面数量属性加1，
	 	$.each(goodsArr,function(i,val){
	 		if(val.id == goodsId){
	 			goodsArr[i].num ++;
	 			flag = false;
	 			return false;
	 		}
	 	})
	 	//true表示原来购物车里没有改商品，则将商品对象放入数组中
	 	if(flag){
	 		var info = {"id":goodsId,"num":1};
	 		goodsArr.push(info);
	 	}
	 	$.cookie(cartKey,JSON.stringify(goodsArr),{expires:cartExpires,path:'/'});
	 	changeCart(res);
	 });
	  //右侧边栏购物车删除按钮,动态创建采用事件委托处理
	 $('.shoppingCarBox .cartList').on('click','.icon-delete_fill',function(){
	 	//删除购物车cookie数据
	 	console.log($(this).parents('li').index());
	 	//splice()返回值是删除的元素组成的数组；
	 	var goodsArr = JSON.parse($.cookie(cartKey));
	 	var index = $(this).parents('li').index();//删除的元素对应下标
	 	//计算删除该项物品后的总额
	 	var num = goodsArr[index].num;
	 	var price = parseInt($(this).siblings('span').html().substring(1));
	 	var sumpay = parseInt($('.carBoxBottom em').html()) - num * price;
	 	goodsArr.splice(index,1);
	 	$.cookie(cartKey,JSON.stringify(goodsArr),{expires:cartExpires,path:'/'});
	 	$(this).parents('li').remove();
	 	//更新购物车数量显示
	 	$('.right_sidebar .carGoodsCount').html(goodsArr.length);
	 	$('.top_bar_right .cartNum b').html(goodsArr.length);
	 	$('.carBoxBottom b').html(goodsArr.length);
	 	//显示总额
	 	$('.carBoxBottom em').html(sumpay+".00");
	 	if(goodsArr.length == 0){
	 		$('.shoppingCarBox .empty').show();
	 		$('.carBoxBottom a').addClass('active');
	 	}
	 })
}
//点击加入购物车后更改购物车信息
function changeCart(res){	
	var goodsString = $.cookie(cartKey);
	if(!goodsString || JSON.parse(goodsString).length == 0){//如果没有数据直接返回
		$('.shoppingCarBox .empty').show();
		$('.carBoxBottom a').addClass('active');
		return null;
	}
	$('.carBoxBottom a').removeClass();
	$('.shoppingCarBox .cartList').html("");
	$('.shoppingCarBox .empty').hide();
	var goodsArr = JSON.parse(goodsString);
	//更新购物车数量显示
	$('.right_sidebar .carGoodsCount').html(goodsArr.length);
	$('.top_bar_right .cartNum b').html(goodsArr.length);
	$('.carBoxBottom b').html(goodsArr.length);
	var sumpay = 0;
	$.each(goodsArr,function(i,val){
		$.each(res,function(index,value){
			if(val.id == value.id){
				$('.shoppingCarBox .cartList').append('<li>'+
				'<a href="javascript:;" title=""><img src="'+value.productImg+'" alt=""></a>'+
				'<div class="infos">'+
					'<p class="intro">'+value.intro+'</p>'+
					'<p class="priceNum"><span>￥'+value.curPrice+'</span><em>'+val.num+'</em>'+
					'<i class="iconfont icon-delete_fill"></i></p></div>'+
			'</li>');
				sumpay += val.num * value.curPrice;
				return false;
			}
		})
		
	})
	//显示总额
	sumpay = sumpay+".00";
	$('.carBoxBottom em').html(sumpay);

}
//加载商品所有参数
function loadGoodsParas(res){
	var goodId = window.location.search.substring(1);
	var product = null;
	$.each(res,function(i,val){
		if(val.id == goodId){//如果找到对应id的商品信息，获取对应的数据对象，结束循环
			product = val;
			return false;
		}
	})
	//加载商品图片列表
	$.each(product.imgArr,function(i,val){
		$('.showPics .goodsImgs').append('<li><img src="'+val+'" alt=""></li>');
	})
	//加载右边参数
	$('.showParas .title p').html('<span>'+product.title+'</span><em>'+product.subTitle+'</em>');
	$('.showParas .country').html('<dt><img src="'+product.countryImg+'" alt=""></dt>'+
							'<dd>'+
								'<span>'+product.country[0]+'</span>'+
								'<span>'+product.country[1]+'</span>'+
							'</dd>');
	$('.showParas .intro').html(product.intro);
	$('.showParas .price').html('<p class="curPrice"><span>奥买家价</span><em>￥<i>'+product.curPrice+'</i></em></p>'+
						'<p class="oriPrice"><span>国内参考价</span><em>￥<i>'+product.oriPrice+'</i></em></p>');
	$.each(product.color,function(i,val){
		$('.showParas .color').append('<a href="javascript:;" title="">'+val+'</a>');
	})
	$.each(product.size,function(i,val){
		$('.showParas .size').append('<a href="javascript:;" title="">'+val+'</a>');
	})
	$('.showParas .color a').eq(1).addClass('active');
	$('.showParas .size a').eq(0).addClass('active');
	//右边参数加载结束
	$('.showPics .mark>img').attr({src:product.imgArr[0]});
	$('.showPics .goodsImgs li').eq(0).addClass('active');
	$('.showPics .goodsImgs').on('click','li',function(){
		$(this).addClass('active').siblings().removeClass();
		$('.showPics .mark>img').attr({src:$(this).find("img").attr('src')});
	})
}
//参数底部芝麻开门效果
function do_goodsPara_bottom(){
	$('.goodsPara .bottom li').hover(function(){
		$(this).find('.left').animate({left:-123,opacity:0}).next('.right').animate({right:-123,opacity:0});
	},function(){
		$(this).find('.left').animate({left:0,opacity:1}).next('.right').animate({right:0,opacity:1});
	});
	//商品详情和商品评价切换
	$('.goodsDetails .topbar .left span').click(function(){
		$(this).addClass('active').siblings().removeClass();
		if($(this).index() == 0){
			$(document).scrollTop($('.goodsDetails .introImgs').offset().top + 50);
		}else{
			$(document).scrollTop($('.goodsDetails .reviews').offset().top + 50);
		}
		
	})
}
//右边参数区域交互
function do_showParas(){
	//购买颜色尺寸的选择,将a的点击事件委托给父元素
	$('.showParas').find('.color, .size').on('click','a',function(){
		$(this).addClass('active').siblings().removeClass();
	})
	//购买数量的修改
	$('.showParas .count i').click(function(){
		var val = parseInt($(this).siblings('input').val());
		if($(this).index() == 0){
			val --;	
			if(val < 1){
				val = 1;
			}		
		}else{
			val ++;
		}
		$(this).siblings('input').val(val);
	})
}
//处理获取的数据
function handlerIndexJson(){
	$.getJSON("../data/index.json")
	.then(function(res){
		//加载商品分类
		loadGoodsClassify(res.goodsClassify);		
		//页面加载完后开始实现楼层效果
		scrollDisplay();
	},function(){
		console.log("index.json数据加载失败");
	});
}

//动态创建商品分类
function loadGoodsClassify(res){
	var index = 0;//对应json数据下标
	$.each(res,function(key,value){
		$.each(value,function(subkey,subVal){
			//加载二级导航分类
			var $subNav = $('<a href="javascript:;">'+subkey+'</a>');				
			var $detailLi = $('<li><h3>'+subkey+'</h3></li>');
			var $detailp = $('<p></p>');
			$detailLi.append($detailp);
			$('.primaryNav>li').eq(index).find('.subNav').append($subNav).append('/');
			$('.primaryNav>li').eq(index).find(".detailNav").append($detailLi);
			$.each(subVal,function(i,val){
				$detailp.append('<a href="javascript:;">'+val+'</a>');
			})
		})
		index ++;
	})
	goodsTab();
}

//商品分类tab切换
	function goodsTab(){
		$(".primaryNav").hide();
		$('.nav_left').hover(function() {
			$('.primaryNav').stop().slideDown("fast");
		}, function() {
			$('.primaryNav').stop().slideUp("fast");
		});
		$(".primaryNav>li").hover(function(){
			$(this).addClass('active').siblings().removeClass();
		},function(){
			$(this).removeClass();
		})
	}

//滚动事件
function scrollDisplay(){
	//滚动事件
	var outTimer = null;
	$(document).scroll(function(){		
		clearInterval(outTimer);
		outTimer = setTimeout(function(){
			//返回顶部按钮显示判断
			//console.log($(document).scrollTop());
			if($(this).scrollTop() > 1000){
				$('.sidebar_bottom>li').eq(2).fadeIn();
			}else{
				$('.sidebar_bottom>li').eq(2).fadeOut();
			}
			//判断商品详情头部黑条是否需要固定顶部窗口
			if($(window).scrollTop() >= $('.goodsDetails .topbox').offset().top){
				$('.goodsDetails .topbar').addClass('fixed');
			}else{
				$('.goodsDetails .topbar').removeClass('fixed');
			}
		});
	});
}

//判断用户是否登录状态
	function userLogin(){
		var userId = $.cookie("loginUser");		
		if(userId){//如果用户已登录
			//购物车键，和有效期
			$.cookie("cartGoods",null,{path:'/'});
	 		cartKey = "cart"+userId;//cookie键为cart加上用户id
	 		cartExpires = 30;//有效期一个月	
			var displayId = userId.substring(0,3)+"***"+userId.slice(-4);
			$('.top_bar_left li').eq(0).html('您好，');
			$('.top_bar_left li').eq(1).html(displayId);
			$('.top_bar_left li').eq(2).find('a').html('退出').attr("href","javascript:;");
			//点击退出,删除登录cookie
			$('.top_bar_left li').eq(2).find('a').click(function(){
				$.cookie("loginUser",null,{path:'/'});
				location.reload(true);//刷新网页
			})
		}
	}
//top_bar 动态效果
function top_bar(){
	//个人中心移入移出效果
	$('.personCenter').hover(function(){
		$(this).css({background:"#fff","border-color":"#e4e4e4"});
		$(this).find('.userCenter').stop().slideDown('fast');
	},function(){
		var that = this;
		$(this).find('.userCenter').stop().slideUp('fast')
		.queue(function(){
			$(that).css({background:"transparent","border-color":"transparent"});
		});
	})
	//手机版移入移出效果
	$('.phoneVer').hover(function(){
		$(this).css({background:"#fff","border-color":"#e4e4e4"});
		$(this).find('div').stop().slideDown('fast');
	},function(){
		var that = this;
		$(this).find('div').stop().slideUp('fast')
		.queue(function(){
			$(that).css({background:"transparent","border-color":"transparent"});
		});
	})
}

//侧边栏动态效果
function sidebar(){
	//点击侧边栏购物车，弹出简易购物车栏,再次点击弹回去
	$('.shopCar').click(function(){
		$('.right_sidebar').toggleClass('displayCar');
	})
	//二维码图标移入移出显示消失二维码
	$('.sidebar_bottom>li').eq(1).hover(function(){
		$(this).find('.surprise, .triangle').stop().fadeIn("fast");
	},function(){
		$(this).find('.surprise, .triangle').stop().fadeOut("fast");
	})
	//返回顶部
	var toTopTimer = null;
	$('.sidebar_bottom>li').eq(2).click(function(){
		clearInterval(toTopTimer);
		toTopTimer = setInterval(function(){
			var speed = - Math.ceil($(document).scrollTop() / 8);
			var cur = $(document).scrollTop();
			$(document).scrollTop(cur + speed);
			if($(document).scrollTop() === 0){
				clearInterval(toTopTimer);
			}
		},30);
	})
}

//放大镜
function toBigGlass() {
	var $mark = $(".showPics .mark");
	var $bigImg = $(".showPics .bigImg img");
	var $bigBox = $(".showPics .bigImg");
	$mark.mouseenter(function() {
		$(this).find(".float").css("display", "block");
		$bigImg.attr("src", $(this).find("img").attr("src"));
		$bigBox.css("display", "block");
	});
	$mark.mouseleave(function() {
		$(this).find(".float").css("display", "none");
		$bigBox.css("display", "none");
	});
	$mark.mousemove(function(evt) {
		var e = evt || event;
		var l = e.clientX - $(this).offset().left - $(this).find(".float").outerWidth() / 2;
		var t = e.pageY - $(this).offset().top - $(this).find(".float").outerHeight() / 2;
		//设置边界
		if(l < 0) {
			l = 0;
		} else if(l > $(this).outerWidth() - $(this).find(".float").outerWidth()) {
			l = $(this).outerWidth() - $(this).find(".float").outerWidth();
		}
		if(t < 0) {
			t = 0;
		} else if(t > $(this).outerHeight() - $(this).find(".float").outerHeight()) {
			t = $(this).outerHeight() - $(this).find(".float").outerHeight();
		}
		$(this).find(".float").css({
			"left": l,
			"top": t
		});
		//计算大图移动
		//比例

		var percentX = l / ($(this).outerWidth() - $(this).find(".float").outerWidth());
		var percentY = t / ($(this).outerHeight() - $(this).find(".float").outerHeight());
		$bigImg.css({
			"position": "absolute",
			"left": percentX * ($bigBox.outerWidth() - $bigImg.outerWidth()),
			"top": percentY * ($bigBox.outerHeight() - $bigImg.outerHeight())
		});
	});
}
})

