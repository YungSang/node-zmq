//
//  Multithreaded Hello World server in Node.js
//
var zmq = require('zmq');
var Script = process.binding('evals').Script;

var context = new zmq.Context();

//  Socket to talk to clients
var clients = context.socket(zmq.XREP);
clients.bind("tcp://*:5555");

//  Socket to talk to workers
var workers = context.socket(zmq.XREQ);
workers.bind("inproc://workers");

var worker_js = [
	'//  Socket to talk to clients',
	'var receiver = context.socket(zmq.REP);',
	'receiver.on("recv", function(messages) {',
	'	console.log("Received request: [" + identity + "]: " + messages[0]);',

	'	//  Do the work',
	'	zmq.sleep(1);',

	'	//  Send results to sink',
	'	receiver.send("World");',
	'});',
	'receiver.connect("inproc://workers");'
].join("\n");
var worker_routine = new Script(worker_js);

//  Connect work threads to client threads via a queue
zmq.device(zmq.QUEUE, clients, workers);

for (var i = 0 ; i < 5 ; i++) {
	worker_routine.runInNewContext({
		console: console, zmq: zmq, context: context, identity: i
	});	
}