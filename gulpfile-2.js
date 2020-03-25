require("es6-promise").polyfill();

var gulp = require("gulp"),
    browserify = require("browserify"),
    concatCss = require("gulp-concat-css"),
    cleanCSS = require("gulp-clean-css"),
    sass = require("gulp-sass"),
    uglify = require("gulp-uglify"),
    buffer = require("vinyl-buffer"),
    source = require("vinyl-source-stream"),
    sourcemaps = require("gulp-sourcemaps"),
    merge = require("merge-stream"),
    postcss = require("gulp-postcss"),
    pxtorem = require("postcss-pxtorem"),
    autoprefixer = require("autoprefixer"),
    shell = require("gulp-shell"),
    replace = require("gulp-replace");

var cssProcessors = [
    autoprefixer(),
    pxtorem({
        rootValue: 14,
        replace: false,
        propWhiteList: []
    })
];

gulp.task(
    "scripts",
    gulp.series(function() {
        return browserify("./jet/static/jet/js/src/main.js")
            .bundle()
            .on("error", function(error) {
                console.error(error);
            })
            .pipe(source("bundle.min.js"))
            .pipe(buffer())
            // .pipe(uglify())
            .pipe(gulp.dest("./jet/static/jet/js/build/"));
    })
);

gulp.task(
    "styles",
    gulp.series(function() {
        return gulp
            .src("./jet/static/jet/css/**/*.scss")
            .pipe(sourcemaps.init())
            .pipe(
                sass({
                    outputStyle: "compressed"
                })
            )
            .on("error", function(error) {
                console.error(error);
            })
            .pipe(postcss(cssProcessors))
            .on("error", function(error) {
                console.error(error);
            })
            .pipe(sourcemaps.write("./"))
            .pipe(gulp.dest("./jet/static/jet/css"));
    })
);

gulp.task(
    "vendor-styles",
    gulp.series(function() {
        return merge(
            gulp
                .src("./node_modules/jquery-ui/themes/base/images/*")
                .pipe(gulp.dest("./jet/static/jet/css/jquery-ui/images/")),
            merge(
                gulp.src([
                    "./node_modules/select2/dist/css/select2.css",
                    "./node_modules/timepicker/jquery.ui.timepicker.css"
                ]),
                gulp
                    .src(["./node_modules/jquery-ui/themes/base/all.css"])
                    .pipe(cleanCSS()) // needed to remove jQuery UI comments breaking concatCss
                    .on("error", function(error) {
                        console.error(error);
                    })
                    .pipe(
                        concatCss("jquery-ui.css", {
                            rebaseUrls: false
                        })
                    )
                    .on("error", function(error) {
                        console.error(error);
                    })
                    .pipe(replace("images/", "jquery-ui/images/"))
                    .on("error", function(error) {
                        console.error(error);
                    }),
                gulp
                    .src([
                        "./node_modules/perfect-scrollbar/css/perfect-scrollbar.css"
                    ])
                    .pipe(
                        sass({
                            outputStyle: "compressed"
                        })
                    )
                    .on("error", function(error) {
                        console.error(error);
                    })
            )
                .pipe(postcss(cssProcessors))
                .on("error", function(error) {
                    console.error(error);
                })
                .pipe(
                    concatCss("vendor.css", {
                        rebaseUrls: false
                    })
                )
                .on("error", function(error) {
                    console.error(error);
                })
                .pipe(cleanCSS())
                .on("error", function(error) {
                    console.error(error);
                })
                .pipe(gulp.dest("./jet/static/jet/css"))
        );
    })
);

gulp.task(
    "vendor-translations",
    gulp.series(function() {
        return merge(
            gulp
                .src(["./node_modules/jquery-ui/ui/i18n/*.js"])
                .pipe(gulp.dest("./jet/static/jet/js/i18n/jquery-ui/")),
            gulp
                .src(["./node_modules/timepicker/i18n/*.js"])
                .pipe(
                    gulp.dest("./jet/static/jet/js/i18n/jquery-ui-timepicker/")
                ),
            gulp
                .src(["./node_modules/select2/dist/js/i18n/*.js"])
                .pipe(gulp.dest("./jet/static/jet/js/i18n/select2/"))
        );
    })
);

gulp.task(
    "locales",
    gulp.series(
        async () => {
            await shell.task("python3.7 manage.py compilemessages", {
                quiet: true
            });
        },
        done => done(console.log("locals 执行完成"))
    )
);

gulp.task(
    "pipinstall",
    gulp.series(
        async () => {
            await shell.task("pip3.7 install .", {
                quiet: true
            });
        },
        done => done(console.log("安装 pip 执行完成"))
    )
);

gulp.task(
    "build",
    gulp.series(
        [
            "scripts",
            "styles",
            "vendor-styles",
            "vendor-translations",
            "locales"
        ],
        done => done(console.log("build 执行完成"))
    )
);

gulp.task(
    "watch",
    gulp.series(
        function() {
            gulp.watch(
                "./jet/static/jet/js/src/**/*.js",
                gulp.series("scripts")
            );
            gulp.watch("./jet/static/jet/css/**/*.scss", gulp.series("styles"));
            gulp.watch("./jet/locale/**/*.po", gulp.series("locales"));
            gulp.watch(
                "./jet/dashboard/locale/**/*.po",
                gulp.series("locales")
            );
        },
        done => done()
    )
);

gulp.task(
    "default",
    // gulp.series(["build", "watch"], done =>
    gulp.series(["build"], done =>
        done(console.log("default 执行完成"))
    )
);
