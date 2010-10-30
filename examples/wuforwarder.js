//
//  Weather proxy device in Node.js
//
var zmq = require('zmq');

var context = new zmq.Context();

//  This is where the weather server sits
var frontend = context.socket(zmq.SUB);
frontend.connect("tcp://localhost:5556");
frontend.setopt(zmq.SUBSCRIBE, "");

//  This is our public endpoint for subscribers
var backend = context.socket(zmq.PUB);
backend.bind("tcp://*:8100");

zmq.device(zmq.FORWARDER, frontend, backend);
