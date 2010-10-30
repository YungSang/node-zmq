//
//  Durable subscriber in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Connect our subscriber socket
var subscriber = context.socket(zmq.SUB);

//  Get updates, expect random Ctrl-C death
subscriber.on("recv", function(messages) {
	console.log(messages[0]);
	if (messages[0] == "END") {
		subscriber.close();
		context.term();
	}
});

subscriber.setopt(zmq.IDENTITY, "Hello");
subscriber.setopt(zmq.SUBSCRIBE, "");
subscriber.connect("tcp://localhost:5565");

//  Synchronize with publisher
var sync = context.socket(zmq.PUSH);
sync.connect("tcp://localhost:5564");
sync.send("");
zmq.sleep(1);
sync.close();
