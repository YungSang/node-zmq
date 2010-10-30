//
//  Reading from multiple sockets in Node.js
//  This version uses a simple recv loop
//
var zmq  = require('zmq');

var context = new zmq.Context();

//  Socket to receive messages on from task ventilator
var receiver = context.socket(zmq.PULL);

receiver.on("recv", function(messages) {
	console.log("Received reply from task ventilator: " + messages[0]);
});

receiver.connect("tcp://localhost:5557");

//  Socket to receive messages on from weather server 
var subscriber = context.socket(zmq.SUB);

subscriber.on("recv", function(messages) {
	console.log("Received reply from weather server: " + messages[0]);
});

subscriber.connect("tcp://localhost:5556");

subscriber.setopt(zmq.SUBSCRIBE, "10001");
