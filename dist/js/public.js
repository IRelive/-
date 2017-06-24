$(function(){
	console.log($('.personCenter').html());
	$('.personCenter').hover(function(){
		$(this).find('.userCenter').stop().slideDown();
	},function(){
		$(this).find('.userCenter').stop().slideUp();
	})
})