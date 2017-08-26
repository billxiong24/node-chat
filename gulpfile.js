var logger = require('./util/logger.js')(module);
require('dotenv').config();
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gulp_jshint = require('gulp-jshint');
var gulp_rename = require('gulp-rename');

var gulp_watch = require('gulp-watch');
var gulp_newer = require('gulp-newer');
var gulp_run = require('gulp-run');
//var gulp_declare = require('gulp-declare');
//var gulp_wrap = require('gulp-wrap');
//var gulp_handlebars = require('gulp-handlebars');
//var gulp_precompile_handlebars = require('gulp-precompile-handlebars');
//var gulp_define_module = require('gulp-define-module');
var gulp_nodemon = require('gulp-nodemon');
var clean_css = require('gulp-clean-css');

var fixme = require('fixme');
var gulp_mocha = require('gulp-mocha');
var gulp_webpack = require('gulp-webpack');
var runSeq = require('run-sequence');
var gulp_todo = require('gulp-todo');
//TODO precompile handlebars,
//minify, concat css
//run jshint,
//using requirejs optimizer, ...
//concat and minify clientside js
//build and run project using gulp-nodemon
//

var neon_js_src = [
    'public/javascripts/js/index.js',
    'public/stylesheets/assets/js/gsap/TweenMax.min.js',
    'public/stylesheets/assets/js/jquery-ui/js/jquery-ui-1.10.3.minimal.min.js',
    'public/stylesheets/assets/js/bootstrap.js',
    'public/stylesheets/assets/js/joinable.js',
    'public/stylesheets/assets/js/resizeable.js',
    'public/stylesheets/assets/js/neon-api.js',
    'public/stylesheets/assets/js/neon-chat.js',
    'public/javascripts/js.cookie.js',
    'public/stylesheets/assets/js/neon-custom.js',
    'public/stylesheets/assets/js/neon-demo.js'
];

var charts = [
    "public/stylesheets/assets/js/rickshaw/vendor/d3.v3.js",
    "public/stylesheets/assets/js/rickshaw/rickshaw.min.js",
    "public/stylesheets/assets/js/raphael-min.js",
    "public/stylesheets/assets/js/morris.min.js",
    'public/stylesheets/assets/js/neon-charts.js'
];

var home_js_src = [
    'public/stylesheets/assets/js/gsap/TweenMax.min.js',
    'public/stylesheets/assets/js/jquery-ui/js/jquery-ui-1.10.3.minimal.min.js',
    'public/stylesheets/assets/js/bootstrap.js',
    'public/stylesheets/assets/js/joinable.js',
    'public/stylesheets/assets/js/resizeable.js',
    'public/stylesheets/assets/js/neon-api.js',
    'public/javascripts/js.cookie.js',
    'public/stylesheets/assets/js/neon-custom.js'
];

var handlebars_src = [
    'views/partials/*.handlebars'
];

var neon_css_src = [
    'public/stylesheets/assets/css/font-icons/entypo/css/*.css',
    'public/stylesheets/assets/css/*.css'
];
gulp.task('compress-charts', function() {
    compress_js(charts, 'neon.min.charts.js');
});

gulp.task('compress-neon-css', function() {
    gulp.src(neon_css_src)
        .pipe(clean_css(function(details) {
        console.log("original size: " + details.stats.originalSize);
        console.log("compressed size: " + details.stats.minifiedSize);
    })).pipe(concat('neon.min.css'))
    .pipe(gulp.dest('public/stylesheets/style-build'));
});

//use bash script, since that's easier than all the other stuff
gulp.task('precompile-hbs', function() {
    gulp_run('handlebars -m views/partials/ -f public/javascripts/templates/templates.js').exec(function() {
        console.log('-------------Finished compiling hbs templates-------------');
    });
});

gulp.task('compress-neon-js', function() {
    compress_js(neon_js_src, 'neon.min.js');
});
gulp.task('compress-home-js', function() {
    compress_js(home_js_src, 'home.min.js');
});

function compress_js(source, dest_name) {

    var numSrc = 0;
    var numMin = 0;

    return gulp.src(source)
        .on('data', function(data) {
        console.log("Preparing " + data.history[0] + " for jshint");
        numSrc++;
    }).pipe(gulp_jshint())
    .pipe(uglify()).on("data", function(data) {
        console.log("Minifying " + data.history[0]);
        numMin++;
    })
    .pipe(concat(dest_name))
    .pipe(gulp.dest('public/javascripts/js-build'))
    .on("finish", function() {
        console.log("-------------------------------------------------------------");
        console.log("Wrote minifed file to destination public/javascripts/js-build");
        console.log("Compressed " + numMin + " source files. Exiting with 0 status.");
    });
}

gulp.task('compress-home-css', function() {

});


gulp.task('start-cache-worker', function() {
    gulp_nodemon({
        script: './app/workers/cache_monitor.js',
        ext: 'js',
        env: {'PORT': 3001, 'NODE_ENV': 'development'}
    });
});

gulp.task('todo', function() {
    fixme({
        path: process.cwd(),
        ignored_directories: ['public/javascripts/js/**', 
            'public/javascripts/js-build/*', 
            'bower_components/**/*', 
            'node_modules/**', 
            '.git/**', 
            '.hg/**', 
            'public/stylesheets/assets/js/**/*'],
        file_patterns: ['**/*.js', '**/*.sh'],
        file_encoding: 'utf8',
        line_length_limit: 1000
    });
});

gulp.task('todofile', function() {
    return gulp.src(['./**/*.js','!public/javascripts/js/**', 
            '!public/javascripts/js-build/*', 
            '!bower_components/**/*', 
            '!node_modules/**', 
            '!.git/**', 
            '!.hg/**', 
            '!public/stylesheets/assets/js/**/*', '!*.md', '!*.json']).pipe(gulp_todo()).pipe(gulp.dest('./docs'));

});


gulp.task('start', function() {
    gulp_nodemon({
        script: './run/app.js',
        ext: 'js',
        env: {'BLUEBIRD_WARNINGS':0, 'NODE_ENV': 'development'}
    });
});

gulp.task('clean', function() {
    gulp_run('mysql -u root --password='+process.env.PASS+'< ./app/database/test/clean.sql').exec(function(err) {
        gulp_run('mysql -u root --password='+process.env.PASS+' chatdbtest < ./app/database/test/mockdata.sql').exec(function(err) {
            gulp_run('mysql -u root --password='+process.env.PASS+' chatdbtest < ./app/database/emailConfirm.sql').exec();
        });
    });
});
gulp.task('test', function() {
    //FIXME local host password shouldnot be here, but o well
    gulp_run('mysql -u root --password='+process.env.PASS+' < ./app/database/test/clean.sql').exec(function(err) {
        gulp_run('mysql -u root --password='+process.env.PASS+' chatdbtest < ./app/database/test/mockdata.sql').exec(function(err) {

            process.env.NODE_ENV = "test";
            gulp.src('./test/*.js', {read: true}).pipe(gulp_mocha({
                reporter: 'spec'
            })).on('error', function() {
                process.exit(1);
            });
        });
    });
});

gulp.task('webpack', function() {
    gulp_webpack(require('./webpack.config.js')).pipe(gulp.dest('public/javascripts/bundle'));
});

gulp.task('watch', function() {
    gulp.watch(handlebars_src, ['precompile-hbs']);
    gulp.watch(neon_js_src, ['compress-neon-js']);
    gulp.watch(neon_css_src, ['compress-neon-css']);
});

gulp.task('build', function() {
    runSeq('compress-neon-css', 'precompile-hbs', 'compress-neon-js', 'webpack', 'test', 'todofile');
});

gulp.task('default', ['build']);
