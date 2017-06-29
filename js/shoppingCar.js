$(function(){
	//获取购物车数据，先判断用户是否登录，登录则采用用户购物车数据，否则采用普通购物车
	 var cartKey = "cartGoods";//保存购物车cookie的键
	 var cartExpires = 1;//保存购物车数据的有效期	
	//加载top_bar
	$(".top_bar").load("http://localhost/aomygod/html/public.html .top_bar_con",function(){
		userLogin();
		top_bar();		
	});
	 //加载脚部公共部分
	 $('.footer').load("http://localhost/aomygod/html/public.html .footer_con");
	
	 $.getJSON("../data/goodslist.json")
	 .then(function(res){
	 	loadCart(res.goodsList);
	 	do_cart();
	 },function(){
		console.log("detail.json数据加载失败");
	 });
	 
	 //$('')
	 function do_cart(){
	//购买数量的修改
	$('.content .goodslist').on('click','.count span',function(){
		var cartArr = JSON.parse($.cookie(cartKey));
		var val = parseInt($(this).siblings('input').val());
		if($(this).index() == 0){
			val --;	
			if(val < 1){
				val = 1;
			}		
		}else{
			val ++;
		}		
		var index = $(this).parents('.goodsInfo').parent().index();
		cartArr[index].num = val;
		//更新cookie数据
		$.cookie(cartKey,JSON.stringify(cartArr),{expires:cartExpires,path:'/'});
		$(this).siblings('input').val(val);
		var price = parseInt($(this).parent().parent().prev().find('p').eq(0).html().substring(1));
		$(this).parent().parent().next().find('p').eq(0).html("￥"+val * price+".00");
		//点击改变数量时选中该商品
		var $checkbox = $(this).parents('.goodsInfo').find('.selected');
		//不要使用attr（）修改状态属性，没效果,
		$checkbox.prop({"checked":true}).trigger('change');//prop()修改状态值时不会触发change事件
		// if(!$checkbox.get(0).checked){//如果未选中状态则，模拟点击事件，改为选中状态。
		// 	$checkbox.trigger('click');
		// }else{//是选中状态，则无需模拟改变状态，只需调用change事件就可以。改变总额
		// 	$checkbox.trigger('change');
		// }
		
	})
	//每个商品的删除
	$('.content .goodslist').on('click','.del',function(){
		var cartArr = JSON.parse($.cookie(cartKey));
		var $parentLi = $(this).parents('.goodsInfo').parent();
		cartArr.splice($parentLi.index(),1);
		$.cookie(cartKey,JSON.stringify(cartArr),{expires:cartExpires,path:'/'});
		$parentLi.remove();
		if(cartArr.length == 0){
			$('.emptyCart').show();
			$('.carGoods').hide();
		}
		changeOfCbox();
	})
	//全选复选框
	$('.carGoods .allSelect').change(function(){
		console.log(this.checked);
		if(this.checked){
			$('.carGoods .allSelect').prop("checked",true);
			$('.content .goodslist input[type="checkbox"]').prop("checked",true).trigger('change');
		}else{
			$('.carGoods .allSelect').prop("checked",false);
			$('.content .goodslist input[type="checkbox"]').prop("checked",false).trigger('change');
		}
	})
	//购物车checkbox状态改变事件
	$('.content .goodslist').on('change','input',function(){
		if(this.checked){
			$(this).parents('.goodsInfo').parent().css({background:"#fef6f3"});
		}else{
			$(this).parents('.goodsInfo').parent().css({background:"#fff"});
		}
		changeOfCbox();
	})

}
//根据checkbox状态改变相应的数据
function changeOfCbox(){
	var cartSum = 0;
	$('.content .goodslist input[type="checkbox"]').each(function(i,val){		
		if(this.checked){
			cartSum += parseInt($(this).parent().siblings().eq(3).find('p').eq(0).html().substring(1));
		}
	})
	if(cartSum == 0){
		$('.settle_account .right a').css({"pointer-events":"none",opacity:.5});
	}else{
		$('.settle_account .right a').css({"pointer-events":"auto",opacity:1});
	}
	$('.content .total span').eq(1).find('em').html("￥"+cartSum+".00");
	$('.settle_account .right em').html("￥"+cartSum+".00");
}
//获取cookie保存的购物车数据
function loadCart(res){
	var cartString = $.cookie(cartKey);
	if(!cartString || JSON.parse(cartString).length == 0){
		$('.emptyCart').show();
		$('.carGoods').hide();
		return null;
	}
	var cartArr = JSON.parse(cartString);
	$('.top_bar_right .cartNum b').html(cartArr.length);
	var cartSum = 0;
	$.each(cartArr,function(i,val){
		$.each(res,function(index,value){
			if(value.id == val.id){
				$('.content .goodslist').append(`<li>
					<ul class="goodsInfo tabblebox">
						<li><input type="checkbox" class="selected" name="" checked></li>
						<li>
							<a href="javascript:;" title=""><img src="${value.productImg}" alt=""></a>						
							<a href="javascript:;" title="">${value.intro}</a>
						</li>
						<li>
							<p>￥${value.curPrice}</p>
							<p>￥${value.oriPrice}</p>
						</li>
						<li>
							<div class="count">
								<span>-</span>
								<input type="text" name="" value="${val.num}">
								<span>+</span>
							</div>						
						</li>
						<li>
							<p>￥${val.num * parseInt(value.curPrice)}</p>
							<p>(0.75kg)</p>
						</li>
						<li>
							<a href="javascript:;" title="" >收藏</a>
							<a href="javascript:;" title="" class="del">删除</a>
						</li>
					</ul>
				</li>`);
				cartSum += val.num * parseInt(value.curPrice);
				return false;
			}
		})
	})
	$('.content .total span').eq(1).find('em').html("￥"+cartSum+".00");
	$('.settle_account .right em').html("￥"+cartSum+".00");
}
//判断用户是否登录状态
	function userLogin(){
		var userId = $.cookie("loginUser");		
		if(userId){//如果用户已登录，清空无用户购物车cookie
			//登录提示bar消失
			//购物车键，和有效期
			$.cookie("cartGoods",null,{path:'/'});
	 		cartKey = "cart"+userId;//cookie键为cart加上用户id
	 		cartExpires = 30;//有效期一个月	 
			var displayId = userId.substring(0,3)+"***"+userId.slice(-4);
			$('.hintLogin').hide();
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
})
//

