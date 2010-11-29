#ifndef ZMQ_SOCKET_H
#define ZMQ_SOCKET_H

#include <v8.h>
#include <node.h>
#include <node_events.h>
#include <node_buffer.h>

#include <zmq.hpp>

//using namespace node;
using namespace v8;

namespace zmq_node {

class Context;

class Socket : public node::EventEmitter {
private:
	Context       *context_;
	zmq::socket_t *socket_;
	int            type_;

// Node Extension Specific Class Methods
public:
	static void Init (v8::Handle<v8::Object>);

private:
	static v8::Handle<v8::Value> New (const v8::Arguments &);
	static v8::Handle<v8::Value> Close (const v8::Arguments &);
	static v8::Handle<v8::Value> Connect (const v8::Arguments &);
	static v8::Handle<v8::Value> Bind (const v8::Arguments &);
	static v8::Handle<v8::Value> Send (const v8::Arguments &);
	static v8::Handle<v8::Value> SetOption (const v8::Arguments &);
	static v8::Handle<v8::Value> GetOption (const v8::Arguments &);

// Regular Class Methods for ZMQ
	Socket(Context *, int);
	~Socket();

	void Connect(const char *);
	void Bind(const char *);
	bool Send(char *, int, int);
	void SetOption(int, const void *, size_t);
	void SetOption(int, void *, size_t *);

public:
	void Close();

	void AfterZMQPoll(int);

	zmq::socket_t *getZMQSocket();
};

} // namespace zmq_node

#endif // ZMQ_SOCKET_H
