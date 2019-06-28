/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');
const fs = require('fs');
const refsDir = 'assets/graphs';
const dataDir = 'data';

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {

  // Make sure directories exist
  if (!fs.existsSync(refsDir)){
    fs.mkdirSync(refsDir);
  }
  if (!fs.existsSync(dataDir)){
    fs.mkdirSync(dataDir);
  }

  // Parse the graph
  const groups = await utils.parseGraph('signs/signs.gv');

  // Process the full graph
  const fullGraph = utils.buildGraph(groups);
  utils.writeSignRefs(`${refsDir}/fullRefs.json`, fullGraph);

  // Create data/references.json
  fs.writeFileSync(`${dataDir}/references.json`, JSON.stringify(groups, null, 2), 'utf-8')

  //
  // Simplified graph
  //

  // Load the list of synonyms
  const synonyms = await utils.loadGraph('synonyms/synonyms.gv')

  // Simplify the graph by collapsing synonyms
  synonyms.allPairs().forEach(synonym => {
    fullGraph.replace(synonym[0], synonym[1])
  })

  // Output the modified graph
  utils.writeGraph('signs/simplified.gv', fullGraph);
  utils.writeSignRefs(`${refsDir}/simplifiedRefs.json`, fullGraph);
}
