//
//  Pubsub envelope subscriber in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to server
var subscriber = context.socket(zmq.SUB);

subscriber.on("recv", function(messages) {
	console.log("[" + messages[0] + "]" + messages[1]);
});

subscriber.connect("tcp://localhost:5563");

subscriber.setopt(zmq.SUBSCRIBE, "B");
