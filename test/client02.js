var zmq = require('../build/default/index');

var context = new zmq.Context();

var socket = context.socket(zmq.REQ);

socket.on("recv", function(messages) {
	for (var i = 0, len = messages.length ; i < len ; i++) {
		console.log(messages[i]);
	}
	setTimeout(function() {
		socket.close();
	}, 0);
});

socket.connect("tcp://localhost:5555");

var rc = socket.send("From Client02:", zmq.SNDMORE);

var rc = socket.send("Hello");
