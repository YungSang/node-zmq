//
//  Custom routing Router to Mama (XREP to REQ) in Node.js
//
var zmq = require('zmq');

var Script = process.binding('evals').Script;

var zhelper = require('./zhelpers');

var NBR_WORKERS = 10;

var worker_js = [
	'var worker = context.socket(zmq.REQ);',

	//  We use a string identity for ease here
	'zhelper.set_id(worker);',

	'var total = 0;',
	'worker.on("recv", function(messages) {',
		//  Get workload from router, until finished
	'	if (messages[0] == "END") {',
	'		console.log("Processed: [" + identity + "]: " + total + " tasks");',
	'		worker.close();',
	'		return;',
	'	}',
	'	total++;',

		//  Do some random work
	'	zmq.nanosleep(Math.floor( Math.random() * 100000000 ) + 1);',

	'	worker.send("ready");',
	'});',

	'worker.connect("ipc://routing.ipc");',

	//  Tell the router we're ready for work
	'worker.send("ready");'
].join("\n");

var context = new zmq.Context();

var client = context.socket(zmq.XREP);

for (var worker_nbr = 0 ; worker_nbr < NBR_WORKERS ; worker_nbr++) {
	Script.runInNewContext(worker_js, {
		zmq: zmq, context: context, zhelper: zhelper, Math: Math, console: console, identity: worker_nbr
	});
}

var worker_nbr = 0;
var task_nbr   = 0;
//  LRU worker is next waiting in queue
client.on("recv", function(messages) {
	if (task_nbr >= (NBR_WORKERS * 10)) {
		//  Now ask mamas to shut down and report their results
		client.send(messages[0], zmq.SNDMORE);
		client.send("", zmq.SNDMORE);
		client.send("END");

		worker_nbr++;

		if (worker_nbr >= NBR_WORKERS) {
			setTimeout(function() {
				client.close();
			}, 1000);
		}
		return;
	}

	client.send(messages[0], zmq.SNDMORE);
	client.send("", zmq.SNDMORE);
	client.send("This is the workload");

	task_nbr++;
});

client.bind("ipc://routing.ipc");
