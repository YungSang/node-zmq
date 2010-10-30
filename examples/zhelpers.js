var zmq  = require('zmq');
var util = require('utils');

exports.dump = function(buffers) {
	util.print("----------------------------------------\n");
	for (var i = 0 ; i < buffers.length ; i++) {
		var buffer = buffers[i];
		var is_text = true;
		for (var j = 0 ; j < buffer.length ; j ++) {
			if ((buffer[j] < 32) || (buffer[j] > 127)) {
				is_text = false;
			}
		}
		var length = ("00" + buffer.length).slice(-3);
		util.print("[" + length + "] ");
		for (var j = 0 ; j < buffer.length ; j ++) {
			if (is_text) {
				util.print(String.fromCharCode(buffer[j]));
			}
			else {
				var hex = ("0" + buffer[j].toString(16).toUpperCase()).slice(-2);
				util.print(hex);
			}
		}
		util.print("\n");
	}
};

exports.set_id = function(socket) {
	var hex = Math.floor( Math.random() * parseInt("100000", 16) ).toString(16);
	var identity = ("0000" + hex).toUpperCase().slice(-4);
	hex = Math.floor( Math.random() * parseInt("100000", 16) ).toString(16);
	identity += "-" + ("0000" + hex).toUpperCase().slice(-4);
	socket.setopt(zmq.IDENTITY, identity);
};
