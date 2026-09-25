// 让重复点击侧边栏同一链接时也能滚动到目标
// 说明：浏览器对「地址没变化」的点击不会触发 hashchange，docsify 也就不会滚动，
//       这里只接管这种「目标与当前地址完全相同」的点击，手动滚动过去。
//       目标不同的点击一律不拦截，交回 docsify 原生跳转——避免手动派发 hashchange
//       让 docsify 重新渲染侧边栏，从而把折叠插件的展开状态重置掉。
(function () {
  // 统一成解码后的形式再比较：href 属性里是中文原文，location.href 里是百分号编码
  function normalize(url) {
    try {
      return decodeURI(url);
    } catch (e) {
      return url;
    }
  }

  // 取出要定位的元素 id：兼容 #/路径?id=小节 与 #锚点 两种写法
  function getTargetId(href) {
    var m = /[?&]id=([^&]*)/.exec(href);
    if (m) {
      try { return decodeURIComponent(m[1]); } catch (e) { return m[1]; }
    }
    if (href.charAt(0) === '#' && href.charAt(1) && href.charAt(1) !== '/') {
      try { return decodeURIComponent(href.slice(1)); } catch (e) { return href.slice(1); }
    }
    return null;
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

  function scrollToTarget(href) {
    var topMargin = (window.$docsify && window.$docsify.topMargin) || 0;
    var el = findElementById(getTargetId(href));
    if (el) {
      var rect = el.getBoundingClientRect();
      window.scrollTo({ top: Math.max(0, window.scrollY + rect.top - topMargin), behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    var a = e.target.closest('.sidebar a, .sidebar-nav a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    // 目标与当前地址不同时，交回 docsify 正常跳转
    if (normalize(a.href) !== normalize(location.href)) return;
    e.preventDefault();
    scrollToTarget(href);
  }, true);
})();
