// Ensure clicking the same sidebar anchor always scrolls to the target
(function () {
  function getIdFromHash(hash) {
    if (!hash) return null;
    try {
      return decodeURIComponent(hash.replace(/^#/, ""));
    } catch (e) {
      return hash.replace(/^#/, "");
    }
  }

  function findElementById(id) {
    if (!id) return null;
    var el = document.getElementById(id);
    if (el) return el;
    try {
      if (window.CSS && CSS.escape) {
        el = document.querySelector('#' + CSS.escape(id));
      } else {
        el = document.querySelector('[id="' + id.replace(/"/g, '\\"') + '"]');
      }
    } catch (e) {
      el = null;
    }
    return el;
  }

  function scrollToElement(el) {
    if (!el) return;
    var topMargin = (window.$docsify && $docsify.topMargin) || 0;
    var rect = el.getBoundingClientRect();
    var targetY = window.scrollY + rect.top - topMargin;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }

  function scrollToHash(hash) {
    var id = getIdFromHash(hash);
    var el = findElementById(id);
    if (el) scrollToElement(el);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest('.sidebar a, .sidebar-nav a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    e.preventDefault();
    // Always scroll to target even if hash didn't change
    scrollToHash(href);
    // Update address bar without adding history entry
    try {
      history.replaceState(null, '', href);
      // Let docsify (or other) react to hashchange if needed
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    } catch (err) {}
  }, true);

  // Ensure hashchange (programmatic or back/forward) also scrolls
  window.addEventListener('hashchange', function () {
    scrollToHash(location.hash);
  }, false);
})();
