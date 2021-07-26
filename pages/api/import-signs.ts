import { resolve } from 'path';
import { parseGraph } from "../../lib/graph/import"
import { addSign, save as saveSigns } from "../../lib/db/signs";
import { addReference, save as saveRelationships } from "../../lib/db/relationships";

export default async function handler(req, res) {
  // Load graph
  const refGroups = await parseGraph(resolve('signs/signs.gv'));

  // Add signs
  refGroups.forEach(refGroup => {
    refGroup.signs.forEach(([before, after]) => {
      addSign({
        name: before,
        references: [refGroup.reference]
      })
      addSign({
        name: after,
        references: [refGroup.reference]
      })
      addReference(before, after, refGroup.reference)
    });
  })

  // Save
  saveSigns();
  saveRelationships();

  res.status(200).json({message: "ok"});
}