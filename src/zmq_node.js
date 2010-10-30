var zmq = require("./binding");

for (var key in zmq) {
	eval("exports." + key + " = zmq." + key + ";");
}

zmq.Context.prototype.socket = function(type) {
	var socket = new zmq.Socket(this, type);

	socket.on("recv", function(messages) {
		var buffers = [];
		for (var i = 0, len = messages.length ; i < len ; i++) {
			buffers[buffers.length] = new Buffer(messages[i], "binary");
		}
		this.emit("recv_buf", buffers);
	});

	return socket;
};

zmq.Socket.prototype.xsend = function(messages) {
	for (var i = 0, len = messages.length ; i < len ; i++) {
		this.send(messages[i], ((i + 1) < len) ? zmq.SNDMORE : 0);
	}
};

exports.device = function(device, insocket, outsocket) {
	switch (device) {
	case zmq.QUEUE:
		insocket.on("recv_buf", function(messages) {
			outsocket.xsend(messages);
		});
		outsocket.on("recv_buf", function(messages) {
			insocket.xsend(messages);
		});
		break;
	default:
		throw new Error("Device type not supported");
	}
};
