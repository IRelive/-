$(function(){
	//加载top_bar
	$(".top_bar").load("http://localhost/aomygod/html/public.html .top_bar_con",
		function(){
		top_bar();		
	});
	//加载header头部
	 $(".header").load("http://localhost/aomygod/html/public.html .header_con");
	 //加载导航部分
	 $('.nav').load("http://localhost/aomygod/html/public.html .nav_con",function(){
	 	handlerData();
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
		},function(){
			console.log("数据加载失败");
		});
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
		autoTimer = setInterval(timerFn,3000);
		//移入小圆点切换到对应的banner图片
		$('.dots li').mouseover(function(){
			curIndex = $(this).index();
			bannerChange(curIndex);
		})
		//移入移出banner控制自动轮播
		$('.banner').hover(function(){
			clearInterval(autoTimer);
		},function(){
			autoTimer = setInterval(timerFn,3000);
		});
	}
	//banner图片改变时切换效果
	function bannerChange(index){
		$('.banner img').eq(index).fadeIn().parent().siblings().find("img").fadeOut();
		$('.banner .dots li').eq(index).addClass('active').siblings('li').removeClass();
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
		$(".primaryNav>li").hover(function(){
			$(this).addClass('active').siblings().removeClass();
		},function(){
			$(this).removeClass();
		})
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
})