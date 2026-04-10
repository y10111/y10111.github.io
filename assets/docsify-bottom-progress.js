// docsify-bottom-progress.js
// 阅读进度条：数值标签精确跟随进度条右端点，边缘自动贴边（0%左对齐，100%右对齐，中间居中）
// 标签背景色调整为灰白色，更清晰
(function () {
  const DEFAULT_CONFIG = {
    position: 'bottom',           // 'bottom' 或 'top'
    color: '#42b983',             // 进度条颜色
    height: '3px',                // 进度条高度
    showPercent: true             // 是否显示百分比数值
  };

  const userConfig = window.PROGRESS_CONFIG || {};
  const config = {
    position: userConfig.position || DEFAULT_CONFIG.position,
    color: userConfig.color || DEFAULT_CONFIG.color,
    height: userConfig.height || DEFAULT_CONFIG.height,
    showPercent: userConfig.showPercent !== undefined ? userConfig.showPercent : DEFAULT_CONFIG.showPercent
  };

  // 创建进度条容器
  const container = document.createElement('div');
  container.id = 'docsify-progress-container';
  container.style.cssText = `
    position: fixed;
    ${config.position}: 0;
    left: 0;
    right: 0;
    height: ${config.height};
    z-index: 1000;
    pointer-events: none;
  `;
  
  // 进度条本体
  const progressDiv = document.createElement('div');
  progressDiv.id = 'docsify-bottom-progress';
  progressDiv.style.cssText = `
    width: 0%;
    height: 100%;
    background-color: ${config.color};
    transition: width 0.1s ease-out;
    box-shadow: 0 0 2px rgba(0,0,0,0.1);
  `;
  container.appendChild(progressDiv);
  
  // 百分比标签（背景色改为灰白色）
  let percentSpan = null;
  if (config.showPercent) {
    percentSpan = document.createElement('span');
    percentSpan.id = 'docsify-progress-percent';
    percentSpan.style.cssText = `
      position: absolute;
      bottom: 100%;
      background: rgba(66, 185, 131, 0.6);
      color: white;
      font-size: 11px;
      font-family: monospace;
      padding: 2px 6px;
      margin: 0 0 1px 0;
      border-radius: 12px;
      white-space: nowrap;
      pointer-events: none;
      backdrop-filter: blur(2px);
      transition: left 0.1s ease-out, right 0.1s ease-out, transform 0.1s ease-out;
    `;
    container.appendChild(percentSpan);
  }
  
  document.body.appendChild(container);

  // 更新标签位置（边缘自动贴边，中间跟随）
  function updateLabelPosition(percent) {
    if (!percentSpan) return;
    let p = Math.min(100, Math.max(0, percent));
    const eps = 0.01;
    if (p <= eps) {
      percentSpan.style.left = '0';
      percentSpan.style.right = 'auto';
      percentSpan.style.transform = 'translateX(0)';
    } else if (p >= 100 - eps) {
      percentSpan.style.left = 'auto';
      percentSpan.style.right = '0';
      percentSpan.style.transform = 'translateX(0)';
    } else {
      percentSpan.style.left = p + '%';
      percentSpan.style.right = 'auto';
      percentSpan.style.transform = 'translateX(-50%)';
    }
  }

  function setProgress(percent) {
    let p = Math.min(100, Math.max(0, percent));
    if (Math.abs(p - 100) < 0.01) p = 100;
    if (Math.abs(p - 0) < 0.01) p = 0;
    progressDiv.style.width = p + '%';
    if (percentSpan) {
      percentSpan.textContent = Math.round(p) + '%';
      updateLabelPosition(p);
    }
  }

  function resetProgress() {
    setProgress(0);
  }

  let ticking = false;
  function updateProgress() {
    const winScroll = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    
    if (docHeight <= 0) {
      setProgress(100);
      ticking = false;
      return;
    }
    
    let scrolled = (winScroll / docHeight) * 100;
    if (scrolled < 0) scrolled = 0;
    setProgress(scrolled);
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }

  function onPageChange() {
    resetProgress();
    setTimeout(updateProgress, 100);
    setTimeout(updateProgress, 200);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', updateProgress);
  window.addEventListener('resize', updateProgress);
  window.addEventListener('hashchange', onPageChange);
  window.addEventListener('popstate', onPageChange);

  const observer = new MutationObserver(function () {
    onPageChange();
  });
  const app = document.getElementById('app');
  if (app) {
    observer.observe(app, { childList: true, subtree: true });
  }

  updateProgress();
})();