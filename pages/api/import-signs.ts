import { resolve } from 'path';
import { loadGraph } from "../../lib/graph/utils"
import { addSign, save } from "../../lib/db/signs";

export default async function handler(req, res) {
  // Load graph
  const graph = await loadGraph(resolve('signs/signs.gv'));

  // Add signs
  graph.getNodes().forEach(node => {
    console.log(`Adding sign: ${node.value}`)
    addSign({
      name: node.value,
      references: [...node.refs]
    })
    // addRelationship({

    // })
  })

  // Save
  save();

  res.status(200).json({message: "ok"});
}