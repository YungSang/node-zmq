#include "stopwatch.h"

namespace zmq_node {

// Node Extension Specific Class Methods
void
Stopwatch::Init(v8::Handle<v8::Object> target) {
	v8::HandleScope scope;

	v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

	t->InstanceTemplate()->SetInternalFieldCount(1);

	NODE_SET_PROTOTYPE_METHOD(t, "start", Start);
	NODE_SET_PROTOTYPE_METHOD(t, "stop", Stop);

	target->Set(v8::String::NewSymbol("Stopwatch"), t->GetFunction());
}

v8::Handle<v8::Value>
Stopwatch::New(const v8::Arguments& args) {
	v8::HandleScope scope;
	Stopwatch *sw = new Stopwatch();
	sw->Wrap(args.This());
	return args.This();
}

v8::Handle<v8::Value>
Stopwatch::Start(const v8::Arguments& args) {
	v8::HandleScope scope;
	Stopwatch *sw = ObjectWrap::Unwrap<Stopwatch>(args.This());
	sw->Start();
	return v8::Undefined();
}

v8::Handle<v8::Value>
Stopwatch::Stop(const v8::Arguments& args) {
	v8::HandleScope scope;
	Stopwatch *sw = ObjectWrap::Unwrap<Stopwatch>(args.This());
	unsigned long time = sw->Stop();
	return v8::Uint32::New(time);
}

// Regular Class Methods for ZMQ
Stopwatch::Stopwatch() {
	watch_ = NULL;
}

Stopwatch::~Stopwatch () {
	Stop();
	assert(watch_ == NULL);
}

void
Stopwatch::Start() {
	if (watch_ == NULL) {
		Ref();
		watch_ = zmq_stopwatch_start();
	}
	else {
		v8::ThrowException(v8::Exception::Error(
			v8::String::New("Stopwatch is already runing.")));
	}
}

unsigned long
Stopwatch::Stop() {
	unsigned long time = 0;
	if (watch_) {
		time = zmq_stopwatch_stop(watch_);
		watch_ = NULL;
		Unref();
	}
	return time;
}

} // namespace zmq_node
