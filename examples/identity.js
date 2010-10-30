//
//  Demonstrate identities as used by the request-reply pattern.
//  Run this program by itself.
//  It gets boring for everyone to keep repeating this code.
//
var zmq  = require('zmq');
var util = require('utils');

function dump(buffer) {
	var is_text = true;
	for (var i = 0, len = buffer.length ; i < len ; i ++) {
		if ((buffer[i] < 32) || (buffer[i] > 127)) {
			is_text = false;
		}
	}
	var length = ("00" + buffer.length).slice(-3);
	util.print("[" + length + "] ");
	for (var i = 0, len = buffer.length ; i < len ; i ++) {
		if (is_text) {
			util.print(String.fromCharCode(buffer[i]));
		}
		else {
			var hex = ("0" + buffer[i].toString(16).toUpperCase()).slice(-2);
			util.print(hex);
		}
	}
	util.print("\n");
}

var context = new zmq.Context();

//  First allow 0MQ to set the identity
var sink = context.socket(zmq.XREP);
sink.on("recv_buf", function(messages) {
	console.log("----------------------------------------");
	for (var i = 0, len = messages.length ; i < len ; i++) {
		dump(messages[i]);
	}
});
sink.bind("inproc://example");

var anonymous = context.socket(zmq.REQ);
anonymous.connect("inproc://example");
anonymous.send("XREP uses a generated UUID");

var identified = context.socket(zmq.REQ);
identified.setopt(zmq.IDENTITY, "Hello");
identified.connect("inproc://example");
identified.send("XREP socket uses REQ's socket identity");
