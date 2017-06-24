var gulp = require("gulp");
var connect = require("gulp-connect");
var sass = require("gulp-sass-china");
//开启服务指令
gulp.task("server",function(){
	connect.server({
		root:"dist",
		port:8888,
		livereload:true
		})
	})
//复制html数据指令
gulp.task("html",function(){
	gulp.src("index.html").pipe(gulp.dest("dist")).pipe(connect.reload());
	return gulp.src("html/*.html").pipe(gulp.dest("dist/html")).pipe(connect.reload());
	})
//复制数据指令
gulp.task("data",function(){
	gulp.src("data/**/*").pipe(gulp.dest('dist/data'));
	gulp.src("imgs/**/*").pipe(gulp.dest('dist/imgs'));
	gulp.src("iconfont/**/*").pipe(gulp.dest('dist/iconfont'));
	return gulp.src("js/*.js").pipe(gulp.dest('dist/js')).pipe(connect.reload());
	})
//sass指令
gulp.task("sass",function(){
	return gulp.src("sass/*.scss")
	.pipe(sass().on('error',sass.logError))
	.pipe(gulp.dest('css'))
	.pipe(gulp.dest('dist/css')).pipe(connect.reload());
	})
//开启监听
gulp.task("watch",function(){
	gulp.watch(["index.html","html/*.html"],['html']);
	gulp.watch(["data/**/*","imgs/**/*","js/*.js"],['data']);
	gulp.watch("sass/*.scss",['sass']);
	})
//默认开启监听和服务
gulp.task("default",['watch','server']);