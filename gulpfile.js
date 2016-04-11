var gulp = require('gulp');
var flatten = require('gulp-flatten');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var express = require('express');
var browserSync = require('browser-sync');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var minimist = require('minimist');
var cleanCSS = require('gulp-clean-css');
var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var autoprefixer = require('autoprefixer');
var postcss = require('gulp-postcss');

var server;
var options = minimist(process.argv);
var environment = options.environment || 'development';



gulp.task('html', function(){
	return gulp
	.src('*.{html,ico,png}')
	.pipe(gulp.dest('dist'))
	.pipe(reload());
});

gulp.task('assets', function(){
	return gulp
	.src('assets/**/*')
	.pipe(gulp.dest('dist/assets'))
	.pipe(reload());
});

gulp.task('images', function(){
	return gulp
	.src('img/**/*.{jpg,png}')
	.pipe(imagemin())
	.pipe(gulp.dest('dist/img'))
	.pipe(reload());
});

gulp.task('sass', function(){
	return gulp
	.src('scss/styles.scss')
	.pipe(environment === 'development' ? sourcemaps.init() : gutil.noop())
	.pipe(sass()).on('error', handleError)
	.pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
	.pipe(environment === 'production' ? cleanCSS() : gutil.noop())
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('dist/css'))
	.pipe(reload());
});


gulp.task('scripts', function(){
	return browserify('./scripts/main.js', { debug: environment === 'development' })
	.bundle().on('error', handleError)
	.pipe(source('bundle.js'))
	.pipe(environment === 'production' ? buffer() : gutil.noop())
	.pipe(environment === 'production' ? uglify() : gutil.noop())
	.pipe(gulp.dest('dist/scripts'))
	.pipe(reload());
});

gulp.task('server', function(){
	server = express();
	server.use(express.static('dist'));
	server.listen(8000);
	browserSync({ proxy: 'localhost:8000', browser: "google chrome" });
});

gulp.task('watch', function(){
	gulp.watch('*.html', ['html']);
	gulp.watch('assets/**/*', ['assets']);
	gulp.watch('img/**/*[jpg,png]', ['images']);
	gulp.watch('scss/styles.scss', ['sass']);
	gulp.watch('scripts/main.js', ['scripts']);
});

gulp.task('build', ['html', 'assets', 'images', 'sass', 'scripts']);

gulp.task('default', ['build', 'watch', 'server']);

function handleError(err) {
	console.log(err.toString());
	this.emit('end');
};

function reload() {
	if (server) {
		return browserSync.reload({ stream: true});
	}
	return gutil.noop();
}
