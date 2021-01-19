const { default: gulp } = await import('gulp');
let browserSync = await import('browser-sync');
const { default: nodemon } = await import('gulp-nodemon');
const { default: sass } = await import('gulp-sass');
import user_config from './config.js';
var allJsSource = ['src/**/*.js'];
var tradeJsSource = [
	'src/**/*.js',
];
console.log("gulp port>>",user_config.port);
browserSync = browserSync.create();
gulp.task('watch', function() {
	return gulp.watch(allJsSource,gulp.series('babel'));
});
gulp.task('sass', function () {
  return gulp.src('./src/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./src'));
});
gulp.task('sass:watch', function() {
	gulp.watch('./src/**/*.scss', gulp.series('sass'));
});
gulp.task('browser-sync', function() {
	let port = user_config.port ? user_config.port : 8080;
	return browserSync.init({
		proxy : "localhost:" + port,
		ws : true,
		watchTask : true,
		notify: false,
		files: ['src/public/**/*', 'views/**/*']
	},function(){
	});
});
for(let option of [{
	name : "nodemon",
	exec : 'node --max-old-space-size=65536 --trace-warnings --unhandled-rejections=strict src/index.js'
}]){
	gulp.task(option.name, function (done) {
		var stream = nodemon({
			exec: option.exec,
			// exec: 'npm run observer',
			ext: 'html js mjs css pug',
			ignore: ["public/*"],
			tasks: [],
			watch : ['src'],
			done: done
		});
		stream.on('restart', function() {
			console.log('restarted!')
		})
		.on('crash', function() {
			console.error('Application has crashed!\n')
			stream.emit('restart', 10) // restart the server in 10 seconds
		});
		return stream;
	});
}
gulp.task('develop',gulp.series('sass',gulp.parallel('nodemon','browser-sync','sass:watch')));
