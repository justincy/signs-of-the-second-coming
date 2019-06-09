I want to make the simplified graph more understandable. I realized that many signs are not in strict
order. What I mean is, sometimes they point to things which happen a few steps later and skip signs
between them. For example, many signs point to "Christ comes in the clouds" because it's the actual
Second Coming, but they could point to "Heaven unrolled as a scroll" or "Face of the Lord unveiled"
(assuming those immediately precede before "Christ comes in the clouds").

I think that I'd like to have a way to specify generic modifications, similar ot how I specify synonyms.
I don't want to manually modify the full signs.gv graph; I want that to represent the scriptures as
closely as possible without interpretation.

I could make a list of cycles in the graph and research whether they can be broken. Cycles are signs
of a lack of clarity, potential misunderstanding, or concurrent events. 

Unfortunately, I don't yet have a way to denote that events are concurrent. The only thing I've thought
of is to have concurrent events point to each other: "a -> b" and "b -> a".

Study the separation of the wheat from the tares before the burning.

Study Joel 2 in detail.

I'd like to create an interactive website for exploring the signs. When clicking on a sign, it would show
a side panel that lists related scriptures, perhaps a description, and display a subgraph showing all signs
before and after the selected sign. Would use an SVG output of the graph. Will probably need a build process
for assembling the scripture list. Could do it client-side on demand for starters, maybe. Could also try
rendering with d3.js; maybe the layout would be more natural.

I need to turn this into a database so that I can add any number of different annotations (notes, categories, priorities, time periods, etc) and quickly generate different views on demand. How will I do this?

I presently appreciate using git and having a history and easy diffs when I make changes. One concern with
using a database is losing history and diffs. Is that important? It is to me. I appreciate being able to
review it and the possibility of backtracking. I could do daily dumps. Or I could just build in a history.
Record changes in a change table while keeping a separate history of current values. Would I have a history
table for each canonical table or one generic history table? The generic table would be more technically
difficult to implement but easier to maintain. It's more work to maintain multiple history tables.

I guess I just have in my mind a relational implementation of the history log. But it doesn't have to be.
The canonical data could be relational while the history log could be a no-sql document table.

Another alternative is to automatically generate regular backups.

But I'm not sure I need that yet. My first goal is just to add the scripture refs to the site. I don't need 
the DB until I start adding additional annotations.