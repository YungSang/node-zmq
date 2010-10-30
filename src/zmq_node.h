#ifndef ZMQ_NODE_H
#define ZMQ_NODE_H

#include <v8.h>
#include <node.h>

#include <zmq.hpp>
#include <zmq_utils.h>

#include <time.h>

//using namespace node;
//using namespace v8;

namespace zmq_node {

#define ZMQ_NODE_DEFINE_CONSTANT(target, symbol, constant)                      \
  (target)->Set(v8::String::NewSymbol(symbol),                                  \
                v8::Integer::New(constant),                                     \
                static_cast<v8::PropertyAttribute>(v8::ReadOnly|v8::DontDelete))

void Init (v8::Handle<v8::Object>);

v8::Handle<v8::Value> Version (const v8::Arguments &);
v8::Handle<v8::Value> Sleep (const v8::Arguments &);
v8::Handle<v8::Value> NanoSleep (const v8::Arguments &);

} // namespace zmq_node

#endif // ZMQ_NODE_H
