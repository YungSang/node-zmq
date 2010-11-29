//
//  Synchronized publisher in Node.js
//
var zmq = require('zmq');

var SUBSCRIBERS_EXPECTED = 2;

var context = new zmq.Context();

//  Socket to talk to clients
var publisher = context.socket(zmq.PUB);

publisher.bind("tcp://*:5561");

//  Socket to receive signals
var syncservice = context.socket(zmq.REP);

//  Get synchronization from subscribers
var subscribers = 0;
syncservice.on("recv", function(messages) {
	syncservice.send("");
	subscribers++;
	if (subscribers >= SUBSCRIBERS_EXPECTED) {
		//  Now broadcast exactly 10k updates followed by END
		for (var update_nbr = 0 ; update_nbr < 10000 ; update_nbr++) {
			publisher.send("Rhubarb");
		}
		publisher.send("END");

		setTimeout(function() {
			syncservice.close();
			publisher.close();
			context.term();
		}, 1000);
	}
});

syncservice.bind("tcp://*:5562");
