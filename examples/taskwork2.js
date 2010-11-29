//
//  Task worker in Node.js - design 2
//  Adds pub-sub flow to receive and respond to kill signal
//
var zmq  = require('zmq');
var util = require('utils');

var context = new zmq.Context();

//  Socket to receive messages on
var receiver = context.socket(zmq.PULL);

receiver.on("recv", function(messages) {
//	util.print(messages[0]);

	//  Workload in msecs
	var workload = parseInt(messages[0]);

	//  Do the work
	zmq.nanosleep(workload * 1000000);

	//  Send results to sink
	sender.send(messages[0]);

	//  Simple progress indicator for the viewer
	util.print(".");
});

receiver.connect("tcp://localhost:5557");

//  Socket to send messages to
var sender = context.socket(zmq.PUSH);
sender.connect("tcp://localhost:5558");

//  Socket for control input
var controller = context.socket(zmq.SUB);

//  Any waiting controller command acts as 'KILL'
controller.on("recv", function(messages) {
	util.print("\n");
	setTimeout(function() {
		receiver.close();
		sender.close();
		controller.close();
		context.term();
	}, 0);
});

controller.connect("tcp://localhost:5559");
controller.setopt(zmq.SUBSCRIBE, "");
