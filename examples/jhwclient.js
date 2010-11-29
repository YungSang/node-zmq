//
//  Hello World client in Node.js
//  Connects REQ socket to tcp://localhost:5555
//  Sends "Hello" to server, expects "World" back
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to server
var requester = context.socket(zmq.REQ);

//  Do 10 requests, waiting each time for a response
var request_nbr = 0;

requester.on("recv_buf", function(messages) {
	console.log("Received reply: " + request_nbr + ": [" + messages[0] + "]");

	request_nbr++;
	if (request_nbr >= 10) {
		setTimeout(function() {
			requester.close();
			context.term();
		}, 0);
		return;
	}

	console.log("Sending request: " + request_nbr + "...");
	var rc = requester.send("こんにちわ");
});

requester.connect("tcp://localhost:5555");

//  Start sending a request to server
console.log("Sending request: " + request_nbr + "...");
var rc = requester.send("こんにちわ");
