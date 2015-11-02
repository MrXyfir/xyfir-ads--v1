var streamify = require('gulp-streamify');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var argv = require('yargs').argv;
var gzip = require('gulp-gzip');
var gulp = require('gulp');

/*
	build
	- js / css / react
*/
gulp.task('build', require('gulp-shell').task([
	'gulp js --prod 1',
	'gulp css --prod 1',
    'gulp react --file Home --prod 1',
    'gulp react --file Panel --prod 1',
	'gulp react --file Publishers --prod 1',
	'gulp react --file Advertisers --prod 1'
]));

/*
	css
	- imports css files
	- builds precss to css
	- minifies / gzip
*/
gulp.task('css', function() {
	return gulp.src('./styles/style.css')
		.pipe(require('gulp-postcss')([
			require('precss')({}),
			require('autoprefixer')({browsers: 'last 1 version, > 10%'}),
			require('cssnano')
		]))
		.pipe(argv.prod ? gzip() : gutil.noop())
		.pipe(gulp.dest('./public/css'));
});

/*
	js
	- minifies / gzip
*/
gulp.task('js', function() {
	return gulp.src('./client/main.js')
		.pipe(streamify(uglify({
			mangle: false,
			compress: {
				unused: false
			}
		}).on('error', gutil.log)))
		.pipe(argv.prod ? gzip() : gutil.noop())
		.pipe(gulp.dest('./public/js'));
});

/*
	react
	- bundles React componenents
	- converts JSX -> pure React
	- minifies / gzip
*/
gulp.task('react', function() {
	// Add JSX transformer to Browserify
    var b = require('browserify')(
        './react/' + argv.file + '.jsx', { extensions: '.jsx' }
    );
	b.transform(require('reactify'));
	
	// Bundle React components and minify JS
	return b.bundle()
		.pipe(source(argv.file + '.js'))
		.pipe(streamify(uglify({
			mangle: false,
			compress: {
				unused: false
			}
		}).on('error', gutil.log)))
		.pipe(argv.prod ? gzip() : gutil.noop())
		.pipe(gulp.dest('./public/js/'));
});