//
//  Synchronized subscriber in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  First, connect our subscriber socket
var subscriber = context.socket(zmq.SUB);

//  Third, get our updates and report how many we got
var update_nbr = 0;
subscriber.on("recv", function(messages) {
	if (messages[0] == "END") {
		console.log("Received " + update_nbr + " updates");
		setTimeout(function() {
			subscriber.close();
			syncclient.close();
			context.term();
		}, 0);
	}
	update_nbr++;
});

subscriber.connect("tcp://localhost:5561");

subscriber.setopt(zmq.SUBSCRIBE, "");

//  Second, synchronize with publisher
var syncclient = context.socket(zmq.REQ);

syncclient.connect("tcp://localhost:5562");

//  - send a synchronization request
syncclient.send("");
