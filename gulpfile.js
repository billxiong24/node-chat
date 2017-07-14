var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var gulp_jshint = require('gulp-jshint');
var gulp_rename = require('gulp-rename');

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

gulp.task('compress-neon-css', function() {
    gulp.src([
        'public/stylesheets/assets/css/font-icons/entypo/css/*.css',
        'public/stylesheets/assets/css/*.css'
    ]).pipe(clean_css(function(details) {
        console.log("original size: " + details.stats.originalSize);
        console.log("compressed size: " + details.stats.minifiedSize);
    })).pipe(concat('neon.min.css'))
    .pipe(gulp.dest('public/stylesheets/style-build'));
});

var numSrc = 1;
var numMin = 1;


//use bash script, since that's easier than all the other stuff
gulp.task('precompile-hbs', function() {
    gulp_run('handlebars -m views/partials/ -f public/javascripts/templates.js').exec();
});

gulp.task('compress-neon-js', ['precompile-hbs'], function() {
    gulp.src([
        'public/javascripts/js/index.js',
        'public/stylesheets/assets/js/gsap/TweenMax.min.js',
        'public/stylesheets/assets/js/jquery-ui/js/jquery-ui-1.10.3.minimal.min.js',
        'public/stylesheets/assets/js/bootstrap.js',
        'public/stylesheets/assets/js/joinable.js',
        'public/stylesheets/assets/js/resizeable.js',
        'public/stylesheets/assets/js/neon-api.js',
        'public/javascripts/templates.js',
        'public/stylesheets/assets/js/neon-chat.js',
        'public/javascripts/js.cookie.js',
        'public/javascripts/js/require.js',
        'public/javascripts/requireconfig.js',
        'public/stylesheets/assets/js/neon-custom.js',
        'public/stylesheets/assets/js/neon-demo.js'
    ]).on('data', function(data) {
        console.log("Preparing " + data.history[0] + " for jshint");
        numSrc++;
    }).pipe(gulp_jshint())
    .pipe(uglify()).on("data", function(data) {
        console.log("Minifying " + data.history[0]);
        numMin++;
    })
    .pipe(concat('neon.min.js'))
    .pipe(gulp.dest('public/javascripts/js-build'))
    .on("finish", function() {
        console.log("-------------------------------------------------------------");
        console.log("Wrote minifed file to destination public/javascripts/js-build");
        console.log("Compressed " + numMin + " source files. Exiting with 0 status.");
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
