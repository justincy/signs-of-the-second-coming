import fs from 'fs';
import Graph from './graph.js';

function readFile(filename): Promise<string> {
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
   * Parse a graph file. Returns an object in the following format:
   * 
   * [
   *      {
   *          reference: 'D&C 88',
   *          signs: [
   *              ['a', 'b'],
   *              ['b', 'c']
   *          ]
   *      }
   *  ]
   * 
   * @param {string} filename name of the graph file to parse
   * @return {array} list of {reference,signs} groups
   */
  parseGraph: async function (filename) {
    const lines = (await readFile(filename)).split('\n');
    const groups = [];

    let parts;
    let currentGroup;
    let trimmedLine;

    // Iterate over all lines
    lines.forEach(function processLine(line) {

      trimmedLine = line.trim();

      // Skip lines that start with a #
      if (trimmedLine.indexOf('##') === 0) {
        return;
      }

      // New scripture ref; create new group
      if (trimmedLine.indexOf('#') === 0) {

        // If the previous group had any signs, add it to the list of groups
        if (currentGroup && currentGroup.signs.length) {
          groups.push(currentGroup);
        }

        // Create the new group
        currentGroup = {
          reference: trimmedLine.replace('# ', ''),
          signs: []
        };
        return;
      }

      // Split into a list of signs
      parts = line.split('->').map(p => p.trim());

      // Only process lines with sign relationships
      if (parts.length > 1) {

        // Remove quotes
        parts = parts.map(p => p.replace(/"/g, ''));

        // Add signs to the group
        for (let i = 0; i < parts.length - 1; i++) {
          currentGroup.signs.push([parts[i], parts[i + 1]]);
        }
      }
    });

    // Save the last group
    if (currentGroup.signs.length) {
      groups.push(currentGroup)
    }

    return groups;
  },

  /**
   * Build a graph from a parsed graph object
   * 
   * @param {array} groups parsed graph 
   * @returns {object} graph
   */
  buildGraph: function (groups) {
    const graph = new Graph();
    groups.forEach((group) => {
      group.signs.forEach((signs) => {
        graph.addPair(signs[0], signs[1], group.reference);
      })
    });
    return graph;
  },

  /**
   * Load and parse the graph.
   * 
   * @param {String} filename name of the file to load
   * @returns {object} graph
   */
  loadGraph: async function (filename) {
    const groups = await this.parseGraph(filename);
    return this.buildGraph(groups);
  }

}