var zmq = require('zmq');

var context = new zmq.Context();

var socket = context.socket(zmq.REQ);

socket.on("recv", function(messages) {
	for (var i = 0, len = messages.length ; i < len ; i++) {
		console.log(messages[i]);
	}
	socket.close();
});

socket.connect("tcp://localhost:5555");

var rc = socket.send("Hello");
