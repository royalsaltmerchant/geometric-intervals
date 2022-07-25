var width = window.innerHeight
var height = window.innerHeight


function Dom() {
  this.tonic = 1000
  this.octave = 1

  this.renderTonic = function() {
    var elem = document.getElementById('tonic')
    var input = document.createElement('input')
    input.value = this.tonic
    input.type = "number"
    input.min = '0'
    input.max = '40000'
    input.addEventListener('change', (e) => {
      dom.tonic = parseInt(e.target.value)
      update()
    })

    elem.appendChild(input)
  }

  this.renderOctave = function() {
    var elem = document.getElementById('octave')
    var input = document.createElement('input')
    input.value = this.octave
    input.type = "number"
    input.min = '1'
    input.max = '10'
    input.addEventListener('change', (e) => {
      dom.octave = parseInt(e.target.value)
      update()
    })

    elem.appendChild(input)
  }

  this.renderNodeAlphabet = function(nodes) {
    // clear node alphabet on canvas
    for(var nodeAlpha of document.querySelectorAll(".node-alpha")) nodeAlpha.remove()
    for(var nodePosition of document.querySelectorAll(".node-position")) nodePosition.remove()

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
      // data node position
      var normalNodePosition = getNormalizedNodePosition(node.x, node.y)

      var elemData = document.createElement('div')
      elemData.classList.add('node-position')
      
      var inputXTitle = document.createElement('p')
      inputXTitle.innerText = `${alpha}: x-coord =`
      elemData.appendChild(inputXTitle)

      var inputX = document.createElement('input')
      inputX.type = "number"
      inputX.min = "-9999"
      inputX.max = "9999"
      inputX.value = normalNodePosition.x
      inputX.addEventListener('blur', (e) => {inputX.focus()})
      inputX.addEventListener('change', (e) => {
        var newValue = parseInt(e.target.value)
        var x = newValue + (width / 2)
        node.setCoords({x})

        update()
      })
      elemData.appendChild(inputX)

      var inputYTitle = document.createElement('p')
      inputYTitle.innerText = 'y-coord ='
      elemData.appendChild(inputYTitle)

      var inputY = document.createElement('input')
      inputY.type = "number"
      inputY.min = "-9999"
      inputY.max = "9999"
      inputY.value = normalNodePosition.y
      inputY.addEventListener('blur', (e) => {inputY.focus()})
      inputY.addEventListener('change', (e) => {
        var newValue = parseInt(e.target.value)
        var y = newValue + (height / 2)
        node.setCoords({y})

        update()
      })
      elemData.appendChild(inputY)
      
      document.getElementById('nodes').appendChild(elemData)
    })
  }

  this.renderLineData = function(lines, nodes, ctx) {
    // clear line lengths
    for(var input of document.querySelectorAll(".line-length")) input.remove()
    // clear line relationships
    for(var input of document.querySelectorAll(".line-relationship")) input.remove()

    var lineElements = []
    var lineLengths = []

    lines.forEach((line, index) => {
      // calculate length of line
      var length = Math.floor(Math.hypot(line.node1.x - line.node2.x, line.node1.y - line.node2.y))
      // get nodes in line alphebetized 
      var nodesInLine = nodes.filter(node => ctx.isPointInPath(node.path, line.node1.x, line.node1.y) || ctx.isPointInPath(node.path, line.node2.x, line.node2.y))
      var firstNodeAlpha = getAlphaFromIndex(nodes.indexOf(nodesInLine[0]))
      var secondNodeAlpha = getAlphaFromIndex(nodes.indexOf(nodesInLine[1]))
      var nodesAlphabetized = [firstNodeAlpha, secondNodeAlpha].sort()
      // create dom element
      var elem = document.createElement('div')
      elem.classList.add('line-length')
      elem.accessKey = nodesAlphabetized[0] + nodesAlphabetized[1]
      elem.innerText = `${nodesAlphabetized[0]} → ${nodesAlphabetized[1]} = ${length}`
      lineElements.push(elem)
      lineLengths.push({node1: nodesAlphabetized[0], node2: nodesAlphabetized[1], length: length})
    })  
    // sort alphabetically
    lineElements.sort(function(a, b){
      if(a.accessKey < b.accessKey) { return -1; }
      if(a.accessKey > b.accessKey) { return 1; }
      return 0;
    })
    // render line lengths
    lineElements.forEach(elem => document.getElementById('lengths').appendChild(elem))

    var lineRelationships = []
    // Line relationships
    lineLengths.forEach(firstLength => {
      lineLengths.forEach(secondLength => {
        if(firstLength === secondLength) return
        else {
          if(firstLength.length > secondLength.length) {
            var firstDividedBySecond = (firstLength.length / secondLength.length).toFixed(2)
            while((firstDividedBySecond * dom.tonic) > dom.tonic * (this.octave + 1)) firstDividedBySecond /= 2
            var elem = document.createElement('div')
            elem.classList.add('line-relationship')
            elem.accessKey = firstDividedBySecond
            elem.innerText = `
              ${firstLength.node1}-${firstLength.node2} / ${secondLength.node1}-${secondLength.node2} = ${firstDividedBySecond} (${(firstDividedBySecond * dom.tonic).toFixed(2)}hz)
            `
            lineRelationships.push(elem)
          }
        }
      })
    })

    lineRelationships.sort((a, b) => a.accessKey - b.accessKey)
    lineRelationships.forEach(elem => {
      document.getElementById('relationships').appendChild(elem)
    })
  }

  this.renderTonic()
  this.renderOctave()
  return this
}

// ############# UTILITIES

function getAlphaFromIndex(index) {
  return String.fromCharCode((index + 1) + 64)
}

function getNormalizedNodePosition(x, y) {
  x -= (width / 2)
  y -= (height / 2)

  return {x, y}
}

export var dom = new Dom()