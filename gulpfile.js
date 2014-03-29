var gulp = require('gulp');
var zip = require('gulp-zip');

gulp.task('default', function() {
	gulp.src([
		'_locales',
		'img',
		'src',
		'jquery.min.js',
		'LICENSE',
		'manifest.json',
		'README.md',
		'supergenpass.js'
	])
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('.'));
});
