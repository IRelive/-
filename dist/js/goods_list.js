$(function(){
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
	 $.getJSON("../data/goodslist.json")
	 .then(function(res){
	 	//加载左侧边栏商品分类
	 	loadSideGoodsCategory(res.goodsCategory);
	 	//加载热卖商品排行
		loadHotRank(res.hotRankProducts);
		//加载商品筛选属性
		loadSelectStyle(res.selectStyle);
		//分页加载商品列表
		dopages(res.goodsList);
		//点击加入购物车
		addCart(res.goodsList);
		
		
	 },function(){
		console.log("goodslist.json数据加载失败");
	 });
	 
	//点击加入购物车
function addCart(res){
	changeCart(res);
	//商品列表加入购物车按钮点击,因为按钮是动态添加的，所以采用事件委托
	 $('.goodsList').on('click','.addCarBtn',function(){
	 	var that = this;
	 	var goodsArr = [];
	 	if($.cookie(cartKey)){
	 		goodsArr = JSON.parse($.cookie(cartKey));
	 	} 		
	 	var flag = true;
	 	//遍历cookie数组，判断该商品是否已经存在，若存在，则里面数量属性加1，
	 	$.each(goodsArr,function(i,val){
	 		if(val.id == $(that).attr("id")){
	 			goodsArr[i].num ++;
	 			flag = false;
	 			return false;
	 		}
	 	})
	 	//true表示原来购物车里没有改商品，则将商品对象放入数组中
	 	if(flag){
	 		var info = {"id":$(this).attr("id"),"num":1};
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
	//console.log(cartKey);
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
//分页插件使用
function dopages(res){
	$(".pagination").pagination(res.length,{
					items_per_page:24,
					num_display_entries:5,
					num_edge_entries:1,
					prev_text:"上一页",
					next_text:"下一页",
					callback:function(index){
						readringpage(res,index,24);
					}
	})
	function readringpage(res,index,showNumber){
		$('.goodsList').html("");
			for(var i = index * showNumber; i < (index + 1)*showNumber; i++){
				$('.goodsList').append(`<li>
					<dl>
						<dt><a href="detail.html?${res[i].id}" title=""><img src="${res[i].productImg}" alt=""></a></dt>
						<dd>
							<p class="detail"><a href="detail.html?${res[i].id}" title="">${res[i].intro}</a></p>
							<p class="price"><i>￥<b>${res[i].curPrice}</b></i><em>￥<b>${res[i].oriPrice}</b></em></p>
							<p class="reviews">
								<i class="iconfont icon-favoritesfilling"></i>
								<i class="iconfont icon-favoritesfilling"></i>
								<i class="iconfont icon-favoritesfilling"></i>
								<i class="iconfont icon-favoritesfilling"></i>
								<i class="iconfont icon-favoritesfilling"></i>
								<span>已有 <b>${res[i].reviewsCount}</b> 人评价</span>
							</p>
							<div class="bottom">
								<a href="javascript:;" title="" class="addCarBtn" id="${res[i].id}">加入购物车</a>
								<a href="javascript:;" title="">奥买家国际精品馆</a>
							</div>
						</dd>
					</dl>				
					
				</li>`)
			}
				
			}
	 // var page5 = $(".pages").paging({
  //               total: 100,
  //               animation: false,
  //               centerBgColor: "#fff",
  //               centerFontColor: "#000",
  //               centerBorder: "1px solid #ddd",
  //               transition: "all .2s",
  //               centerHoverBgColor: "#25dd3d",
  //               centerHoverBorder: "1px solid #25dd3d",
  //               centerFontHoverColor: "#fff",
  //               otherFontHoverColor: "#fff",
  //               otherBorder: "1px solid #ddd",
  //               otherHoverBorder: "1px solid #25dd3d",
  //               otherBgColor: "#fff",
  //               otherHoverBgColor: "#25dd3d",
  //               currentFontColor: "#fff",
  //               currentBgColor: "#f79898",
  //               currentBorder: "1px solid #f79898",
  //               fontSize: 13,
  //               currentFontSize: 13,
  //               cormer: 2,
  //               gapWidth: 3,
  //               showJump: true,
  //               jumpBgColor: "#fff",
  //               jumpFontHoverColor: "#fff",
  //               jumpHoverBgColor: "#25dd3d",
  //               jumpBorder: "1px solid #ddd",
  //               jumpHoverBorder: "1px solid #25dd3d",
  //               simpleType: 1
  //           });
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
// //加载商品列表
// function loadGoodsList(res){
// 	$.each(res,function(i,val){
// 		$('.goodsList').append(`<li>
// 					<dl>
// 						<dt><a href="detail.html?${val.id}" title=""><img src="${val.productImg}" alt=""></a></dt>
// 						<dd>
// 							<p class="detail"><a href="detail.html?${val.id}" title="">${val.intro}</a></p>
// 							<p class="price"><i>￥<b>${val.curPrice}</b></i><em>￥<b>${val.oriPrice}</b></em></p>
// 							<p class="reviews">
// 								<i class="iconfont icon-favoritesfilling"></i>
// 								<i class="iconfont icon-favoritesfilling"></i>
// 								<i class="iconfont icon-favoritesfilling"></i>
// 								<i class="iconfont icon-favoritesfilling"></i>
// 								<i class="iconfont icon-favoritesfilling"></i>
// 								<span>已有 <b>${val.reviewsCount}</b> 人评价</span>
// 							</p>
// 							<div class="bottom">
// 								<a href="javascript:;" title="" class="addCarBtn" id="${val.id}">加入购物车</a>
// 								<a href="javascript:;" title="">奥买家国际精品馆</a>
// 							</div>
// 						</dd>
// 					</dl>				
					
// 				</li>`)
// 	})
// }
////加载商品筛选属性
function loadSelectStyle(res){
	$.each(res,function(i,val){
		$('.selectGoodsStyle .selectItem').eq(i).find("h3").html(val.title);
		$.each(val.content,function(subi,subval){
			$('.selectGoodsStyle .selectItem').eq(i).find('.brands')
			.append('<li>'+subval+'</li>');
		})
		//多于5个，表示有两行以上，显示更多按钮，否则不显示
		if(val.content.length > 5){
			$('.selectGoodsStyle .selectItem').eq(i).find('p').show();
		}else{
			$('.selectGoodsStyle .selectItem').eq(i).find('p').hide();
		}
	})
	do_selectStyle();
}
//商品筛选动态效果
function do_selectStyle(){
	$('.selectGoodsStyle .selectItem').each(function(){
		//更多点击
		var that = this;
		$(this).find('p>a').click(function(){
			$(that).toggleClass('showAll');
			var maxHeight = $(that).css("max-height");
			if(maxHeight === '50px'){
				$(this).html('收起<i class="iconfont icon-packup"></i>');
			}else{
				$(this).html('更多<i class="iconfont icon-unfold"></i>');
			}
		})
		//多选点击
		$(this).find('p>span').click(function(){
			$(that).addClass('multi');
		})
		//取消点击
		$(this).find('.multiBtn span').eq(1).click(function(){
			$(that).removeClass('multi');
		})

	})
//样式点击添加
	$('.selectGoodsStyle .selectItem ul li').click(function(){
		var style = $(this).parent().prev().html();
		var $li = $('<li><span>'+style+'</span>'+$(this).html()+'<i class="iconfont icon-close"></i></li>');
		$('.selectGoodsStyle .selected').show().find('.selectedStyles').append($li);
		$(this).parent().parent().hide();
		//已经选择样式点击消失
		$li.click(function(){
			//如果没有已选参数则整个布局消失		
			if($(this).siblings('li').length === 0){
				$(this).parent().parent().hide();
			}
			//如果所删除的参数里含有父元素的标题，则显示对应的父元素
			$('.selectGoodsStyle .selectItem').each(function(){
				console.log($(this).find('h3').html()+","+$li.find('span').html())
				if($(this).find('h3').html() === $li.find('span').html()){
					$(this).show();
					return false;
				}
			})
			//移除自己
			$(this).remove();
		})

	})

}
//加载左侧边栏商品分类
function loadSideGoodsCategory(res){
	$.each(res,function(i,val){
		var $li = $('<li><p><i class="iconfont icon-subtract"></i><a href="#" title="">'+val.title+'</a></p></li>');
		var $ul = $('<ul class="subMenu"></ul>');		
		$.each(val.content,function(i,val){
			$ul.append('<li><a href="javascript:;" title="">'+val+'</a></li>');
		})
		$li.append($ul);
		$('.primaryMenu').append($li);
		if(i > 1){
			$li.hide();
			$('.goodsCategory .more').show();
		}
	})
	do_goodsCategory();
}
//加载左侧热卖商品排行
function loadHotRank(res){
	$.each(res,function(i,val){
		$('.hotRank .hotList').append(`<li>
						<a href="javascript:;" title=""><img src="${val.productImg}" alt=""></a>
						<a href="javascript:;"><span>${val.detail}</span></a>
						<i class="price">￥${val.price}</i>
						<em>已有<b>${val.reviewsCount}</b>人评价</em>
					</li>`)
	})
}
//左侧边栏商品分类动态效果
function do_goodsCategory(){
	//获取更多分类按钮点击后显示出所有的商品分类，此按钮消失
	$('.goodsCategory .more').click(function(){
		$(this).hide();
		$('.primaryMenu>li').each(function(i,val){
			if(i > 1){
				$(this).stop().slideDown("fast");
			}
		})
	})
	//每个商品分类的一级菜单点击显示和隐藏二级菜单
	$('.primaryMenu>li>p').click(function(){
		$(this).next('.subMenu').slideToggle("fast");
		$(this).find('.iconfont').toggleClass('icon-subtract').toggleClass('icon-add');
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
			//判断商品显示设置条是否固定浏览器窗口
			if($(this).scrollTop() > $('.displaySet').offset().top){
				$('.displaySet ul').addClass('fixed');
			}else{
				$('.displaySet ul').removeClass('fixed');
			}
		});
	});
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
	
})
