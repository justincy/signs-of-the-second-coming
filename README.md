# Signs of the Second Coming

Exploring the order of the signs of the Second Coming of Christ as mentioned in scripture.
This analysis is published at https://www.greatdayofthelord.org/ and is from the perspective
of The Church of Jesus Christ of Latter-day Saints.

The primary purpose is to identify the order of the signs. _We are not trying to predict when
Christ will return._

## How it works

I use [DOT](https://en.wikipedia.org/wiki/DOT_(graph_description_language)) to describe 
relationships between signs and then generate charts with graphiz.

I maintain a complete [list of signs](signs/signs.gv) that I try not to add any interpretation to.
I generate a simplified chart by removing duplicate edges from the graph and by processing a
list of [synonyms](synonyms/synonyms.gv) (the sign on the left is merged into the sign on the right).

I have a list of [questions](questions.md) regarding my current analysis and notes on various [synonyms](./synonyms).

The website is generated with [Hugo](https://gohugo.io/).

## Contributing

Multiple ways of contributing to the analysis:

* Add more scriptures and signs to the [full list of signs](signs/signs.gv).
* Identify more [synonyms](synonyms/synonyms.gv).
* Help us create more visualizations or methods of analysis.

You can contribute either by opening an [issue](https://github.com/justincy/signs-of-the-second-coming/issues) or by creating a [pull request](https://help.github.com/en/articles/about-pull-requests).