//
//  Weather update server in Node.js
//  Binds PUB socket to tcp://*:5556
//  Publishes random weather updates
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to client
var publisher = context.socket(zmq.PUB);

publisher.bind("tcp://*:5556");
//publisher.bind("ipc://weather.ipc");

while (1) {
	//  Get values that will fool the boss
	var zipcode     = Math.floor( Math.random() * 100000 );
	var temperature = Math.floor( Math.random() * 215 ) - 80;
	var relhumidity = Math.floor( Math.random() * 50 ) + 10;

	//  Send message to all subscribers
	zipcode = ("00000" + zipcode).slice(-5);
	var update = zipcode + " " + temperature + " " + relhumidity;
	publisher.send(update);
//	console.log("Sending update: " + update);

//	zmq.nanosleep(1);
}
