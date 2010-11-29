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

		setTimeout(function() {
			publisher.close();
			context.term();
		}, 1000);
	}, 0);
	setTimeout(function() {
		sync.close();
	}, 0);
});

sync.bind("tcp://*:5564");

//  We send updates via this socket
var publisher = context.socket(zmq.PUB);

//  Prevent publisher overflow from slow subscribers
publisher.setopt(zmq.HWM, 2);

//  Specify swap space in bytes, this covers all subscribers
publisher.setopt(zmq.SWAP, 25000000);

publisher.bind("tcp://*:5565");
