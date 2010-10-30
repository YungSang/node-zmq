//
//  Pubsub envelope publisher in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to client
var publisher = context.socket(zmq.PUB);

publisher.bind("tcp://*:5563");

while (1) {
	//  Write two messages, each with an envelope and content
	publisher.send("A", zmq.SNDMORE);
	publisher.send("We don't want to see this");
	publisher.send("B", zmq.SNDMORE);
	publisher.send("We would like to see this");

	zmq.sleep(1);
}