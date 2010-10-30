#include "zmq_node.h"

namespace zmq_node {

void
Init(v8::Handle<v8::Object> target) {
	v8::HandleScope scope;

	NODE_SET_METHOD(target, "version",   Version);
	NODE_SET_METHOD(target, "sleep",     Sleep);
	NODE_SET_METHOD(target, "nanosleep", NanoSleep);

// Socket types
	ZMQ_NODE_DEFINE_CONSTANT(target, "PAIR",       ZMQ_PAIR);
	ZMQ_NODE_DEFINE_CONSTANT(target, "PUB",        ZMQ_PUB);
	ZMQ_NODE_DEFINE_CONSTANT(target, "SUB",        ZMQ_SUB);
	ZMQ_NODE_DEFINE_CONSTANT(target, "REQ",        ZMQ_REQ);
	ZMQ_NODE_DEFINE_CONSTANT(target, "REP",        ZMQ_REP);
	ZMQ_NODE_DEFINE_CONSTANT(target, "XREQ",       ZMQ_XREQ);
	ZMQ_NODE_DEFINE_CONSTANT(target, "XREP",       ZMQ_XREP);
	ZMQ_NODE_DEFINE_CONSTANT(target, "PULL",       ZMQ_PULL);
	ZMQ_NODE_DEFINE_CONSTANT(target, "PUSH",       ZMQ_PUSH);
	ZMQ_NODE_DEFINE_CONSTANT(target, "UPSTREAM",   ZMQ_UPSTREAM);
	ZMQ_NODE_DEFINE_CONSTANT(target, "DOWNSTREAM", ZMQ_DOWNSTREAM);

// Socket options
	ZMQ_NODE_DEFINE_CONSTANT(target, "HWM",          ZMQ_HWM);
	ZMQ_NODE_DEFINE_CONSTANT(target, "SWAP",         ZMQ_SWAP);
	ZMQ_NODE_DEFINE_CONSTANT(target, "AFFINITY",     ZMQ_AFFINITY);
	ZMQ_NODE_DEFINE_CONSTANT(target, "IDENTITY",     ZMQ_IDENTITY);
	ZMQ_NODE_DEFINE_CONSTANT(target, "SUBSCRIBE",    ZMQ_SUBSCRIBE);
	ZMQ_NODE_DEFINE_CONSTANT(target, "UNSUBSCRIBE",  ZMQ_UNSUBSCRIBE);
	ZMQ_NODE_DEFINE_CONSTANT(target, "RATE",         ZMQ_RATE);
	ZMQ_NODE_DEFINE_CONSTANT(target, "RECOVERY_IVL", ZMQ_RECOVERY_IVL);
	ZMQ_NODE_DEFINE_CONSTANT(target, "MCAST_LOOP",   ZMQ_MCAST_LOOP);
	ZMQ_NODE_DEFINE_CONSTANT(target, "SNDBUF",       ZMQ_SNDBUF);
	ZMQ_NODE_DEFINE_CONSTANT(target, "RCVBUF",       ZMQ_RCVBUF);
	ZMQ_NODE_DEFINE_CONSTANT(target, "RCVMORE",      ZMQ_RCVMORE);

// Send/recv options
	ZMQ_NODE_DEFINE_CONSTANT(target, "NOBLOCK", ZMQ_NOBLOCK);
	ZMQ_NODE_DEFINE_CONSTANT(target, "SNDMORE", ZMQ_SNDMORE);

// Poll events
	ZMQ_NODE_DEFINE_CONSTANT(target, "POLLIN",  ZMQ_POLLIN);
	ZMQ_NODE_DEFINE_CONSTANT(target, "POLLOUT", ZMQ_POLLOUT);
	ZMQ_NODE_DEFINE_CONSTANT(target, "POLLERR", ZMQ_POLLERR);

// Device types
	ZMQ_NODE_DEFINE_CONSTANT(target, "STREAMER",  ZMQ_STREAMER);
	ZMQ_NODE_DEFINE_CONSTANT(target, "FORWARDER", ZMQ_FORWARDER);
	ZMQ_NODE_DEFINE_CONSTANT(target, "QUEUE",     ZMQ_QUEUE);
}

v8::Handle<v8::Value>
Version(const v8::Arguments& args) {
	v8::HandleScope scope;

	int major, minor, patch;
	char version[10];
	
	zmq_version(&major, &minor, &patch);

	sprintf(version, "%d.%d.%d", major, minor, patch);

	return v8::String::New(version);
}

v8::Handle<v8::Value>
Sleep(const v8::Arguments& args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass the number of seconds to sleep")));
	}

	if (!args[0]->IsNumber()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be an integer")));
	}
	int seconds = (int) args[0]->ToInteger()->Value();

	zmq_sleep(seconds);

	return v8::Undefined();
}

v8::Handle<v8::Value>
NanoSleep(const v8::Arguments& args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass the number of nanoseconds to sleep")));
	}

	if (!args[0]->IsNumber()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be an integer")));
	}
	int nanoSeconds = (int) args[0]->ToInteger()->Value();

	struct timespec t;
	t.tv_sec  = (int)(nanoSeconds / 1000000000);
	t.tv_nsec = nanoSeconds % 1000000000;

	nanosleep(&t, NULL);

	return v8::Undefined();
}

} // namespace zmq_node

#include "stopwatch.h"
#include "context.h"
#include "socket.h"

extern "C" {
	void init (v8::Handle<v8::Object> target) {
		v8::HandleScope scope;

		zmq_node::Init(target);
		zmq_node::Stopwatch::Init(target);
		zmq_node::Context::Init(target);
		zmq_node::Socket::Init(target);
	}
}
