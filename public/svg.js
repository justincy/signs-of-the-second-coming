(function () {
  const refsTitle = document.querySelector('#refs-title');
  const refsContent = document.querySelector('#refs-content');

  const refsPromise = fetch(`${graphName}Refs.json`).then(response => response.json());
  
  Array.from(document.querySelectorAll('#svg g.node')).forEach(group => {
    group.addEventListener('click', (event) => {
      showRefs(group.querySelector('text').textContent);
    });
  });

  async function showRefs(sign) {
    const refData = await refsPromise;
    refsTitle.textContent = sign;
    refsContent.textContent = refData.nodes[sign].join(', ');
  }
})();