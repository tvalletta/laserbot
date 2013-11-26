/**
 * Created by validity on 10/11/13.
 */

var express = require('express');
var     app = express();
var  server = require('http').createServer(app);
var      io = require('socket.io').listen(server);
var   laser = require('./motion-controlled-laser.js');


server.listen(3000);
app.use(express.static('client'));

var vtrs = [];
var vtrCount = 0;

io.configure('development', function() {
  io.enable('browser client etag');
  io.set('log level', 1);

  io.set('transports', [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]);
});

io.sockets.on('connection', function (socket) {
  var clientId = socket.id;

  // Register voter
  var guid = generateGuid();
  socket.guid = guid;
  vtrs[guid] = 0;
  vtrCount++;

  console.log(vtrs);

  // Send ack of connection
  socket.emit('ack', {
    message: 'You are connected.',
    id: guid
  });

  socket.on('target', function(coords) {
    if (laser && laser.move)
      laser.move(coords.x, coords.y);
  });
});

var generateGuid = function() {
  var mask = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  var guid = mask.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
  return guid;
}