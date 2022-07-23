// setup
var canvas = document.querySelector("Canvas");
var ctx = canvas.getContext('2d');
var width = window.innerWidth;
var height = window.innerHeight - 50;
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
  console.log("*********** Clear")
  clearCanvas()

  drawAllGrids()
  drawAllLines()
  drawAllNodes()
}


// clear
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
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
  node.path.arc(node.x, node.y, 10, 0, 2 * Math.PI, false)
  ctx.fillStyle = node.color
  ctx.fill(node.path)
}

function drawAllNodes() {
  nodes.forEach(node => {
    drawNode(node)
  })
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
  this.point1 = props.point1
  this.point2 = props.point2

  return this
}

function newLine(point1, point2) {
  var path = new Path2D(); 
  var line = new Line({id: uuid.v4(), path, point1, point2})

  lines.push(line)
  console.log(lines)
  update()
  // saveLine(line)
}

function drawLine(line) {
  ctx.moveTo(line.point1.x, line.point1.y)
  ctx.lineTo(line.point2.x, line.point2.y)
  ctx.stroke()
}

function drawAllLines() {
  lines.forEach(line => {
    drawLine(line)
  })
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

canvas.addEventListener('dblclick', (e) => {
  var mouseX = parseInt(e.clientX - offsetX);
  var mouseY = parseInt(e.clientY - offsetY);

  // listen for click events to make new nodes
  if(ctx.isPointInStroke(grids[0].path1, mouseX, mouseY)) {
    if(!nodes.length) newNode(mouseX, mouseY)
    else nodes.forEach(node => {
      if(!ctx.isPointInPath(node.path, mouseX, mouseY)) newNode(mouseX, mouseY)
    })
  }
  else if(ctx.isPointInStroke(grids[0].path2, mouseX, mouseY)) {
    if(!nodes.length) newNode(mouseX, mouseY)
    else nodes.forEach(node => {
      if(!ctx.isPointInPath(node.path, mouseX, mouseY)) newNode(mouseX, mouseY)
    })
  }
  else if(ctx.isPointInStroke(grids[1].path1, mouseX, mouseY)) {
    if(!nodes.length) newNode(mouseX, mouseY)
    else nodes.forEach(node => {
      if(!ctx.isPointInPath(node.path, mouseX, mouseY)) newNode(mouseX, mouseY)
    })
  }
  else if(ctx.isPointInStroke(grids[1].path2, mouseX, mouseY)) {
    if(!nodes.length) newNode(mouseX, mouseY)
    else nodes.forEach(node => {
      if(!ctx.isPointInPath(node.path, mouseX, mouseY)) newNode(mouseX, mouseY)
    })
  }
});

canvas.addEventListener('click', (e) => {
  e.stopPropagation()
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
        newLine({x: firstNode.x, y: firstNode.y}, {x: secondNode.x, y: secondNode.y})
        // reset active nodes
        activeNodes.forEach(node => node.color = 'black')
        activeNodes = []
      }
    }

  }
  update()
});

// INIT
var grid2 = new Grid({step: width/50, color: 'gray', lineWidth: 1})
var grid1 = new Grid({step: width/10, color: 'black', lineWidth: 2})
grids.push(grid2)
grids.push(grid1)
update()
