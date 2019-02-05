import json
def node_id(node):
    return id(node)

class Graph:
    def __init__(self):
        self.__nodes = {}
        self.__edges = {}

    def add(self, node):
        nid = node_id(node)
        if nid in self.__nodes:
            print('Cannot add node as already exists')
        else:
            self.__nodes[nid] = node
            self.__edges[nid] = {}

    def addV(self, source, dest, weight = 1):
        # TODO: validate weight is number
        sid = node_id(source)
        did = node_id(dest)
        self.__edges[sid][did] = weight

    def dropV(self, source, dest):
        try:
            return self.__edges[node_id(source)].pop(node_id(dest))
        except:
            print('Edge does not exist')

    def remove(self, node):
        nid = node_id(node)
        if nid not in self.__nodes:
            print('Node does not exist')
            return
        self.__nodes.pop(nid)
        self.__edges.pop(nid)
        for source_id, dests in self.__edges.items():
            for dest_id in dests:
                if dest_id is nid:
                    dropV(self, self.__nodes[source_id], node)
        return node

    def get_outgoing_edges(self, node):
        return self.__edges.get(node_id(node), {})

    def get_incoming_edges(self, node):
        n_id = node_id(node)
        ret = {}
        for source_id, out_dict in self.__edges.items():
            # if source_id == n_id:
            #     continue
            # -- do not skip own node - can have node to self
            for out_node in out_dict:
                if out_node == n_id:
                    ret[source_id] = out_dict[out_node]
        return ret

    def express_yourself(self):
        # print('--------------------------------')
        print(json.dumps({'nodes': self.__nodes, 'edges': self.__edges}, indent=2))
        print('--------------------------------')

    def inspect_node(self, node):
        n_id = node_id(node)
        print('Id:')
        print(n_id)
        print(node)
        print('outgoing edges')
        print(self.get_outgoing_edges(node))
        print('incoming edges')
        print(self.get_incoming_edges(node))
