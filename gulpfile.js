var gulp            = require('gulp'),       
    browserSync     = require('browser-sync'),   
    reload          = browserSync.reload,
    notify          = require("gulp-notify")
    nodemon          = require("gulp-nodemon")         

gulp.task('browser-sync', () => {
    browserSync({
    	proxy: '127.0.0.1:8080',
        port: 5000,
        notify: true,
        files: ['./app/*.*', './config/*.*', './app/models/*.*', './views/*.*', './server.js']
    })
})

gulp.task('nodemon', () => {
    nodemon({
        script: 'server.js',
        ignore: ['./gulpfile.js','./node_modules','./db']
    })
    .on('restart', () => {
        setTimeout(() =>  {
            reload({ stream: false })
        }, 1000)
        gulp.src(".").pipe(notify("Node Server Restarted!"))
    })
    .on('crash', () => {
        gulp.src(".").pipe(notify("Node Server Crash!"))
    })
    .on('start', () => {
        gulp.src(".").pipe(notify("Node Server Started!"))
    })
})
gulp.task('default', ['browser-sync', 'nodemon'])