/**
 * Simplify the full graph by condensing synonyms.
 */

const fs = require('fs');
const Graph = require('./lib/graph.js');

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Construct the graph
  const graph = await loadGraph();

  // Load the list of synonyms

  // Simplify the graph by collapsing the synonyms

  // Reconstruct subgraph for only the signs we're interested in
  // const subgraph = graph.subgraph(signs);

  // Output subgraph
  writeGraph('simplified.gv', subgraph);
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

/**
 * Write a graph to a file
 * 
 * @param {string} filename
 * @param {object} subgraph
 */
function writeGraph(filename, subgraph) {
  // Construct a set of {x -> y} pairs so that we dedup
  const allPairs = subgraph.allPairs();

  // Write to a file
  const file = fs.createWriteStream(filename);
  file.write('digraph synonyms {');
  allPairs.forEach((pair) => {
    file.write(`\n\t"${pair[0]}" -> "${pair[1]}"`);
  });
  file.end('\n}');
    // each pair on a line with quotes around values
}