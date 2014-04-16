/* jshint node: true */
var gulp = require('gulp');
var shell = require('gulp-shell');
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

gulp.task('jquery', shell.task([
	'git clone --depth=1 git@github.com:jquery/jquery.git',
	'cd jquery && npm install',
	'./jquery/node_modules/.bin/grunt --gruntfile jquery/Gruntfile.js' +
		' custom:-ajax,-deprecated,-effects,-deferred,-wrap,-event/alias,-core/ready',
	'grep -v sourceMappingURL jquery/dist/jquery.min.js > jquery.min.js',
	'rm -rf jquery'
]));
