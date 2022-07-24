function Dom() {

  this.clearLineDistance = function() {

  }

  this.renderNodeAlphabet = function(nodes) {
    // clear node alphabet on canvas
    for(var input of document.querySelectorAll(".node-alpha")) input.remove()

    nodes.forEach((node, index) => {
      var alpha = getAlphaFromIndex(index)
      // canvas elems
      var elem = document.createElement('div')
      elem.classList.add('node-alpha')
      elem.classList.add('absolute')
      elem.style.top = node.y + 10 + 'px'
      elem.style.left = node.x + 5 + 'px'
      elem.innerText = alpha
      document.body.appendChild(elem)
    })
  }

  this.renderDataDisplay = function(lines, nodes, ctx) {
    // clear line distance
    for(var input of document.querySelectorAll(".line-distance")) input.remove()

    var lineElements = []

    lines.forEach((line, index) => {
      // calculate distance of line
      var distance = Math.floor(Math.hypot(line.point1.x - line.point2.x, line.point1.y - line.point2.y))
      // get nodes in line alphebetized 
      var nodesInLine = nodes.filter(node => ctx.isPointInPath(node.path, line.point1.x, line.point1.y) || ctx.isPointInPath(node.path, line.point2.x, line.point2.y))
      var firstNodeAlpha = getAlphaFromIndex(nodes.indexOf(nodesInLine[0]))
      var secondNodeAlpha = getAlphaFromIndex(nodes.indexOf(nodesInLine[1]))
      var nodesAlphabetized = [firstNodeAlpha, secondNodeAlpha].sort()
      // create dom element
      var elem = document.createElement('div')
      elem.classList.add('line-distance')
      elem.accessKey = nodesAlphabetized[0] + nodesAlphabetized[1]
      elem.innerText = `${nodesAlphabetized[0]} → ${nodesAlphabetized[1]} = ${distance}`
      lineElements.push(elem)
    })  
    // sort alphabetically
    lineElements.sort(function(a, b){
      if(a.accessKey < b.accessKey) { return -1; }
      if(a.accessKey > b.accessKey) { return 1; }
      return 0;
    })
    // render
    lineElements.forEach(elem => document.getElementById('lines').appendChild(elem))
  }

  return this
}

// ############# UTILITIES

function getAlphaFromIndex(index) {
  return String.fromCharCode((index + 1) + 64)
}

export var dom = new Dom()