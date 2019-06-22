(function () {

  /**
   * Setup zooming and panning
   */
  const svg = document.querySelector('#svg-container svg');

  window.svg = svgPanZoom(svg, {
    minZoom: 1,
    maxZoom: 6,
    fit: false,
    contain: true,
    controlIconsEnabled: true,
    // Faster zooming
    zoomScaleSensitivity: 0.3,
  });

  /**
   * Setup scripture references
   */

  const refsTitle = document.querySelector('#refs-title');
  const refsContent = document.querySelector('#refs-content');
  const refsPromise = fetch(refsUrl).then(response => response.json());
  
  Array.from(document.querySelectorAll('#svg-container g.node')).forEach(group => {
    group.addEventListener('click', () => {
      showRefs(group.querySelector('text').textContent);
    });
  });

  async function showRefs(sign) {
    const refData = await refsPromise;
    refsTitle.textContent = sign;
    refsContent.textContent = refData.nodes[sign].join(', ');
  }
})();