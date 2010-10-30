//
//  Multithreaded relay in Node.js
//
var zmq  = require('zmq');

var Script = process.binding('evals').Script;

var context = new zmq.Context();

var step1_js = [
	'//  Signal downstream to step 2',
	'var sender = context.socket(zmq.PAIR);',
	'sender.connect("inproc://step2");',
	'sender.send("");',
	'sender.close();'
].join("\n");

var step2_js = [
	'//  Bind to inproc: endpoint, then start upstream thread',
	'var receiver = context.socket(zmq.PAIR);',
	'receiver.bind("inproc://step2");',

	'//  Signal downstream to step 3',
	'var sender = context.socket(zmq.PAIR);',
	'sender.connect("inproc://step3");',

	'//  Wait for signal',
	'receiver.on("recv", function(messages) {',
	'	sender.send("");',
	'	receiver.close();',
	'	sender.close();',
	'});',

	'Script.runInNewContext(step1_js, {',
	'	zmq: zmq, context: context',
	'});'
].join("\n");

var receiver = context.socket(zmq.PAIR);
receiver.bind("inproc://step3");

receiver.on("recv", function(messages) {
	console.log("Test successful!");
	receiver.close();
	context.term();
});

Script.runInNewContext(step2_js, {
	zmq: zmq, context: context, Script: Script, step1_js: step1_js
});
