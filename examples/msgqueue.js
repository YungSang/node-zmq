//
//  Simple message queuing broker in Node.js
//  Same as request-reply broker but using QUEUE device
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket facing clients
var frontend = context.socket(zmq.XREP);
frontend.bind("tcp://*:5559");

//  Socket facing services
var backend = context.socket(zmq.XREQ);
backend.bind("tcp://*:5560");

zmq.device(zmq.QUEUE, frontend, backend);
