module.exports = {
    server: {
      baseDir: './source',
      serveStaticOptions: {
          extensions: ["html", "htm"]
      }
    },
    files: [
      'source/**/*.html',
      'source/js/**/*.js',
      'source/css/**/*.css'
    ],
    // https: true,
    startPath: '',
    port: 3000
  };
  