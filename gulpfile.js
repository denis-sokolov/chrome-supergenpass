/* jshint node: true */
var gulp = require('gulp');
var clean = require('gulp-clean');
var shell = require('gulp-shell');
var zip = require('gulp-zip');

gulp.task('clean', function(){
	gulp.src('dist.zip', {read: false})
		.pipe(clean());
});

gulp.task('default', function() {
	gulp.src([
		'_locales',
		'3rd',
		'img',
		'src',
		'LICENSE',
		'manifest.json',
		'README.md',
	])
		.pipe(zip('dist.zip'))
		.pipe(gulp.dest('.'));
});

gulp.task('jquery', shell.task([
	'git clone --depth=1 git@github.com:jquery/jquery.git',
	'cd jquery && npm install',
	'./jquery/node_modules/.bin/grunt --gruntfile jquery/Gruntfile.js' +
		' custom:-ajax,-deprecated,-effects,-deferred,-wrap,-event/alias,-core/ready',
	'grep -v sourceMappingURL jquery/dist/jquery.min.js > 3rd/jquery.min.js',
	'rm -rf jquery'
]));

gulp.task('supergenpass', shell.task([
	'git clone --depth=1 git@github.com:chriszarate/supergenpass-lib.git',
	'cd supergenpass-lib && npm install',
	'cd supergenpass-lib && ./node_modules/.bin/gulp browserify',
	'mv ./supergenpass-lib/dist/supergenpass.browser.js 3rd/supergenpass.min.js',
	'rm -rf supergenpass-lib'
]));
