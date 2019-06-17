(function () {
  // TODO: need to add a simple static server because this doesn't work locally via the files API
  // Or I force the browser to download it by including via a scrip tag?
  const refsPromise = fetch(`${graphName}Refs.json`).then(response => response.json());
  
  Array.from(document.querySelectorAll('#svg g.node')).forEach(group => {
    group.addEventListener('click', (event) => {
      showRefs(group.querySelector('text').textContent);
    });
  });

  async function showRefs(sign) {
    const refData = await refsPromise;
    console.log('sign refs', refData.nodes[sign]);

    // Should I show it in a popup or panel?
    // What is the mobile experience? 
    // What is the desktop experience?
  }
})();