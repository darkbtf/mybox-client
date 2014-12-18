var chokidar = require('chokidar');

var watcher = chokidar.watch('box', { persistent: true });

watcher
  .on('add', function(path) {

  })
  .on('addDir', function(path) {console.log('Directory', path, 'has been added');})
  .on('change', function(path) {console.log('File', path, 'has been changed');})
  .on('unlink', function(path) {console.log('File', path, 'has been removed');})
  .on('unlinkDir', function(path) {console.log('Directory', path, 'has been removed');})
  .on('error', function(error) {console.error('Error happened', error);})
  .on('ready', function() {console.info('Initial scan complete. Ready for changes.');})
  .on('raw', function(event, path, details) {console.info('Raw event info:', event, path, details);});

var sync = function() {

};

var serverListener = setInterval(function() {
  //console.log('fuck');
  clearInterval(serverListener);
}, 5000);
