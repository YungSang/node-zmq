#include "socket.h"
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

	Context *context = new Context(io_threads);
	context->Wrap(args.This());
	context->Ref();
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
	ev_idle_init(&zmq_watcher_, DoZMQPoll);
	zmq_watcher_.data = this;
}

Context::~Context () {
	Term();
	assert(context_ == NULL);
}

void
Context::Term() {
	if (context_) {
		std::list<Socket *>::iterator s;
		for (s = sockets_.begin(); s != sockets_.end(); s++) {
			(*s)->Close();
		}
		delete context_;
		context_ = NULL;
		Unref();
	}
}

zmq::context_t *
Context::getZMQContext() {
	return context_;
}

void
Context::addSocket(Socket *socket) {
	sockets_.push_back(socket);
	if (!ev_is_active(&zmq_watcher_)) {
		ev_idle_start(EV_DEFAULT_UC_ &zmq_watcher_);
	}
}

void
Context::removeSocket(Socket *socket) {
	sockets_.remove(socket);
	if (sockets_.empty()) {
		ev_idle_stop(EV_DEFAULT_UC_ &zmq_watcher_);
	}
}

void
Context::DoZMQPoll(EV_P_ ev_idle *watcher, int revents) {
	std::list<Socket *>::iterator s;
	Context *context = static_cast<Context*>(watcher->data);

	int i;

	zmq_pollitem_t *pollers = (zmq_pollitem_t *)
		malloc(context->sockets_.size() * sizeof(zmq_pollitem_t));

	for (i = 0, s = context->sockets_.begin(); s != context->sockets_.end(); i++, s++) {
		pollers[i].socket  = *((*s)->getZMQSocket());
		pollers[i].fd      = 0;
		pollers[i].events  = ZMQ_POLLIN;
		pollers[i].revents = 0;
	}

	zmq::poll(pollers, context->sockets_.size(), 1000);

	for (i = 0, s = context->sockets_.begin(); s != context->sockets_.end(); i++, s++) {
		(*s)->AfterZMQPoll(pollers[i].revents);
	}

	free(pollers);
}

} // namespace zmq_node
