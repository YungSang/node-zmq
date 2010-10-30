//
//  Simple request-reply broker in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket facing clients
var frontend = context.socket(zmq.XREP);
frontend.on("recv_buf", function(messages) {
	backend.xsend(messages);
});
frontend.bind("tcp://*:5559");

//  Socket facing services
var backend = context.socket(zmq.XREQ);
backend.on("recv_buf", function(messages) {
	frontend.xsend(messages);
});
backend.bind("tcp://*:5560");
