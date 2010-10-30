var zmq = require('zmq');

var context = new zmq.Context();

var socket = context.socket(zmq.REP);

socket.on("recv", function(messages) {
	for (var i = 0, len = messages.length ; i < len ; i++) {
		console.log(messages[i]);
	}
	socket.send("World!");
	socket.close();
});

socket.bind("tcp://*:5555");
