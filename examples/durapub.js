//
//  Publisher for durable subscriber in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Subscriber tells us when it's ready here
var sync = context.socket(zmq.PULL);

//  Wait for synchronization request
sync.on("recv", function(messages) {
	setTimeout(function() {
		//  Now broadcast exactly 10 updates with pause
		for (var update_nbr = 0 ; update_nbr < 10 ; update_nbr++) {
			publisher.send("Update " + update_nbr);
			zmq.sleep(1);
		}
		publisher.send("END");

		zmq.sleep(1);

		publisher.close();
		context.term();
	}, 0);
	sync.close();
});

sync.bind("tcp://*:5564");

//  We send updates via this socket
var publisher = context.socket(zmq.PUB);

publisher.bind("tcp://*:5565");
