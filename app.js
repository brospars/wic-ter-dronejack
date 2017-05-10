// Utils
var path = require("path");

// App server
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));

var currentImg = null;
var imageSendingPaused = false;

app.get("/image/:id", function(req, res) {
  res.writeHead(200, {
    "Content-Type": "image/png"
  });
  return res.end(currentImg, "binary");
});

// Drone client
var drone = require("ar-drone").createClient();
drone.config('general:navdata_demo', 'TRUE');

// Socket
var io = require('socket.io')(http);

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on("move", function(cmd) {
    var _name;
    console.log("move", cmd);
    return typeof drone[_name = cmd.action] === "function" ? drone[_name](cmd.speed) : void 0;
  });
  socket.on("animate", function(cmd) {
    console.log('animate', cmd);
    return drone.animate(cmd.action, cmd.duration);
  });
  socket.on("command", function(cmd) {
    var _name;
    console.log('drone command: ', cmd);
    return typeof drone[_name = cmd.action] === "function" ? drone[_name]() : void 0;
  });
  drone.on('navdata', function(data) {
    return io.emit("navdata", data);
  });
  drone.createPngStream().on("data", function(frame) {
    currentImg = frame;
    if (imageSendingPaused) {
      return;
    }
    io.emit("image", "/image/" + (Math.random()));
    imageSendingPaused = true;
    return setTimeout((function() {
      return imageSendingPaused = false;
    }), 100);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
