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

//TODO precompile handlebars,
//minify, concat css
//run jshint,
//using requirejs optimizer, ...
//concat and minify clientside js
//build and run project using gulp-nodemon

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
    'public/javascripts/js/require.js',
    'public/javascripts/requireconfig.js',
    'public/stylesheets/assets/js/neon-custom.js',
    'public/stylesheets/assets/js/neon-demo.js'
];

var home_js_src = [
    'public/stylesheets/assets/js/gsap/TweenMax.min.js',
    'public/stylesheets/assets/js/jquery-ui/js/jquery-ui-1.10.3.minimal.min.js',
    'public/stylesheets/assets/js/bootstrap.js',
    'public/stylesheets/assets/js/joinable.js',
    'public/stylesheets/assets/js/resizeable.js',
    'public/stylesheets/assets/js/neon-api.js',
    'public/javascripts/js.cookie.js',
    'public/javascripts/js/require.js',
    'public/javascripts/requireconfig.js',
    'public/stylesheets/assets/js/neon-custom.js'
];

var handlebars_src = [
    'views/partials/*.handlebars'
];

var neon_css_src = [
    'public/stylesheets/assets/css/font-icons/entypo/css/*.css',
    'public/stylesheets/assets/css/*.css'
];

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
    gulp_run('handlebars -m views/partials/ -f public/javascripts/templates/templates.js').exec();
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

gulp.task('build', ['compress-neon-css', 'precompile-hbs', 'compress-neon-js']);

gulp.task('start-cache-worker', function() {
    gulp_nodemon({
        script: './app/workers/cache_monitor.js',
        ext: 'js',
        env: {'PORT': 3001, 'NODE_ENV': 'development'}
    });
});
gulp.task('start', function() {
    gulp_nodemon({
        script: 'app.js',
        ext: 'js',
        env: {'BLUEBIRD_WARNINGS':0, 'NODE_ENV': 'development'}
    });
});


//gulp.task('precompile-handlebars', function() {
    //gulp.src('views/partials/*.handlebars')
    //.pipe(gulp_handlebars({
        //handlebars: require('handlebars')
    //}))
    //.pipe(gulp_wrap('Handlebars.template(<%= contents %>)'))
    //.pipe(gulp_declare({
        //namespace: 'Handlebars.templates',
        //noRedeclare: true
    //}))
    //.pipe(concat('templates.js'))
    //.pipe(gulp.dest('public/javascripts/templates'));
//});


gulp.task('watch', function() {
    gulp.watch(handlebars_src, ['precompile-hbs']);
    gulp.watch(neon_js_src, ['compress-neon-js']);
    gulp.watch(neon_css_src, ['compress-neon-css']);
});

gulp.task('default', ['watch']);
