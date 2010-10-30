//
//  Demonstrate identities as used by the request-reply pattern.
//  Run this program by itself.
//  It gets boring for everyone to keep repeating this code.
//
var zmq = require('zmq');

var zhelper = require('./zhelpers');

var context = new zmq.Context();

//  First allow 0MQ to set the identity
var sink = context.socket(zmq.XREP);
sink.on("recv_buf", function(messages) {
	zhelper.dump(messages);
});
sink.bind("inproc://example");

var anonymous = context.socket(zmq.REQ);
anonymous.connect("inproc://example");
anonymous.send("XREP uses a generated UUID");

var identified = context.socket(zmq.REQ);
identified.setopt(zmq.IDENTITY, "Hello");
identified.connect("inproc://example");
identified.send("XREP socket uses REQ's socket identity");
