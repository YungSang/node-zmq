APPNAME = 'zmq_node'
VERSION = '0.3.0'

srcdir = '.'
blddir = 'build'

def set_options(opt):
	opt.tool_options("compiler_cxx")

def configure(conf):
	conf.check_tool("compiler_cxx")
	conf.check_tool("node_addon")

def build(bld):

	obj = bld.new_task_gen("cxx", "shlib", "node_addon")
	obj.cxxflags = ["-Wall", "-Werror"]
	obj.target = "binding"
	obj.source = ["src/zmq_node.cc", "src/stopwatch.cc", "src/context.cc", "src/socket.cc"]
	obj.lib = ["zmq"]
	obj.install_path = "${NODE_PATH}/zmq"

	bld(rule='cp ${SRC} ${TGT}', source='src/zmq_node.js', target='index.js', install_path='${NODE_PATH}/zmq')
