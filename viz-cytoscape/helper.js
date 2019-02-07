let applyAlgorithmFromSelect = (name) => Promise.resolve( name )
  .then( getAlgorithm )
  .then( runAlgorithm )
  .then( animateAlgorithm );


let getAlgorithm = (name) => {
  switch (name) {
    case 'bfs': return Promise.resolve(cy.elements().bfs.bind(cy.elements()));
    case 'dfs': return Promise.resolve(cy.elements().dfs.bind(cy.elements()));
    case 'astar': return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
    case 'dijkstra': return Promise.resolve(cy.elements().dijkstra.bind(cy.elements()));
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
      goal: '#' + cy.nodes()[1].id(),
      weight: (edge) => edge.weight,
      directed: true,
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
    layout: {
      name:'breadthfirst',
      fit: true, // whether to fit the viewport to the graph
      directed: true, // whether the tree is directed downwards (or edges can point in any direction if false)
      padding: 20, // padding on fit
      circle: false, // put depths in concentric circles if true, put depths top down if false
      grid: false, // whether to create an even grid into which the DAG is placed (circle:false only)
      spacingFactor: 1.3, // positive spacing factor, larger => more space between nodes (N.B. n/a if causes overlap)
      avoidOverlap: true, // prevents node overlap, may overflow boundingBox if not enough space
      nodeDimensionsIncludeLabels: false, // Excludes the label when calculating node bounding boxes for the layout algorithm
      roots: '#start', // the roots of the trees
      maximal: true, // whether to shift nodes down their natural BFS depths in order to avoid upwards edges (DAGS only)
      // boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
      // animate: false, // whether to transition the node positions
      // animationDuration: 500, // duration of animation in ms if enabled
      // animationEasing: undefined, // easing of animation if enabled,
      // animateFilter: function ( node, i ){ return true; }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.  Non-animated nodes are positioned immediately when the layout starts
      // ready: undefined, // callback on layoutready
      // stop: undefined, // callback on layoutstop
      // transform: function (node, position ){ return position; } // transform a given node position. Useful for changing flow direction in discrete layouts
    },
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
      {
        selector: '.highlighted',
        style: {
          'background-color': 'red',
          'line-color': 'red',
          'target-arrow-color': 'red',
          'source-arrow-color': 'red'
        }
      },
      {
        selector: '.consumed',
        style: {
          'background-color': 'purple',
          'line-color': 'purple',
          'target-arrow-color': 'purple',
          'source-arrow-color': 'purple'
        }
      },
      {
        selector: '.candidate',
        style: {
          'background-color': 'orange',
          'line-color': 'orange',
          'target-arrow-color': 'orange',
          'source-arrow-color': 'orange'
        }
      }
    ],
    elements: [
        { group: 'nodes', data: { id: 'start', name: 'Andy hungry (and cheap)' } },
        { group: 'nodes', data: { id: 'lunch', name: 'Free Lunch!' } },
        { group: 'nodes', data: { id: 2, name: 'Steal from fridge' } },
        { group: 'nodes', data: { id: 3, name: 'get caught stealing' } },
        { group: 'nodes', data: { id: 4, name: 'get fired' } },
        { group: 'nodes', data: { id: 'dc', name: 'Donkey Car meeting' } },
        { group: 'nodes', data: { id: 'dcm', name: 'Leftovers after Donkey Car' } },
        { group: 'nodes', data: { id: 'feb', name: 'Wait for February' } },
        { group: 'nodes', data: { id: 'march', name: 'Wait for March' } },
        { group: 'nodes', data: { id: 'bday', name: 'Birthday lunch for month' } },
        { group: 'nodes', data: { id: 'lla', name: 'Come up with L&L scheme' } },
        { group: 'nodes', data: { id: 'llp', name: 'Prepare & Schedule' } },
        { group: 'nodes', data: { id: 'alex', name: `Alex leaves for Japan` } },
        { group: 'nodes', data: { id: 'alexp', name: `Alex going away party` } },
        { data: { source: 'start', target: 2, weight: 0.5 } },
        { data: { source: 2, target: 3, weight: 0.25 } },
        { data: { source: 3, target: 4, weight: 0 } },
        { data: { source: 'dc', target: 'dcm', weight: 3 } },
        { data: { source: 'dcm', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'feb', weight: 12 } },
        { data: { source: 'feb', target: 'bday', weight: 14 } },
        { data: { source: 'bday', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'march', weight: 40 } },
        { data: { source: 'march', target: 'bday', weight: 14 } },
        { data: { source: 'start', target: 'lla', weight: 2 } },
        { data: { source: 'lla', target: 'llp', weight: 11 } },
        { data: { source: 'llp', target: 'lunch', weight: 6 } },
        { data: { source: 'start', target: 'alex', weight: 94 } },
        { data: { source: 'alex', target: 'alexp', weight: 10 } },
        { data: { source: 'alexp', target: 'lunch', weight: 0 } },
        { data: { source: 'start', target: 'dc', weight: 17 } },
      ],
  });

  cy.on('click', 'node', function(evt) {
    const id = '#' + this.id();
    const cls = cy.nodes(id)[0]._private.classes;
    if (cls.has('highlighted')) {
      cy.nodes(id).removeClass('highlighted');
    } else {
      cy.nodes(id).addClass('highlighted');
    }
  });
  cy.on('click', 'edge', function(evt) {
    const id = '#' + this.id();
    const cls = cy.edges(id)[0]._private.classes;
    if (cls.has('highlighted')) {
      cy.edges(id).removeClass('highlighted');
    } else {
      cy.edges(id).addClass('highlighted');
    }
  });

  function clearMarks() {
    cy.$().removeClass('highlighted candidate consumed');
    step = dijkstra(cy);
  }

  $('#clear').click(clearMarks);
  $('#bfs').click(() => {
    clearMarks();
    applyAlgorithmFromSelect('bfs');
  });
  $('#dfs').click(() => {
    clearMarks();
    applyAlgorithmFromSelect('dfs');
  });


  function dijkstra(cy = cy, start = 'start', end = 'lunch') {
    const nodes = cy.nodes();
    const edges = cy.edges();

    const V = {
      start: { d: 0, path: [start]},
    };
    const U = new Set();
    for (let x = 0; x < nodes.length; x++) {
      const id = nodes[x].id();
      if (id != start) U.add(id);
    }

    function moveToConsumed({edge, dgs}) {
      const tId = edge.target().id();
      cy.nodes('#'+tId).addClass('consumed');
      cy.edges('#' + edge.id()).addClass('consumed');
      // cy.edges('#' + edge.id()).removeClass('candidate');
      cy.$().removeClass('candidate');

      U.delete(tId);
      V[tId] = {
        d: dgs,
        path: [...V[edge.source().id()].path, tId]
      };
      // console.log(V);
    }

    let min = null;

    function loop() {
      if (min) {
        moveToConsumed(min);
        min = null;
        return;
      }

      cy.nodes('#'+start).addClass('consumed');
      // cy.$().removeClass('candidate');

      if (V[end]) return;

      x = edges.filter(edge => {
        return V[edge.source().id()] && U.has(edge.target().id());
      })
      .map(edge => {
        const id = edge.id();
        cy.edges('#' + id).addClass('candidate');

        w = edge._private.data.weight;
        dgs = w + V[edge.source().id()].d; // dijkstra greedy score
        return {edge, dgs};
      });

      min = x[0];
      for (let z = 1; z < x.length; z++) {
        if (x[z].dgs < min.dgs) min = x[z];
      }
    }

    return loop;
  }

  var step = dijkstra(cy);
  $('#step').click(() => step());
});
