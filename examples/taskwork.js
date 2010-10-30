//
//  Task worker in Node.js
//  Connects PULL socket to tcp://localhost:5557
//  Collects workloads from ventilator via that socket
//  Connects PUSH socket to tcp://localhost:5558
//  Sends results to sink via that socket
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
