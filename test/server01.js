var zmq = require('../build/default/index');

var context = new zmq.Context();

var socket = context.socket(zmq.REP);

socket.on("recv", function(messages) {
	for (var i = 0, len = messages.length ; i < len ; i++) {
		console.log(messages[i]);
	}
	socket.send("World!");
	setTimeout(function() {
		socket.close();
	}, 0);
});

socket.bind("tcp://*:5555");
