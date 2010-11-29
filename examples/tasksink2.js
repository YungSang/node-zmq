//
//  Task sink in Node.js - design 2
//  Adds pub-sub flow to send kill signal to workers
//
var zmq  = require('zmq');
var util = require('utils');

var context = new zmq.Context();

//  Socket to receive messages on
var receiver = context.socket(zmq.PULL);

//  Stopwatch to report duration of batch
var watch = new zmq.Stopwatch();

var task_nbr = 0

receiver.on("recv", function(messages) {
	if (!task_nbr) {
		//  Wait for start of batch
		console.log("Start a stopwatch now");
		watch.start();
	}
	else {
		//  Simple progress indicator for the viewer
		util.print((task_nbr % 10) ? "." : ":");
	}

	//  Process 100 confirmations (+ the start of batch = 101)
	task_nbr++;
	if (task_nbr > 100) {
		console.log("\nTotal elapsed time: " + (watch.stop() / 1000) + " msec");
		controller.send("KILL");
		setTimeout(function() {
			receiver.close();
			controller.close();
			context.term();
		}, 0);
	}
});

receiver.bind("tcp://*:5558");

//  Socket for worker control
var controller = context.socket(zmq.PUB);
controller.bind("tcp://*:5559");
