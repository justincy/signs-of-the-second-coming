/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');
const fs = require('fs');
const refsDir = 'assets/graphs';
const dataDir = 'data';

const signGroups = require('../signs/groups.json');

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
  const referenceGroups = await utils.parseGraph('signs/signs.gv');

  // Process the full graph
  const fullGraph = utils.buildGraph(referenceGroups);
  utils.writeSignRefs(`${refsDir}/fullRefs.json`, fullGraph);

  // Create data/references.json
  fs.writeFileSync(`${dataDir}/references.json`, JSON.stringify(referenceGroups, null, 2), 'utf-8')

  //
  // Simplified graph
  //

  // Load the list of synonyms
  const synonyms = await utils.loadGraph('synonyms/synonyms.gv')

  // Simplify the graph by collapsing synonyms
  synonyms.getAllPairs().forEach(synonym => {
    fullGraph.replace(synonym[0], synonym[1])
  });

  fullGraph.simplifyDescendants();

  // Process groups
  signGroups.forEach(({ name, members }) => {
    // Create the group node if it doesn't exist
    fullGraph.getOrCreateNode(name);
    members.forEach(member => {
      // Merge all members into the group node
      fullGraph.replace(member, name);
    });
  });

  // Output the modified graph
  utils.writeGraph('signs/simplified.gv', fullGraph);
  utils.writeSignRefs(`${refsDir}/simplifiedRefs.json`, fullGraph);
}
