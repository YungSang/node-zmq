//
//  Hello World server in Node.js
//  Binds REP socket to tcp://*:5555
//  Expects "Hello" from client, replies with "World"
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to client
var responder = context.socket(zmq.REP);

//  Wait for a request from client
responder.on("recv_buf", function(messages) {
	console.log("Received request: " + messages[0]);

	//  Do some 'work'
	zmq.sleep(1);

	//  Send reply back to client
	responder.send("こんにちわ！");
});

responder.bind("tcp://*:5555");
