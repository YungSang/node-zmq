//
//  Task ventilator in Node.js
//  Binds PUSH socket to tcp://localhost:5557
//  Sends batch of tasks to workers via that socket
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to send messages on
var sender = context.socket(zmq.PUSH);
sender.bind("tcp://*:5557");

//  We have to synchronize the start of the batch with all workers being up and
//  running. This is a fairly common gotcha in ØMQ and there is no easy solution.
//  The 'connect' method takes a certain time. So when a set of workers connect
//  to the ventilator, the first one to successfully connect will get a whole
//  load of messages in that short time while the others are also connecting.
//  If you don't synchronize the start of the batch somehow, the system won't run
//  in parallel at all. Try removing the wait, and see.
zmq.sleep(1);

//  The first message is "0" and signals start of batch
sender.send("0");

//  Total calculated cost in msecs
var total_msec = 0;

for (var task_nbr = 0 ; task_nbr < 100 ; task_nbr++) {
	//  Random workload from 1 to 100msecs
	var workload = Math.floor( Math.random() * 100 ) + 1;
	total_msec += workload;
	sender.send("" + workload);
}

console.log("Total expected cost: " + total_msec + " msec");

// Give 0MQ time to deliver
zmq.sleep(1);

sender.close();
context.term();