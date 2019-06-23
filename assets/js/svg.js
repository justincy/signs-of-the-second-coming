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
    // view-source:http://ariutta.github.io/svg-pan-zoom/demo/mobile.html
    customEventsHandler: {
      haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
      init: function(options) {
        var instance = options.instance,
            initialScale = 1,
            pannedX = 0,
            pannedY = 0

        // Init Hammer
        // Listen only for pointer and touch events
        this.hammer = Hammer(options.svgElement, {
          inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
        })

        // Enable pinch
        this.hammer.get('pinch').set({enable: true})

        // Handle double tap
        this.hammer.on('doubletap', function(ev){
          instance.zoomIn()
        })

        // Handle pan
        this.hammer.on('panstart panmove', function(ev){
          // On pan start reset panned variables
          if (ev.type === 'panstart') {
            pannedX = 0
            pannedY = 0
          }

          // Pan only the difference
          instance.panBy({x: ev.deltaX - pannedX, y: ev.deltaY - pannedY})
          pannedX = ev.deltaX
          pannedY = ev.deltaY
        })

        // Handle pinch
        this.hammer.on('pinchstart pinchmove', function(ev){
          // On pinch start remember initial zoom
          if (ev.type === 'pinchstart') {
            initialScale = instance.getZoom()
            instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
          }

          instance.zoomAtPoint(initialScale * ev.scale, {x: ev.center.x, y: ev.center.y})
        })

        // Prevent moving the page on some devices when panning over SVG
        options.svgElement.addEventListener('touchmove', function(e){ e.preventDefault(); });
      },

      destroy: function(){
        this.hammer.destroy()
      }
    }
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