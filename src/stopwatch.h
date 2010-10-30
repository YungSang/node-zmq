#ifndef ZMQ_STOPWATCH_H
#define ZMQ_STOPWATCH_H

#include <v8.h>
#include <node.h>

#include <zmq.hpp>
#include <zmq_utils.h>

//using namespace node;
using namespace v8;

namespace zmq_node {

class Stopwatch : public node::ObjectWrap {
private:
	void *watch_;

// Node Extension Specific Class Methods
public:
	static void Init (v8::Handle<v8::Object>);

private:
	static v8::Handle<v8::Value> New (const v8::Arguments &);
	static v8::Handle<v8::Value> Start (const v8::Arguments &);
	static v8::Handle<v8::Value> Stop (const v8::Arguments &);

// Regular Class Methods for ZMQ
	Stopwatch();
	~Stopwatch();

	void Start();
	unsigned long Stop();
};

} // namespace zmq_node

#endif // ZMQ_STOPWATCH_H
