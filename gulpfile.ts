const gulp = require("gulp");
const inlinesource = require("gulp-inline-source");
const replace = require("gulp-replace");

gulp.task("default", () => {
  return gulp
    .src("./build/*.html")
    .pipe(replace('rel="stylesheet">', 'rel="stylesheet" inline>'))
    .pipe(replace('.js"></script>', '.js" inline></script>'))
    .pipe(
      inlinesource({
        ignore: ["png"],
      })
    )
    .pipe(gulp.dest("./build"));
});
