var gulp = require('gulp');
var browserify = require('gulp-browserify');
var shell = require('gulp-shell');
var zip = require('gulp-zip');

var manifest = require('./manifest.json');

gulp.task('build', function(){
	gulp.src(['src/events.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
	gulp.src(['src/page/script.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
	gulp.src(['src/options/options.js']).pipe(browserify()).pipe(gulp.dest('./build/'));
});

gulp.task('default', function() {
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

gulp.task('jquery', shell.task([
	'git clone --depth=1 --branch' +
		' $(git ls-remote --tags git@github.com:jquery/jquery.git |' +
			' cut -f 2 | cut -d/ -f 3 | grep -E \'^(\\d|\\.)+$\' |' +
			' sort -t. -k 1,1n -k 2,2n -k 3,3n -k 4,4n | tail -n 1)' +
		' git@github.com:jquery/jquery.git',
	'cd jquery && npm install',
	'./jquery/node_modules/.bin/grunt --gruntfile jquery/Gruntfile.js' +
		' custom:-ajax,-deprecated,-effects,-deferred,-wrap,-event/alias,-core/ready',
	'grep -v sourceMappingURL jquery/dist/jquery.min.js > 3rd/jquery.min.js',
	'rm -rf jquery'
]));

gulp.task('supergenpass', shell.task([
	'git clone --depth=1 --branch' +
		' v$(git ls-remote --tags git@github.com:chriszarate/supergenpass-lib.git |' +
			' cut -f 2 | cut -d/ -f 3 | grep -o -E \'(\\d|\\.)+$\' |' +
			' sort -t. -k 1,1n -k 2,2n -k 3,3n -k 4,4n | tail -n 1)' +
		' git@github.com:chriszarate/supergenpass-lib.git',
	'cd supergenpass-lib && npm install',
	'cd supergenpass-lib && ./node_modules/.bin/gulp browserify',
	'mv ./supergenpass-lib/dist/supergenpass-lib.browser.js 3rd/supergenpass-lib.min.js',
	'rm -rf supergenpass-lib'
]));
