var 	$gulp = require('gulp'),
		$sass  = require('gulp-sass');



var sass_settings = {
	watch: './source/**/*.scss',
	src: [ // compile all files but skip partial.
		'./source/**/*.scss', 
		'!./source/**/_*.scss'
	], 
	dest: './static/',
};	

var copy_settings = {
	src: [
		'./source/**/*.html',
		'./source/**/*.css',
		'./source/**/*.map',
		'./source/**/*.js',
	],
	// base: './source/',
	dest: './static/',
};



// Copying static files
$gulp.task('copyfiles', function(){
	return $gulp
		.src(copy_settings.src/*, {
			base: copy_settings.base
		}*/)
		.pipe($gulp.dest(copy_settings.dest));
});

$gulp.task('sass', function(){
    $gulp
    	.src(sass_settings.src)
        .pipe($sass({
        	compress: true,
        }))
		.on('error', function(e){
			console.log('Handle error in `sass` task:\n\t' + e.message);
		})
        .pipe($gulp.dest(sass_settings.dest));
});

$gulp.task('watch', function() {
	$gulp
		.watch(sass_settings.watch, {interval: 500}, ['sass'])
		.on('change', function(e){
			console.log('File %s was %s, running tasks...', e.path, e.type);
		});

	$gulp
		.watch([
			'./source/**/*.html',
			'./source/**/*.css',
			'./source/**/*.map',
			'./source/**/*.js',
		], {interval: 500}, ['copyfiles']);
});




$gulp.task('default', ['sass', 'watch', 'copyfiles']);
console.log('Watchers are initialized');