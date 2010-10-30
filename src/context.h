#ifndef ZMQ_CONTEXT_H
#define ZMQ_CONTEXT_H

#include <v8.h>
#include <node.h>

#include <zmq.hpp>

#include "socket.h"

//using namespace node;
using namespace v8;

namespace zmq_node {

class Context : public node::ObjectWrap {
private:
	zmq::context_t *context_;

// Node Extension Specific Class Methods
public:
	static void Init (v8::Handle<v8::Object>);

private:
	static v8::Handle<v8::Value> New (const v8::Arguments &);
	static v8::Handle<v8::Value> Term (const v8::Arguments &);

// Regular Class Methods for ZMQ
	Context(int);
	~Context();

	void Term();

public:
	zmq::context_t *getZMQContext();
};

} // namespace zmq_node

#endif // ZMQ_CONTEXT_H
