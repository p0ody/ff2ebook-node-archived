let gulp = require('gulp');
let del = require('del');
let typescript = require('gulp-tsc');
let gulptslint = require('gulp-tslint');

const all = [
  'src/**/*',
];

//taken from vscode, todo add credit or make own
function reportFailures(failures) {
  failures.forEach(failure => {
    const name = failure.name || failure.fileName;
    const position = failure.startPosition;
    const line = position.lineAndCharacter ? position.lineAndCharacter.line : position.line;
    const character = position.lineAndCharacter ? position.lineAndCharacter.character : position.character;

    console.error(`${name}:${line + 1}:${character + 1}:${failure.failure}`);
  });
}

gulp.task('clean', function () {
  return del(['dist/']);
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.ts', ['compile'])
});

gulp.task('compile', function () {
  gulp.src(['src/**/*.ts'])
    .pipe(typescript({ sourceMap: true, target: "ES5" }))
    .pipe(gulp.dest('dist/'))
});

gulp.task('tslint', () => {
  const options = { summarizeFailureOutput: true };

  return gulp.src(all, { base: '.' })
    .pipe(gulptslint())
    .pipe(gulptslint.report(reportFailures, options));
});

gulp.task('default', ['compile']);