function NodeStore() {
  this.getStoredNodes = function() {
    var nodes;

    if(localStorage.getItem('nodes') === null) {
      nodes = []
    } else {
      nodes = JSON.parse(localStorage.getItem('nodes'))
    }

    return nodes
  }

  this.addNode = function(node) {
    var nodes = this.getStoredNodes()

    nodes.push(node)

    localStorage.setItem('nodes', JSON.stringify(nodes))
  }

  this.saveNode = function(nodeToSave) {
    var nodes = this.getStoredNodes()

    var nodeIndex = nodes.findIndex(node => nodeToSave.id === node.id)
    nodes[nodeIndex] = nodeToSave

    localStorage.setItem('nodes', JSON.stringify(nodes))
  }

  this.removeNode = function(id) {
    var nodes = this.getStoredNodes()

    nodes.forEach((node, index) => {
      if(node.id === id) {
        nodes.splice(index, 1)
      }
    })

    localStorage.setItem('nodes', JSON.stringify(nodes))
  }

  return this
}

export var nodeStore = new NodeStore()