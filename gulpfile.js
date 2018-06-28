var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var browserify = require('browserify');
var watchify = require('watchify');
var reactify = require('reactify');
var notifier = require('node-notifier');
var server = require('gulp-server-livereload');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var watch = require('gulp-watch')

//format error messages to be nicely readable

var notify = function(error) { 
	var message = "In: "; 
	var title = "Error: "; 
	
	if (error.description) { 
		title += error.description; 
	}
	else if (error.message) { 
		title += error.message; 
	}
	
	if (error.filename) { 
		var file = error.filename.split('/');
		message += file[file.length -1];
	}
	
	if (error.lineNumber) { 
		message += "\nOn Line: " + error.lineNumber;
	}
	
	//node-notifier
	notifier.notify({title: title, message: message}); 
	
}


//bundle settings

//watchify is an auto-bundler
//browserify lets you require modules in the browser/dependency bundling
//basically looks at the file and the dependency tree and bundles to one new file
//reacitfy transforms jsx to js 
var bundler = watchify(browserify({
	entries: ['./src/app.jsx'],
	transform: [reactify],
	extensions: ['.jsx'],
	debug: true, 
	cache: {}, 
	packageCache: {}, 
	fullPathes: true
}));

function bundle() { 
	return bundler
	.bundle()
	.on('error', notify)
	.pipe(source('main.js'))
	.pipe(gulp.dest('./'))
}
bundler.on('update', bundle); 

//create bundle
gulp.task('build', function() { 
	bundle()
});

//get SASSy
gulp.task('sass', function() { 
	gulp.src('./sass/main.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(concat('style.css'))
		.pipe(gulp.dest('./')); 
});

// Live reload server settings
//module loads the browser automatically each code change
//idk what this does really
gulp.task('serve', function(done) {
    gulp.src('')
        .pipe(server({
            livereload: {
                enable: true,
                filter: function(filePath, cb) {
                if (/main.js/.test(filePath)) {
                    cb(true)
                }
                else if (/style.css/.test(filePath)) {
                    cb(true)
                }
            }
        },
        open: true
    }));
});

// watch for SASSy changes
gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
});

// run tasks
gulp.task('default', ['build', 'serve', 'sass', 'watch']);
