//
//   Request-reply service in Node.js
//   Connects REP socket to tcp://localhost:5560
//   Expects "Hello" from client, replies with "World"
//
var zmq = require('zmq');

var context = new zmq.Context();

var responder = context.socket(zmq.REP);

//  Wait for a request from client
responder.on("recv", function(messages) {
	console.log("Received request: " + messages[0]);

	//  Do some 'work'
	zmq.sleep(1);

	//  Send reply back to client
	responder.send("World");
});

responder.connect("tcp://localhost:5560");
