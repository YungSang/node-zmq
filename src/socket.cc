#include "socket.h"
#include "context.h"

namespace zmq_node {

static Persistent<String> receive_symbol;

// Node Extension Specific Class Methods
void
Socket::Init(v8::Handle<v8::Object> target) {
	v8::HandleScope scope;

	v8::Local<v8::FunctionTemplate> t = v8::FunctionTemplate::New(New);

	t->Inherit(node::EventEmitter::constructor_template);
	t->InstanceTemplate()->SetInternalFieldCount(1);

	receive_symbol = NODE_PSYMBOL("recv");

	NODE_SET_PROTOTYPE_METHOD(t, "close",   Close);
	NODE_SET_PROTOTYPE_METHOD(t, "connect", Connect);
	NODE_SET_PROTOTYPE_METHOD(t, "bind",    Bind);
	NODE_SET_PROTOTYPE_METHOD(t, "send",    Send);
	NODE_SET_PROTOTYPE_METHOD(t, "setopt",  SetOption);
	NODE_SET_PROTOTYPE_METHOD(t, "getopt",  GetOption);

	target->Set(v8::String::NewSymbol("Socket"), t->GetFunction());
}

v8::Handle<v8::Value>
Socket::New(const v8::Arguments& args) {
	v8::HandleScope scope;

	if (args.Length() < 2) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass a context and a type to constructor")));
	}

	if (!args[0]->IsObject()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a context")));
	}
	Context *context = node::ObjectWrap::Unwrap<Context>(args[0]->ToObject());

	if (!args[1]->IsNumber()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("Second argument must be an integer")));
	}
	int type = (int) args[1]->ToInteger()->Value();

	Socket *socket = new Socket(context, type);
	socket->Wrap(args.This());
	socket->Ref();
	return args.This();
}

Handle<Value>
Socket::Close (const v8::Arguments &args) {
	v8::HandleScope scope;
	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());
	socket->Close();
	return v8::Undefined();
}

Handle<Value>
Socket::Connect (const v8::Arguments &args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass an address")));
	}
	if (!args[0]->IsString()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a string!")));
	}
	v8::String::Utf8Value address(args[0]->ToString());

	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());
	socket->Connect(*address);
	return v8::Undefined();
}

Handle<Value>
Socket::Bind (const v8::Arguments &args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass an address")));
	}
	if (!args[0]->IsString()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a string!")));
	}
	v8::String::Utf8Value address(args[0]->ToString());

	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());
	socket->Bind(*address);
	return v8::Undefined();
}

Handle<Value>
Socket::Send (const v8::Arguments &args) {
	v8::HandleScope scope;

	bool rc = false;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass a string or a buffer to send")));
	}

	int flags = 0;
	if (args.Length() > 1) {
		if (!args[1]->IsNumber()) {
			return v8::ThrowException(v8::Exception::TypeError(
				v8::String::New("Second argument must be an integer")));
		}
		flags = (int) args[1]->ToInteger()->Value();
	}

	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());

	if (args[0]->IsString()) {
		v8::String::Utf8Value *message = new v8::String::Utf8Value(args[0]);
		rc = socket->Send(**message, message->length(), flags);
	}
	else if (node::Buffer::HasInstance(args[0])) {
		node::Buffer *buffer = node::ObjectWrap::Unwrap<node::Buffer>(args[0]->ToObject());
		rc = socket->Send(buffer->data(), buffer->length(), flags);
	}
	else {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a string or a buffer")));
	}

	return v8::Boolean::New(rc);
}

Handle<Value>
Socket::SetOption (const v8::Arguments &args) {
	v8::HandleScope scope;

	if (args.Length() < 2) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass a option and a value to set")));
	}

	if (!args[0]->IsNumber()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a option(integer)")));
	}
	int option = (int) args[0]->ToInteger()->Value();

	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());
	zmq::socket_t *socket_ = socket->getZMQSocket();

	v8::String::Utf8Value *strValue;
	uint64_t intValue = 0;

	switch (option) {
	case ZMQ_IDENTITY:
	case ZMQ_SUBSCRIBE:
	case ZMQ_UNSUBSCRIBE:
		if (!args[1]->IsString()) {
			return v8::ThrowException(v8::Exception::TypeError(
				v8::String::New("Second argument must be a string!")));
		}
		strValue = new v8::String::Utf8Value(args[1]->ToString());
		socket_->setsockopt(option, **strValue, strValue->length());
		break;
	case ZMQ_HWM:
	case ZMQ_SWAP:
	case ZMQ_AFFINITY:
	case ZMQ_RATE:
	case ZMQ_RECOVERY_IVL:
	case ZMQ_MCAST_LOOP:
	case ZMQ_SNDBUF:
	case ZMQ_RCVBUF:
	case ZMQ_RCVMORE:
		if (!args[1]->IsNumber()) {
			return v8::ThrowException(v8::Exception::TypeError(
				v8::String::New("Second argument must be a integer")));
		}
		intValue = (uint64_t)args[1]->ToInteger()->Value();
		socket_->setsockopt(option, &intValue, sizeof(intValue));
		break;
	default:
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("First argument must be a defined option")));
	}

	return v8::Undefined();
}

Handle<Value>
Socket::GetOption (const v8::Arguments &args) {
	v8::HandleScope scope;

	if (args.Length() < 1) {
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("Must pass a option to get")));
	}

	if (!args[0]->IsNumber()) {
		return v8::ThrowException(v8::Exception::TypeError(
			v8::String::New("First argument must be a option(integer)")));
	}
	int option = (int) args[0]->ToInteger()->Value();

	Socket *socket = node::ObjectWrap::Unwrap<Socket>(args.This());
	zmq::socket_t *socket_ = socket->getZMQSocket();

	char strValue[256] = {0};
	size_t len = 255;
	uint64_t intValue = 0;

	switch (option) {
	case ZMQ_IDENTITY:
		socket_->getsockopt(option, strValue, &len);
		return v8::String::New(strValue);
		break;
	case ZMQ_HWM:
	case ZMQ_SWAP:
	case ZMQ_AFFINITY:
	case ZMQ_RATE:
	case ZMQ_RECOVERY_IVL :
	case ZMQ_MCAST_LOOP:
	case ZMQ_SNDBUF:
	case ZMQ_RCVBUF:
	case ZMQ_RCVMORE:
		len = sizeof(intValue);
		socket_->getsockopt(option, &intValue, &len);
		return v8::Integer::New(intValue);
		break;
	default:
		return v8::ThrowException(v8::Exception::Error(
			v8::String::New("First argument must be a defined option")));
	}

	return v8::Undefined();
}

// Regular Class Methods for ZMQ
Socket::Socket (Context *context, int type) : node::EventEmitter () {
	context_ = context;
	type_    = type;
	socket_  = new zmq::socket_t(*(context->getZMQContext()), type);
}

Socket::~Socket () {
	Close();
	assert(socket_ == NULL);
}

void
Socket::Close() {
	if (socket_) {
		if ((type_ != ZMQ_PUB) && (type_ != ZMQ_PUSH)) {
			context_->removeSocket(this);
		}
		delete socket_;
		socket_ = NULL;
		Unref();
	}
}

void
Socket::Connect(const char *address) {
	socket_->connect(address);
	if ((type_ != ZMQ_PUB) && (type_ != ZMQ_PUSH)) {
		context_->addSocket(this);
	}
}

void
Socket::Bind(const char *address) {
	socket_->bind(address);
	if ((type_ != ZMQ_PUB) && (type_ != ZMQ_PUSH)) {
		context_->addSocket(this);
	}
}

bool
Socket::Send(char *message, int length, int flags) {
	zmq::message_t *msg_ = new zmq::message_t(length);

	memcpy((void *)(msg_->data()), message, length);

	return socket_->send(*msg_, flags | ZMQ_NOBLOCK);
}

zmq::socket_t *
Socket::getZMQSocket() {
	return socket_;
}

void
Socket::AfterZMQPoll(int revents) {
	if (revents & ZMQ_POLLIN) {
		Local<Array> messages = Array::New();

		int     i;
		int64_t more = 1;
		size_t  more_size = sizeof (more);

		zmq::message_t *msg_ = new zmq::message_t();

		for (i = 0 ; more && socket_->recv(msg_, ZMQ_NOBLOCK) ; i++) {
			v8::Local<v8::Value> value = node::Encode(msg_->data(), msg_->size(), node::BINARY);
			messages->Set(Integer::New(i), value);

			socket_->getsockopt(ZMQ_RCVMORE, &more, &more_size);

			delete msg_;
			msg_ = new zmq::message_t();
		}

		delete msg_;

		if (i > 0) {
			Local<Value> argv[] = {messages};
			Emit(receive_symbol, 1, argv);
		}
	}
}

} // namespace zmq_node
