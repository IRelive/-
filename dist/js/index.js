
$(function(){
	//获取购物车数据，先判断用户是否登录，登录则采用用户购物车数据，否则采用普通购物车
	 var cartKey = "cartGoods";//保存购物车cookie的键
	 var cartExpires = 1;//保存购物车数据的有效期	 	
	//加载top_bar
	$(".top_bar").load("http://localhost/aomygod/html/public.html .top_bar_con",
		function(){
		userLogin();
		top_bar();		
	});
	//加载header头部
	 $(".header").load("http://localhost/aomygod/html/public.html .header_con");
	 //加载导航部分
	 $('.nav').load("http://localhost/aomygod/html/public.html .nav_con",function(){
	 	handlerData();
	 });
	 //加载脚部公共部分
	 $('.footer').load("http://localhost/aomygod/html/public.html .footer_con");
	 //加载右侧侧边栏
	 $('.sidebar').load("http://localhost/aomygod/html/public.html .right_sidebar",function(){
	 	sidebar();
	 	
	 });

	//关闭顶部广告
	$('.close_ad').click(function(){
		$(".top_ad").remove();
	})	
	//处理获取的数据
	function handlerData(){
		$.getJSON("data/index.json")
		.then(function(res){
			//加载商品分类
			loadGoodsClassify(res.goodsClassify);
			//动态创建轮播图
			loadBanner(res.bannerSrc);
			//动态加载hot必买爆品
			loadHotBuy(res.hotBuyProduct);
			//加载全球商品商标
			loadGlobalBrands(res.globalBrands);
			//加载奶粉尿布
			loadMilkNap(".milkNappies",res.milkNappies);
			loadMilkNap(".beautyCos",res.beautyCos);
			loadMilkNap(".constume",res.constume);
			loadMilkNap(".shoes",res.shoes);
			loadMilkNap(".package",res.package);
			loadMilkNap(".jewelry",res.jewelry);
			loadMilkNap(".food",res.food);
			loadMilkNap(".household",res.household);
			loadMilkNap(".parallerCar",res.parallerCar);
			//页面加载完后开始实现楼层效果
			stairsShow();
		},function(){
			console.log("数据加载失败");
		});
		//js文件路径相对于对应的html文件路径
		$.getJSON("data/goodslist.json")
		.then(function(res){
			addCart(res.goodsList);
	 		changeCart(res.goodsList);
		}, function(){
			console.log("goodslist.json数据加载失败");
		})
	}
	//根据滚动高度判断是否显示返回顶部按钮
	
	//滚动事件效果
	function stairsShow(){
		var scrollArr = [];
		$(".goodsBox").each(function(i,val){
			var topAngle = {
				minHeight:$(val).offset().top - 200,
				maxHeight:$(val).offset().top +$(val).outerHeight() - 200
			}
			scrollArr.push(topAngle);
		})
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
				//左侧楼层效果显示判断
				if($(this).scrollTop() > 2300){
					$('.stairs').fadeIn();
				}else{
					$('.stairs').fadeOut();
				}
				//遍历div高度范围，判断当前所在哪一个div上
				$.each(scrollArr,function(i,val){
					if($(document).scrollTop() >= val.minHeight && $(document).scrollTop() < val.maxHeight){
						$('.stairs li').eq(i).addClass('active').siblings().removeClass();
					}
				})
			},100);		
		});
		//左侧楼层效果点击后跳转到相应的楼层
		$('.stairs li').click(function(){
			$(this).addClass('active').siblings().removeClass();
			var top = $('.goodsBox').eq($(this).index()).offset().top;
			$('body').animate({scrollTop:top});
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
	//广告轮播图
	function loadBanner(res){
		var $dots = $('<ul class="dots"></ul>');
		$('.banner').append($dots);
		$.each(res,function(i,val){
			$('.banner').append('<a href="javascript:;" title=""><img src="'+val+'" alt=""></a>');
			$dots.append('<li></li>');
		})
		var curIndex = 0;
		var autoTimer = null;
		//定时器绑定函数
		bannerChange(curIndex);
		var timerFn = function(){
			curIndex ++;
			if(curIndex >= res.length){
				curIndex = 0;
			}
			bannerChange(curIndex);
		}
		autoTimer = setInterval(timerFn,5000);
		//移入小圆点切换到对应的banner图片
		$('.dots li').mouseover(function(){
			curIndex = $(this).index();
			bannerChange(curIndex);
		})
		//移入移出banner控制自动轮播
		$('.banner').hover(function(){
			clearInterval(autoTimer);
		},function(){
			autoTimer = setInterval(timerFn,5000);
		});
	}
	//banner图片改变时切换效果
	function bannerChange(index){
		$('.banner img').eq(index).fadeIn().parent().siblings().find("img").fadeOut();
		$('.banner .dots li').eq(index).addClass('active').siblings('li').removeClass();
	}
	//加载奶粉尿布
	function loadMilkNap(ele,res){
		//标题栏导航
		$.each(res.titleNav,function(i,val){
			$(ele).find(".titleBrands").append('<a href="javascript:;">'+val+'</a>').append('/');
		})
		$(ele).find(".titleBrands").append('<a href="javascript:;" title="">更多好货 MORE</a>');
		//内容左侧
		$(ele).find('.content_left dt img').attr("src",res.leftImg);
		$.each(res.leftCategory,function(i,val){
			$(ele).find("dd").append('<a href="javascript:;" title="">'+val+'</a>');
		})
		//内容中间
		$.each(res.centerProducts,function(i,val){
			var $li = $(ele).find('.content_center>li').eq(i);
			$li.find('.dis_pic span').append(val.country).find('img').attr("src",val.countryImg);
			$li.find(".dis_pic a img").attr("src",val.goodsImg);
			$li.find('.detail a').html(val.detail);
			$li.find('.price i>b').html(val.curPrice);
			$li.find('.price em>b').html(val.oriPrice);
		})
		//内容右侧
		$(ele).find('.content_right img').attr("src",res.rightImg);
	}
	//加载全球品牌商标
	function loadGlobalBrands(res){
		$.each(res,function(i,val){
			$.each(val,function(subI,subVal){
				$('.country_brands ul').eq(i)
				.append('<li><a href="javascript:;"><img src="'+subVal+'" alt=""></a></li>');
			})
		})
		$('.countrys li').mouseover(function(){
			$(this).addClass('active').siblings().removeClass();
			$('.country_brands ul').eq($(this).index()).show().siblings().hide();
		})
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
	//动态加载hot必买爆品
	function loadHotBuy(res){
		$.each(res.products,function(i,val){
			$('.hot_products').append(`<dl>
						<dt><img src="${val.productImg}" alt=""></dt>
						<dd>
							<h2><img src="${val.countryImg}" alt="">${val.country}</h2>
							<h3><a href="javascript:;" title="">${val.title}</a></h3>
							<p class="detail">${val.detail}</p>
							<p class="sale"><span>已售<b>${val.sale}</b>件</span><i></i></p>
							<p class="bottom"><i>￥<b>${val.curPrice}</b></i><em>￥<b>${val.oriPrice}</b></em><a href="javascript:;" title="">马上抢</a></p>
						</dd>
					</dl>`);
		})
		$('.hot_products').append('<a class="hot_ad"><img src="'+res.hot_ad+'" /></a>');
	}
	//商品分类tab切换
	function goodsTab(){
		$(".primaryNav>li").hover(function(){
			$(this).addClass('active').siblings().removeClass();
		},function(){
			$(this).removeClass();
		})
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
//点击加入购物车
function addCart(res){
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
})
