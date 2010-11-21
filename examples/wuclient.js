//
//  Weather update client in Node.js
//  Connects SUB socket to tcp://localhost:5556
//  Collects weather updates and finds avg temp in zipcode
//
var zmq = require('zmq');

var context = new zmq.Context();

//  Socket to talk to server
var subscriber = context.socket(zmq.SUB);

//  Process 100 updates
var update_nbr = 0;
var total_temp = 0;

subscriber.on("recv", function(messages) {
	console.log("Received reply: [" + update_nbr + "]: " + messages[0]);

	var data = messages[0].split(" ");
	total_temp += parseInt(data[1]);
	update_nbr++;
	if (update_nbr >= 100) {
		console.log("Average temperature for zipcode '" + filter + "' was " + Math.floor(total_temp / update_nbr) + "F");
		subscriber.close();
		context.term();
	}
});

subscriber.connect("tcp://localhost:5556");

//  Subscribe to zipcode, default is NYC, 10001
var filter = (process.argv.length > 2) ? process.argv[2] : "10001 ";
subscriber.setopt(zmq.SUBSCRIBE, filter);
console.log("Collecting updates from weather server...");
