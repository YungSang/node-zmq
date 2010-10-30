//
//  Custom routing Router to Dealer (XREP to XREQ) in Node.js
//
var zmq  = require('zmq');
var Script = process.binding('evals').Script;

var worker_a_js = [
	'var worker = context.socket(zmq.XREQ);',
	'worker.setopt(zmq.IDENTITY, "A");',
	'var total = 0;',
	'worker.on("recv", function(messages){',
	'	if (messages[0] == "END") {',
	'		console.log("A received: " + total);',
	'		worker.close();',
	'	}',
	'	total++;',
	'});',
	'worker.connect("ipc://routing.ipc");'
].join("\n");

var worker_b_js = [
	'var worker = context.socket(zmq.XREQ);',
	'worker.setopt(zmq.IDENTITY, "B");',
	'var total = 0;',
	'worker.on("recv", function(messages){',
	'	if (messages[0] == "END") {',
	'		console.log("B received: " + total);',
	'		worker.close();',
	'	}',
	'	total++;',
	'});',
	'worker.connect("ipc://routing.ipc");'
].join("\n");

var context = new zmq.Context();

var client = context.socket(zmq.XREP);
client.bind("ipc://routing.ipc");

Script.runInNewContext(worker_a_js, {
	zmq: zmq, context: context, console: console
});
Script.runInNewContext(worker_b_js, {
	zmq: zmq, context: context, console: console
});

zmq.sleep(1);

for (var task_nbr = 0 ; task_nbr < 10 ; task_nbr++) {
	if (Math.floor( Math.random() * 3 ) > 0) {
		client.send("A", zmq.SNDMORE);
	}
	else {
		client.send("B", zmq.SNDMORE);
	}
	client.send("This is the workload");
}

client.send("A", zmq.SNDMORE);
client.send("END");

client.send("B", zmq.SNDMORE);
client.send("END");

setTimeout(function() {
	client.close();
	context.term();
}, 1000);
