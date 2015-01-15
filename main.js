var chokidar = require('chokidar');
var fs = require('fs');
var request = require('request');
var http = require('http');
var URL = 'http://192.168.1.184:1337';

var timestamp = -1;

var ready = {};

// Read current timestamp
var timestampFile = fs.readFileSync(__dirname + '/timestamp.dat');
timestamp = parseInt(timestampFile.toString());
console.log('timestamp = ' + timestamp);

var watcher = chokidar.watch('box', {
  persistent: true
});

var fileList = {};

var uploadFile = function(path) {
  console.log('upload ' + path);
  var file = null;
  try {
    file = fs.createReadStream(__dirname + '/' + path);
    request.post({
      url: URL + '/upload',
      formData: {
        file: file,
        dir: path,
        time: Date.now()
      }
    }, function(err, res, body) {
      //console.log(body);
    });
  } catch (err) {
    console.log(err);
  }
};

var deleteFile = function(path) {
  console.log('delete ' + path);
  request.get(URL + '/delete/' + path);
};

watcher
  .on('add', function(path) {
    //if (timestamp) {
    if (!ready[path]) {
      ready[path] = true;
    } else {
      uploadFile(path);
    }
    //}
  })
  .on('change', function(path) {
    uploadFile(path);
    //}
  })
  .on('unlink', function(path) {
    if (!path.match('.DS_Store')) {
      delete fileList[path];
      path = path.substring(4);
      //console.log('delete ' + path);
      deleteFile(path);
    }
  });

var downloadFile = function(file) {
  console.log('download ' + file);
  var output = fs.createWriteStream(__dirname + '/box/' + file);
  var path = 'box/' + file;
  //fileList[path].ready = false;
  http.get(URL + '/download/' + file, function(res) {
    res.pipe(output);
  });
};

var serverListener = setInterval(function() {
  request.get({
    url: URL + '/sync/' + timestamp
  }, function(err, msg, res) {
    //console.log(res);
    var remoteFileList = JSON.parse(res);
    for (var i = 0; i < remoteFileList.length; ++i) {
      console.log(remoteFileList[i]);
      timestamp = Math.max(timestamp, remoteFileList[i].timestamp);
      if (!remoteFileList[i].deleted) {
        downloadFile(remoteFileList[i].filename);
      } else {
        //deleteFile(remoteFileList[i].filename);
        try {
          fs.unlinkSync(__dirname + '/box/' + remoteFileList[i].filename);
        } catch (err) {
          console.log(err);
        }
      }
    }
    fs.writeFileSync(__dirname + '/timestamp.dat', timestamp);

  });

  //clearInterval(serverListener);
}, 2000);
