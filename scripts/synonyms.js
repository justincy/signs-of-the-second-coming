/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const fs = require('fs');
const Graph = require('./graph.js');

// Gather params: list of signs we want to extract; output?
const args = require('yargs')
  .option('s', {
    array: true,
    description: 'sign',
    demandOption: true
  })
  .argv;

const signs = args.s;

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Construct the graph
  const graph = await loadGraph();
  console.log(graph);

  // Reconstruct subgraph for only the signs we're interested in

  // Output subgraph
}

/**
 * Load an parse the graph. Returns an object with each sign as a key
 * and the values being a list of signs that come before and after.
 * { sign => {before: [], after: []}}
 * 
 * @returns {object} graph
 */
async function loadGraph() {
  const lines = (await readFile()).split('\n');
  const graph = new Graph();
  let parts;

  // Iterate over all lines
  lines.forEach((line) => {

    // Skip lines that start with a #
    if (line.trim().indexOf('#') === 0) {
      return;
    }

    // Split into a list of signs
    parts = line.split('->').map(p => p.trim());

    // Only process lines with sign relationships
    if (parts.length > 1) {

      // Remove quotes
      parts = parts.map(p => p.replace(/"/g, ''));

      // Add parts to the graph
      for (let i = 0; i < parts.length - 1; i++) {
        graph.addPair(parts[i], parts[i + 1])
      }
    }
  });
  return graph;
}

function readFile() {
  return new Promise((resolve, reject) => {
    fs.readFile('signs.gv', (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data.toString());
    })
  });
}