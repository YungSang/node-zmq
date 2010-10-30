#include "context.h"

namespace zmq_node {

// Node Extension Specific Class Methods
void
Context::Init(v8::Handle<v8::Object> target) {
	v8::HandleScope scope;

	v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

	t->InstanceTemplate()->SetInternalFieldCount(1);

	NODE_SET_PROTOTYPE_METHOD(t, "term", Term);

	target->Set(v8::String::NewSymbol("Context"), t->GetFunction());
}

v8::Handle<v8::Value>
Context::New(const v8::Arguments& args) {
	v8::HandleScope scope;

	int io_threads = 1;
	if (args.Length() > 0) {
		if (!args[0]->IsNumber()) {
			return v8::ThrowException(v8::Exception::TypeError(
				v8::String::New("First argument must be an integer")));
		}
		io_threads = (int) args[0]->ToInteger()->Value();
	}

	Context *sw = new Context(io_threads);
	sw->Wrap(args.This());
	return args.This();
}

v8::Handle<v8::Value>
Context::Term(const v8::Arguments& args) {
	v8::HandleScope scope;
	Context *context = node::ObjectWrap::Unwrap<Context>(args.This());
	context->Term();
	return v8::Undefined();
}

// Regular Class Methods for ZMQ
Context::Context(int io_threads) {
	context_ = new zmq::context_t(io_threads);
}

Context::~Context () {
	Term();
	assert(context_ == NULL);
}

void
Context::Term() {
	if (context_) {
		delete context_;
		context_ = NULL;
	}
}

zmq::context_t *
Context::getZMQContext() {
	return context_;
}

} // namespace zmq_node
