
var socket = require('socket.io-client').connect('http://dry-everglades-8766.herokuapp.com/');
socket.on('connect', function(){
  console.log('connected');
  socket.on('event', function(data){});
  socket.on('disconnect', function(){});
});