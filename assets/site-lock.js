// site-lock.js
// 站点访问门禁：密码锁屏（终端窗风格）+ 记住解锁 + 退出锁定
// 说明：
//   1. 全站锁定：遮罩覆盖整个页面（含导航栏），解锁后才露出 docsify 内容
//   2. 解锁标记存入 localStorage，默认 7 天内免输密码
//   3. 改密码只改配置区的 PASSWORD_HASH（密码的 SHA-256 哈希，明文不进仓库）
//   4. 样式随本文件一起注入，无需单独引入 CSS
(function () {
  'use strict';

  /* ==================== 配置区 ==================== */
  var CONFIG = {
    PASSWORD_HASH: '1478d4c78ac06196f88e324457aecbb724b0966ce531a2536defddd019f7d73c', // 密码的 SHA-256 哈希
    REMEMBER_DAYS: 7,                 // 解锁后免输密码的天数
    STORAGE_KEY: 'site-lock-authed-at' // localStorage 中保存解锁时间戳的键
  };

  /* ==================== 锁屏样式（随脚本注入） ==================== */
  // 设计：终端窗风格——等宽字体 + 绿色提示符 ❯ + 底部虚线输入行，
  //       错误与成功信息以命令输出形式显示，呼应笔记站主人的程序员身份
  var LOCK_CSS = [
    '/* 遮罩层：全屏盖住页面，毛玻璃透出背景图 */',
    '#site-lock-overlay {',
    '  position: fixed; inset: 0; z-index: 99999;',
    '  display: flex; align-items: center; justify-content: center;',
    '  padding: 20px;',
    '  background: rgba(246, 248, 247, 0.55);',       /* 浅色遮罩底色 */
    '  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);',
    '  transition: opacity 0.4s ease, visibility 0.4s ease;', /* 解锁成功淡出 */
    '  font-family: ui-monospace, "SF Mono", "Cascadia Code", Consolas, "Courier New", monospace;',
    '  letter-spacing: 0.2px;',
    '}',
    '/* 明暗主题变量：默认浅色，.lock-dark 覆盖为深色 */',
    '#site-lock-overlay {',
    '  --lk-panel: rgba(255, 255, 255, 0.75);',       /* 终端窗底色 */
    '  --lk-ink: #22302a;',                           /* 主文字：墨绿黑 */
    '  --lk-muted: #6b7a72;',                         /* 次要文字 */
    '  --lk-border: rgba(28, 36, 32, 0.12);',         /* 边框与虚线 */
    '  --lk-accent: #2ea873;',                        /* 站点绿：提示符/按钮/成功 */
    '  --lk-error: #d05744;',                         /* 错误红 */
    '}',
    '#site-lock-overlay.lock-dark {',
    '  background: rgba(10, 13, 11, 0.68);',
    '  --lk-panel: rgba(17, 22, 19, 0.78);',
    '  --lk-ink: #e2ebe6;',
    '  --lk-muted: #8a9a91;',
    '  --lk-border: rgba(223, 232, 228, 0.12);',
    '  --lk-accent: #3ecf8f;',
    '  --lk-error: #e2705f;',
    '}',
    '/* 终端窗：圆角 + 浮影，进入时轻微上浮 */',
    '#site-lock-overlay .lock-window {',
    '  width: min(400px, 100%);',
    '  background: var(--lk-panel);',
    '  border: 1px solid var(--lk-border);',
    '  border-radius: 14px;',
    '  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.22);',
    '  overflow: hidden;',
    '  text-align: left;',
    '  animation: lock-rise 0.4s ease-out;',
    '}',
    '@keyframes lock-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }',
    '/* 终端窗标题栏：三色圆点（12px 仿 macOS）+ 居中标题 + 虚线分隔 */',
    '#site-lock-overlay .lock-bar {',
    '  display: flex; align-items: center; gap: 8px;',
    '  padding: 10px 14px;',
    '  border-bottom: 1px dashed var(--lk-border);',
    '}',
    '#site-lock-overlay .lock-bar i { flex: none; width: 12px; height: 12px; border-radius: 50%; }',
    '#site-lock-overlay .lock-bar .lock-title {',
    '  flex: 1; min-width: 0; margin-left: 2px;',
    '  font: 400 12px/18px -apple-system, "SF Pro Text", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif;',
    '  color: var(--lk-muted);',   /* 与 macOS 标题栏一致：偏灰的系统字体 */
    '  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;', /* 窗口过窄时省略 */
    '}',
    '#site-lock-overlay .lock-bar .r { background: #e0574f; }',  /* 关闭 */
    '#site-lock-overlay .lock-bar .y { background: #e8b23c; }',  /* 最小化 */
    '#site-lock-overlay .lock-bar .g { background: #52b87a; }',  /* 放大：取站点绿 */
    '/* 窗体内容 */',
    '#site-lock-overlay .lock-body { padding: 30px 26px 22px; }',
    '/* 品牌行：logo + 站名 */',
    '#site-lock-overlay .lock-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }',
    '#site-lock-overlay .lock-brand img { width: 30px; height: 30px; }',
    '#site-lock-overlay .lock-brand h1 { margin: 0; font-size: 17px; font-weight: 600; color: var(--lk-ink); letter-spacing: 0.4px; }',
    '/* 提示符 ❯ 统一绿色 */',
    '#site-lock-overlay .prompt { color: var(--lk-accent); font-weight: 600; }',
    '/* 命令回显行 */',
    '#site-lock-overlay .lock-cmd { margin: 0 0 12px; font-size: 13px; color: var(--lk-muted); }',
    '/* 输入行：底部虚线，输入框无边框融入其中 */',
    '#site-lock-overlay .lock-form .lock-line {',
    '  display: flex; align-items: center; gap: 8px;',
    '  padding-bottom: 10px;',
    '  border-bottom: 1px dashed var(--lk-border);',
    '}',
    '#site-lock-overlay .lock-label { font-size: 13px; color: var(--lk-muted); }',
    '#site-lock-overlay .lock-input {',
    '  flex: 1; min-width: 0; padding: 0;',
    '  background: transparent; border: 0; outline: 0;',
    '  font: inherit; color: var(--lk-ink);',
    '  caret-color: var(--lk-accent);',   /* 光标也是绿色，呼应终端 */
    '}',
    '/* 解锁按钮：幽灵按钮，悬浮时反色填充 */',
    '#site-lock-overlay .lock-btn {',
    '  flex: none; padding: 8px 14px;',
    '  font: 600 13px ui-monospace, "SF Mono", Consolas, monospace;',
    '  color: var(--lk-accent); background: transparent;',
    '  border: 1px solid var(--lk-accent); border-radius: 8px;',
    '  cursor: pointer;',
    '  transition: background 0.15s ease, color 0.15s ease;',
    '}',
    '#site-lock-overlay .lock-btn:hover { background: var(--lk-accent); color: #fff; }',
    '/* 输出行：错误/成功以命令输出形式显示，默认空行占位 */',
    '#site-lock-overlay .lock-out { margin: 12px 0 0; min-height: 20px; font-size: 13px; }',
    '#site-lock-overlay .lock-out.lock-err { color: var(--lk-error); }',
    '#site-lock-overlay .lock-out.lock-ok { color: var(--lk-accent); }',
    '/* 底部提示 */',
    '#site-lock-overlay .lock-hint { margin: 14px 0 0; font-size: 11px; color: var(--lk-muted); opacity: 0.75; }',
    '/* 输错密码：终端窗整体抖动 */',
    '#site-lock-overlay .lock-window.lock-shake { animation: lock-shake 0.4s ease; }',
    '@keyframes lock-shake {',
    '  10%, 90% { transform: translateX(-2px); }',
    '  20%, 80% { transform: translateX(4px); }',
    '  30%, 50%, 70% { transform: translateX(-6px); }',
    '  40%, 60% { transform: translateX(6px); }',
    '}',
    '/* 解锁成功：遮罩淡出 */',
    '#site-lock-overlay.lock-success { opacity: 0; visibility: hidden; }',
    '/* 导航栏右侧“关机键”：退出锁定（仅解锁后出现，默认继承导航栏白色） */',
    '#site-lock-exit {',
    '  display: inline-flex; align-items: center; justify-content: center;',
    '  cursor: pointer; opacity: 0.85;',
    '  transition: opacity 0.15s ease, color 0.15s ease;',
    '}',
    '/* 悬浮/按下时变鲜红（苹果系统红），并恢复不透明 */',
    '#site-lock-exit:hover, #site-lock-exit:active {',
    '  color: #ff3b30 !important;', /* !important 覆盖导航栏强制白色 */
    '  opacity: 1;',
    '}',
    '#site-lock-exit svg { display: block; }',
    '/* 尊重系统“减少动态效果”设置 */',
    '@media (prefers-reduced-motion: reduce) {',
    '  #site-lock-overlay .lock-window { animation: none; }',
    '  #site-lock-overlay .lock-window.lock-shake { animation: none; }',
    '}'
  ].join('\n');

  /* 注入锁屏样式 */
  var styleEl = document.createElement('style');
  styleEl.textContent = LOCK_CSS;
  document.head.appendChild(styleEl);

  /* ==================== SHA-256 校验 ==================== */
  // 优先使用浏览器 WebCrypto；不可用（个别 file:// 场景）时走内置纯 JS 实现兜底
  function sha256Fallback(ascii) {
    function rightRotate(v, a) { return (v >>> a) | (v << (32 - a)); }
    var i, j, result = '';
    var words = [], asciiBitLength = ascii.length * 8;
    var hash = sha256Fallback.h = sha256Fallback.h || [];
    var k = sha256Fallback.k = sha256Fallback.k || [];
    var primeCounter = k.length;
    var isComposite = {};
    // 用前 64 个质数初始化哈希初值与常量表
    for (var candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) isComposite[i] = candidate;
        hash[primeCounter] = (Math.pow(candidate, 0.5) * 0x100000000) | 0;
        k[primeCounter++] = (Math.pow(candidate, 1 / 3) * 0x100000000) | 0;
      }
    }
    // 补位：追加 0x80，补 0x00 直到长度余 64 为 56
    ascii += '\x80';
    while (ascii.length % 64 !== 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // 仅支持 ASCII 输入（本站密码为 ASCII）
      words[i >> 2] |= j << ((3 - i) % 4) * 8;
    }
    words[words.length] = (asciiBitLength / 0x100000000) | 0; // 长度高 32 位
    words[words.length] = asciiBitLength;                      // 长度低 32 位
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16);
      var oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2];
        var a = hash[0], e = hash[4];
        var temp1 = hash[7]
          + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
          + ((e & hash[5]) ^ ((~e) & hash[6]))
          + k[i]
          + (w[i] = (i < 16) ? w[i] : (
              w[i - 16]
              + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
              + w[i - 7]
              + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
            ) | 0);
        var temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
          + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
    }
    for (i = 0; i < 8; i++) {
      for (j = 3; j >= 0; j--) {
        var b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result;
  }

  // 计算字符串的 SHA-256 十六进制哈希（优先 WebCrypto）
  function sha256(text) {
    if (window.crypto && crypto.subtle) {
      return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
        .then(function (buf) {
          return Array.from(new Uint8Array(buf)).map(function (b) {
            return b.toString(16).padStart(2, '0');
          }).join('');
        })
        .catch(function () { return sha256Fallback(text); });
    }
    return Promise.resolve(sha256Fallback(text));
  }

  /* ==================== 主题判断 ==================== */
  // 与 theme-switcher.js 保持一致：读 localStorage.theme；未设置时默认浅色（与站点一致）
  function isDarkTheme() {
    var t = localStorage.getItem('theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    if (t === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches;
    return false;
  }

  /* ==================== 解锁状态判断 ==================== */
  function isAuthed() {
    var saved = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY) || '0', 10);
    return saved > 0 && (Date.now() - saved < CONFIG.REMEMBER_DAYS * 24 * 60 * 60 * 1000);
  }

  /* ==================== 导航栏“关机键” ==================== */
  // 关机符号：居中的竖线 + 开口圆环（继承导航栏文字颜色）
  var POWER_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 3v8"/><path d="M6.34 6.5a8 8 0 1 0 11.32 0"/></svg>';

  function showExitButton() {
    var btn = document.createElement('a');
    btn.id = 'site-lock-exit';
    btn.setAttribute('title', '退出锁定');
    btn.setAttribute('aria-label', '退出锁定');
    btn.innerHTML = POWER_SVG;
    btn.addEventListener('click', function () {
      localStorage.removeItem(CONFIG.STORAGE_KEY); // 清除解锁标记
      location.reload();                           // 刷新回到锁屏
    });
    // 挂到导航栏最右侧；脚本在 <head> 执行时导航栏可能尚未生成，需等 DOM 就绪
    var nav = document.querySelector('nav.app-nav');
    if (nav) {
      nav.appendChild(btn);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        var readyNav = document.querySelector('nav.app-nav');
        (readyNav || document.body).appendChild(btn);
      });
    }
  }

  /* ==================== 锁屏遮罩 ==================== */
  function buildOverlay() {
    var overlay = document.createElement('div');
    overlay.id = 'site-lock-overlay';
    overlay.innerHTML =
      '<div class="lock-window">' +
      '  <div class="lock-bar"><i class="r"></i><i class="y"></i><i class="g"></i><span class="lock-title">y10111.github.io — docsify serve — 80×24</span></div>' +
      '  <div class="lock-body">' +
      '    <div class="lock-brand"><img src="_media/icon.svg" alt="logo"><h1>Study Notes</h1></div>' +
      '    <p class="lock-cmd"><span class="prompt">❯</span> access study-notes</p>' +
      '    <form class="lock-form">' +
      '      <div class="lock-line">' +
      '        <span class="prompt">❯</span>' +
      '        <span class="lock-label">password</span>' +
      '        <input class="lock-input" type="password" placeholder="输入访问密码" autocomplete="current-password">' +
      '        <button class="lock-btn" type="submit">解锁</button>' +
      '      </div>' +
      '    </form>' +
      '    <p class="lock-out"></p>' +
      '    <p class="lock-hint">enter 提交 · 解锁后 7 天内免输</p>' +
      '  </div>' +
      '</div>';
    if (isDarkTheme()) {
      overlay.classList.add('lock-dark');
      document.documentElement.classList.add('lock-dark'); // 供退出按钮等元素跟随配色
    }

    var windowEl = overlay.querySelector('.lock-window');
    var form = overlay.querySelector('.lock-form');
    var input = overlay.querySelector('.lock-input');
    var outEl = overlay.querySelector('.lock-out');
    var titleEl = overlay.querySelector('.lock-title');

    // 标题栏写实：本地是 node docsify serve，线上是 GitHub Pages，file:// 是直接打开
    function serverName() {
      var h = location.hostname;
      if (h === 'y10111.github.io') return 'GitHub Pages';
      if (h === 'localhost' || h === '127.0.0.1') return 'node docsify serve';
      return 'local file';
    }

    // 尺寸写实：按终端窗实际像素换算 列×行（每列约 8px、每行约 20px），窗口变化时同步
    function refreshTitle() {
      var rect = windowEl.getBoundingClientRect();
      var cols = Math.max(20, Math.floor((rect.width - 28) / 8));
      var rows = Math.max(4, Math.floor((rect.height - 34) / 20));
      titleEl.textContent = 'y10111.github.io — ' + serverName() + ' — ' + cols + '×' + rows;
    }

    // 输出行：错误红"拒绝访问"，成功后绿"解锁成功"
    function printOut(text, type) {
      outEl.textContent = text;
      outEl.className = 'lock-out' + (type ? ' lock-' + type : '');
    }

    // 输错密码：命令输出 + 终端窗抖动
    function showError() {
      printOut('✗ 拒绝访问：密码错误', 'err');
      windowEl.classList.remove('lock-shake');
      void windowEl.offsetWidth;           // 强制回流，让抖动动画可以重复触发
      windowEl.classList.add('lock-shake');
      input.select();
    }

    // 提交密码：校验 SHA-256 是否与配置一致
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var pass = input.value;
      if (!pass) { showError(); return; }
      sha256(pass).then(function (hash) {
        if (hash === CONFIG.PASSWORD_HASH) {
          localStorage.setItem(CONFIG.STORAGE_KEY, String(Date.now())); // 记录解锁时间
          printOut('✓ 解锁成功', 'ok');                                // 先报成功再淡出
          setTimeout(function () {
            showExitButton();
            overlay.classList.add('lock-success');
            setTimeout(function () { overlay.remove(); }, 450);
          }, 420);
        } else {
          showError();
        }
      });
    });

    document.documentElement.appendChild(overlay);
    refreshTitle();                                        // 挂载后按实际尺寸填写标题
    window.addEventListener('resize', refreshTitle);       // 窗口尺寸变化时同步
    setTimeout(function () { input.focus(); }, 80); // 窗口淡入后再聚焦输入框
  }

  /* ==================== 入口 ==================== */
  if (isAuthed()) {
    if (isDarkTheme()) document.documentElement.classList.add('lock-dark');
    showExitButton(); // 已在有效期内，直接放行
  } else {
    buildOverlay();   // 未解锁，盖住全站
  }
})();