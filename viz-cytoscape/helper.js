let applyAlgorithmFromSelect = (name) => Promise.resolve( name )
  .then(x => {
    console.log('running', x);
    return x;
  })
  .then( getAlgorithm )
  .then( runAlgorithm )
  .then( animateAlgorithm );


let getAlgorithm = (name) => {
  switch (name) {
    case 'bfs': return Promise.resolve(cy.elements().bfs.bind(cy.elements()));
    case 'dfs': return Promise.resolve(cy.elements().dfs.bind(cy.elements()));
    case 'astar': return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
    case 'none': return Promise.resolve(undefined);
    case 'custom': return Promise.resolve(undefined); // replace with algorithm of choice
    default: return Promise.resolve(undefined);
  }
};

let runAlgorithm = (algorithm) => {
  if (algorithm === undefined) {
    return Promise.resolve(undefined);
  } else {
    let options = {
      root: '#' + cy.nodes()[0].id(),
      // astar requires target; goal property is ignored for other algorithms
      goal: '#' + cy.nodes()[Math.round(Math.random() * (cy.nodes().size() - 1))].id()
    };
    return Promise.resolve(algorithm(options));
  }
}
let animateAlgorithm = (algResults) => {
  // clear old algorithm results
  cy.$().removeClass('highlighted start end');
  currentAlgorithm = algResults;
  if (algResults === undefined || algResults.path === undefined) {
    return Promise.resolve();
  }
  else {
    let i = 0;
    // for astar, highlight first and final before showing path
    if (algResults.distance) {
      // Among DFS, BFS, A*, only A* will have the distance property defined
      algResults.path.first().addClass('highlighted start');
      algResults.path.last().addClass('highlighted end');
      // i is not advanced to 1, so start node is effectively highlighted twice.
      // this is intentional; creates a short pause between highlighting ends and highlighting the path
    }
    return new Promise(resolve => {
      let highlightNext = () => {
        if (currentAlgorithm === algResults && i < algResults.path.length) {
          algResults.path[i].addClass('highlighted');
          console.log('adding class now', i, algResults.path[i]);
          i++;
          setTimeout(highlightNext, 500);
        } else {
          // resolve when finished or when a new algorithm has started visualization
          resolve();
        }
      }
      highlightNext();
    });
  }
};


document.addEventListener('DOMContentLoaded', function(){
  var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    // layout: {
    //   name: 'grid',
    //   rows: 2,
    //   cols: 2
    // },
    style: [
      {
        selector: 'node',
        style: {
          'content': 'data(name)'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle',
          label: 'data(weight)'
        }
      },
      // some style for the extension
      {
        selector: '.eh-handle',
        style: {
          'background-color': 'red',
          'width': 12,
          'height': 12,
          'shape': 'ellipse',
          'overlay-opacity': 0,
          'border-width': 12, // makes the handle easier to hit
          'border-opacity': 0
        }
      },
      {
        selector: '.eh-hover',
        style: {
          'background-color': 'red'
        }
      },
      {
        selector: '.eh-source',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },
      {
        selector: '.eh-target',
        style: {
          'border-width': 2,
          'border-color': 'red'
        }
      },
      {
        selector: '.eh-preview, .eh-ghost-edge',
        style: {
          'background-color': 'red',
          'line-color': 'red',
          'target-arrow-color': 'red',
          'source-arrow-color': 'red'
        }
      },
      {
        selector: '.eh-ghost-edge.eh-preview-active',
        style: {
          'opacity': 0
        }
      }
    ],
    elements: {
      nodes: [
        { data: { id: 'start', name: 'Andy hungry (and cheap)' } },
        { data: { id: 2, name: 'Steal from fridge' } },
        { data: { id: 3, name: 'get caught stealing' } },
        { data: { id: 4, name: 'get fired' } },
        { data: { id: 'dc', name: 'Donkey Car meeting' } },
        { data: { id: 'dcm', name: 'Leftovers after Donkey Car' } },
        { data: { id: 'feb', name: 'Wait for February' } },
        { data: { id: 'march', name: 'Wait for March' } },
        { data: { id: 'bday', name: 'Birthday lunch for month' } },
        { data: { id: 'lunch', name: 'Free Lunch!' } },
        { data: { id: 'lla', name: 'Get approval to start L&L' } },
        { data: { id: 'llp', name: 'Prepare & Schedule' } },
        // { data: { id: 'llr', name: 'Schedule L&L' } },
        { data: { id: 'alex', name: `Intern going away party (have fun in Japan)` } },
      ],
      edges: [
        { data: { source: 'start', target: 2, weight: 0.5 } },
        { data: { source: 2, target: 3, weight: 0.25 } },
        { data: { source: 3, target: 4, weight: 0 } },
        { data: { source: 'dc', target: 'dcm', weight: 3 } },
        { data: { source: 'dcm', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'feb', weight: 14 } },
        { data: { source: 'feb', target: 'bday', weight: 14 } },
        { data: { source: 'bday', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'march', weight: 42 } },
        { data: { source: 'march', target: 'bday', weight: 14 } },
        { data: { source: 'start', target: 'lla', weight: 4 } },
        { data: { source: 'lla', target: 'llp', weight: 11 } },
        // { data: { source: 'llp', target: 'llr', weight: 0.25 } },
        { data: { source: 'llp', target: 'lunch', weight: 8 } },
        { data: { source: 'start', target: 'alex', weight: 102 } },
        { data: { source: 'alex', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'dc', weight: 17 } },
      ]
    }
  });
  cy.layout({
    name:'breadthfirst',
    fit: true, // whether to fit the viewport to the graph
    directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
    padding: 20, // padding on fit
    circle: false, // put depths in concentric circles if true, put depths top down if false
    grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
    spacingFactor: 1.3, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
    avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
    nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
    roots: 'start', // the roots of the trees
    maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
    // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
    // animate: false, // whether to transition the node positions
    // animationDuration: 500, // duration of animation in ms if enabled
    // animationEasing: undefined, // easing of animation if enabled,
    // animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
    // ready: undefined, // callback on layoutready
    // stop: undefined, // callback on layoutstop
    // transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
  }).run();
  applyAlgorithmFromSelect('bfs')
});
