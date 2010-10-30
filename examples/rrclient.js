//
//   Request-reply client in C++
//   Connects REQ socket to tcp://localhost:5559
//   Sends "Hello" to server, expects "World" back
//
var zmq = require('zmq');

var context = new zmq.Context();

var requester = context.socket(zmq.REQ);

//  Do 10 requests, waiting each time for a response
var request_nbr = 0;

requester.on("recv", function(messages) {
	console.log("Received reply: " + request_nbr + ": [" + messages[0] + "]");

	request_nbr++;
	if (request_nbr >= 10) {
		requester.close();
		context.term();
		return;
	}

	requester.send("Hello");
});

requester.connect("tcp://localhost:5559");

//  Start sending a request to server
requester.send("Hello");
