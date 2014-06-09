var gulp = require('gulp');
var browserify = require('gulp-browserify');
var zip = require('gulp-zip');

var manifest = require('./manifest.json');

gulp.task('build', function(){
	gulp.src(['src/background/background.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
	gulp.src(['src/page/script.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
	gulp.src(['src/options/options.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
});

gulp.task('default', ['build', 'watch']);

gulp.task('pack', function() {
	var destination = process.env.BUILD_DESTINATION ||
		(process.env.HOME ? process.env.HOME + '/Desktop/' : './');

	gulp.src([
		'_locales/**/*',
		'3rd/**/*',
		'build/*',
		'img/**/*',
		'src/**/*',
		'LICENSE',
		'manifest.json',
		'README.md',
	], { base: __dirname })
		.pipe(zip('chrome-supergenpass.'+manifest.version+'.zip'))
		.pipe(gulp.dest(destination));
});

gulp.task('watch', function(){
	gulp.watch([
		'src/**/*.js'
	], ['build']);
});
