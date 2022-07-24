import {nodeStore} from './store.js'
import {dom} from './dom.js'

// setup
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext('2d');
var width = window.innerHeight;
var height = window.innerHeight;
canvas.width  = width;
canvas.height = height;
var canvasRect = canvas.getBoundingClientRect()
var canvasOffset = { 
  top: canvasRect.top + window.scrollY, 
  left: canvasRect.left + window.scrollX, 
};
var offsetX = canvasOffset.left;
var offsetY = canvasOffset.top;
// lists
var grids = []
var nodes = []
var lines = []
var activeNodes = []

function update() {
  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  clearCanvas()

  drawAllGrids()
  drawAllNodes()
  drawAllLines()
  dom.renderNodeAlphabet(nodes)
  dom.renderDataDisplay(lines, nodes, ctx)
}

// ############## grids
function Grid(props) {
  this.path1 = new Path2D
  this.path2 = new Path2D
  this.step = props.step
  this.color = props.color
  this.lineWidth = props.lineWidth

  return this
}

function drawGrid(grid) {
  var {path1, path2, step, color, lineWidth} = grid
  for (var x=0;x<=width;x+=step) {
    path1.moveTo(x, 0);
    path1.lineTo(x, height);
  }
  // set the color of the line
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.stroke(path1);

  for (var y=0;y<=height;y+=step) {
    path2.moveTo(0, y);
    path2.lineTo(width, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.stroke(path2); 
};

function drawAllGrids() {
  grids.forEach(grid => {
    drawGrid(grid)
  })
}

// ############### nodes

function Node(props) {
  this.id = props.id
  this.path = props.path
  this.x = props.x
  this.y = props.y 
  this.color = props.color

  return this
}

function newNode(x, y, color='black') {
  var path = new Path2D(); 
  var node = new Node({id: uuid.v4(), path, x, y, color: color})

  nodes.push(node)

  update()
  // saveNode(node)
}

function drawNode(node) {
  node.path = new Path2D()
  node.path.arc(node.x, node.y, 10, 0, 2 * Math.PI, false)
  ctx.fillStyle = node.color
  ctx.fill(node.path)
}

function drawAllNodes() {
  nodes.forEach(node => {
    drawNode(node)
  })
}

function resetActiveNodes() {
  activeNodes = []
}

function removeNode(node) {
  nodes.splice(nodes.indexOf(node), 1)
  resetActiveNodes()
  // nodeStore.removeNode(node.id)
  // remove lines attached to nodes
  removeLinesConnectedToNode(node)

  dom.renderNodeAlphabet(nodes)
  update()
}

function saveNode(node) {
  var newNode = {id: node.id, x: node.x, y:node.y, color: node.color}
  var nodes = nodeStore.getStoredNodes()
  var isAlreadyNode = nodes.some(node => node.id === newNode.id)
  if(!isAlreadyNode) nodeStore.addNode(newNode)
  else nodeStore.saveNode(newNode)
}

// ############### Lines

function Line(props) {
  this.id = props.id
  this.path = props.path
  this.node1 = props.node1
  this.node2 = props.node2

  return this
}

function newLine(node1, node2) {
  if(isAlreadyLine(node1, node2)) return
  var path = new Path2D(); 
  var line = new Line({id: uuid.v4(), path, node1, node2})

  lines.push(line)
  update()
  // saveLine(line)
}

function drawLine(line) {
  line.path = new Path2D()
  ctx.lineWidth = 3
  ctx.strokeStyle = 'blue'
  line.path.moveTo(line.node1.x, line.node1.y)
  line.path.lineTo(line.node2.x, line.node2.y)
  ctx.stroke(line.path)
}

function drawAllLines() {
  lines.forEach(line => {
    drawLine(line)
  })
}

function isAlreadyLine(node1, node2) {
  var newLine = {node1, node2}
  var isLine = lines.some(line => {
    var node1IsEqual = line.node1.x === newLine.node1.x && line.node1.y === newLine.node1.y
    var node2IsEqual = line.node2.x === newLine.node2.x && line.node2.y === newLine.node2.y
    var node1IsEqualToNode2 = line.node1.x === newLine.node2.x && line.node1.y === newLine.node2.y
    var node2IsEqualToNode1 = line.node2.x === newLine.node1.x && line.node2.y === newLine.node1.y
    if(node1IsEqual && node2IsEqual) return true
    else if(node1IsEqualToNode2 && node2IsEqualToNode1) return true
    else return false
  })
  return isLine
}

function removeLinesConnectedToNode(node) {
  var linesConntectedToNode = lines.filter(line => {
    var nodeIsnode1 = line.node1.x === node.x && line.node1.y === node.y
    var nodeIsnode2 = line.node2.x === node.x && line.node2.y === node.y
    if(nodeIsnode1 || nodeIsnode2) return line
  })
  linesConntectedToNode.forEach(line => {if(lines.includes(line)) lines.splice(lines.indexOf(line), 1)})
}


// ################## Event Listeners

// hover grid or node ? cursor pointer
canvas.addEventListener('mousemove', (e) => {
  var mouseX = parseInt(e.clientX - offsetX);
  var mouseY = parseInt(e.clientY - offsetY);

  var isOnNode = nodes.some(node => ctx.isPointInPath(node.path, mouseX, mouseY))
  var isOnGrid = grids.some(grid => ctx.isPointInStroke(grid.path1, mouseX, mouseY) || ctx.isPointInStroke(grid.path2, mouseX, mouseY))
  if(isOnNode || isOnGrid) canvas.style.cursor = 'pointer'
  else canvas.style.cursor = 'inherit'
});

// listen for dbl click events to make new nodes
canvas.addEventListener('dblclick', (e) => {
  var mouseX = parseInt(e.clientX - offsetX);
  var mouseY = parseInt(e.clientY - offsetY);

  var isOnGrid = grids.some(grid => ctx.isPointInStroke(grid.path1, mouseX, mouseY) || ctx.isPointInStroke(grid.path2, mouseX, mouseY))
  var nodeInPath = nodes.filter(node => ctx.isPointInPath(node.path, mouseX, mouseY))[0]
  if(!isOnGrid) {
    return
  } 
  else if(!nodeInPath) {
    newNode(mouseX, mouseY)
  } else removeNode(nodeInPath)
});

// active node on click event
canvas.addEventListener('click', (e) => {
  var mouseX = parseInt(e.clientX - offsetX);
  var mouseY = parseInt(e.clientY - offsetY);

  var nodeInPath = nodes.filter(node => ctx.isPointInPath(node.path, mouseX, mouseY))[0]
  if(nodeInPath) {
    if(!activeNodes.length) {
      activeNodes.push(nodeInPath)
      nodeInPath.color = 'blue'
    }
    else if(activeNodes.length === 1) {
      var isActive = activeNodes.some(activeNode => activeNode.id === nodeInPath.id)
      if(isActive) {
        activeNodes.splice(activeNodes.indexOf(nodeInPath), 1)
        nodeInPath.color = 'black'
      } else {
        activeNodes.push(nodeInPath)
        var firstNode = activeNodes[0]
        var secondNode = activeNodes[1]
        newLine(firstNode, secondNode)
        // reset active nodes
        activeNodes.forEach(node => node.color = 'black')
        resetActiveNodes()
      }
    }

  }
  update()
});

// handle key commands
document.addEventListener('keyup', (e) => {
  var key = e.key;
  if(key === "Backspace" || key === "Delete") {
    if(activeNodes[0]) {
      removeNode(activeNodes[0])
    }
  }
  if(key === 'ArrowUp') {
    if(activeNodes[0]) {
      activeNodes[0].y -= 1
      update()
    }
  }
  if(key === 'ArrowDown') {
    if(activeNodes[0]) {
      activeNodes[0].y += 1
      update()
    }
  }
  if(key === 'ArrowLeft') {
    if(activeNodes[0]) {
      activeNodes[0].x -= 1
      update()
    }
  }
  if(key === 'ArrowRight') {
    if(activeNodes[0]) {
      activeNodes[0].x += 1
      update()
    }
  }
})

// INIT
var grid2 = new Grid({step: height/50, color: 'gray', lineWidth: 1})
var grid1 = new Grid({step: height/10, color: 'black', lineWidth: 2})
grids.push(grid2)
grids.push(grid1)
update()
