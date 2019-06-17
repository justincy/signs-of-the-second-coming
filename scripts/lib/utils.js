const fs = require('fs');
const Graph = require('./graph.js');

function readFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, (error, data) => {
      if (error) {
        reject(error);
      }
      resolve(data.toString());
    })
  });
}

module.exports = {

  /**
   * Load and parse the graph. Returns an object with each sign as a key
   * and the values being a list of signs that come before and after.
   * { sign => {before: [], after: []}}
   * 
   * @param {String} filename name of the file to load
   * @returns {object} graph
   */
  loadGraph: async function (filename) {
    const lines = (await readFile(filename)).split('\n');
    const graph = new Graph();
    let parts;
    let lastRef;
    let trimmedLine;

    // Iterate over all lines
    lines.forEach(function processLine(line) {

      trimmedLine = line.trim();

      // Skip lines that start with a #
      if (trimmedLine.indexOf('##') === 0) {
        return;
      }

      // Save reference to the scripture ref
      if (trimmedLine.indexOf('#') === 0) {
        lastRef = trimmedLine.replace('# ', '');
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
          graph.addPair(parts[i], parts[i + 1], lastRef);
        }
      }
    });
    return graph;
  },

  /**
   * Write a graph to a file
   * 
   * @param {string} filename
   * @param {object} subgraph
   */
  writeGraph: function (filename, subgraph) {
    // Construct a set of {x -> y} pairs so that we dedup
    const allPairs = subgraph.allPairs();

    // Write to a file
    const file = fs.createWriteStream(filename);
    file.write('digraph {');
    allPairs.forEach((pair) => {
      // each pair on a line with quotes around values
      file.write(`\n\t"${pair[0]}" -> "${pair[1]}"`);
    });
    file.end('\n}');
  },

  /**
   * Write the scripture references of a graph to a file
   * 
   * @param {string} filename Output filename
   * @param {object} graph
   */
  writeRefs: function (filename, graph) {
    const data = {
      nodes: {}
    };

    graph.getNodes().forEach(node => {
      data.nodes[node.value] = [...node.refs];
    });

    fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
  }

}