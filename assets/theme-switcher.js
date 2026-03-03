// 等待 DOM 完全加载完成后执行代码
document.addEventListener('DOMContentLoaded', function () {
  // 获取主题样式链接元素，用于动态切换主题样式
  const themeStyle = document.getElementById('theme-style');
  console.log('获取到的主题样式链接元素:', themeStyle);

  // 定义主题样式的 URL 映射，方便根据主题名称获取对应的样式文件 URL
  const themeUrls = {
      light: "//cdn.jsdelivr.net/npm/docsify/themes/vue.css",
      dark: "//cdn.jsdelivr.net/npm/docsify/themes/dark.css"
  };

  // 从 localStorage 中获取之前保存的主题设置
  const savedTheme = localStorage.getItem('theme');
  console.log('从 localStorage 中获取到的主题设置:', savedTheme);

  // 检查设备的主题偏好，判断设备是否偏好深色模式
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  console.log('设备是否偏好深色主题:', prefersDarkScheme.matches);

  /**
   * 根据缓存或当前页面主题设置初始主题
   */
  function setInitialTheme() {
      console.log('开始执行 setInitialTheme 函数');
      if (savedTheme) {
          console.log('存在缓存主题设置:', savedTheme);
          // 如果缓存主题为跟随系统，则调用 applySystemTheme 函数
          if (savedTheme === 'system') {
              console.log('缓存主题为跟随系统，调用 applySystemTheme 函数');
              applySystemTheme();
          } else {
              // 否则，调用 applyTheme 函数应用缓存的具体主题
              console.log('缓存主题为具体主题，调用 applyTheme 函数，主题:', savedTheme);
              applyTheme(savedTheme);
          }
      } else {
          console.log('没有缓存主题设置，根据当前页面主题设置');
          // 获取当前页面正在使用的主题样式的 URL
          const currentThemeUrl = themeStyle.href;
          console.log('当前页面的主题链接:', currentThemeUrl);
          // 根据当前页面主题链接判断并应用相应主题
          if (currentThemeUrl.includes('vue.css')) {
              console.log('当前页面使用浅色主题，调用 applyTheme 函数，主题: light');
              applyTheme('light');
          } else if (currentThemeUrl.includes('dark.css')) {
              console.log('当前页面使用深色主题，调用 applyTheme 函数，主题: dark');
              applyTheme('dark');
          }
      }
      // 根据初始主题设置菜单项的样式
      setMenuItemStyle(savedTheme || (themeStyle.href.includes('vue.css') ? 'light' : 'dark'));
  }

  /**
   * 应用系统主题，根据设备主题偏好选择相应主题
   */
  function applySystemTheme() {
      console.log('开始执行 applySystemTheme 函数');
      // 根据设备主题偏好确定要应用的主题
      const newTheme = prefersDarkScheme.matches ? 'dark' : 'light';
      console.log('根据设备主题偏好，应应用的主题:', newTheme);
      // 调用 applyTheme 函数应用确定的主题
      applyTheme(newTheme);
      // 将 localStorage 中的主题设置为跟随系统
      localStorage.setItem('theme', 'system');
      // 设置“Follow System”菜单项的样式
      setMenuItemStyle('system');
  }

  /**
   * 应用指定主题，更新主题样式并保存到 localStorage
   * @param {string} theme - 要应用的主题名称
   */
  function applyTheme(theme) {
      console.log('开始执行 applyTheme 函数，要应用的主题:', theme);
      // 保存旧的主题样式 URL
      const oldHref = themeStyle.href;
      // 更新主题样式链接
      themeStyle.href = themeUrls[theme];

      // 监听样式文件加载成功事件
      themeStyle.onload = function () {
          console.log('主题样式文件加载成功:', themeUrls[theme]);
          // 可添加更多验证逻辑，比如检查页面元素样式是否更新
          const bodyBgColor = window.getComputedStyle(document.body).backgroundColor;
          console.log('当前页面 body 背景颜色:', bodyBgColor);
      };

      // 监听样式文件加载失败事件
      themeStyle.onerror = function () {
          console.error('主题样式文件加载失败:', themeUrls[theme]);
          // 若加载失败，恢复旧的主题样式
          themeStyle.href = oldHref;
      };

      // 将选择的主题保存到 localStorage
      localStorage.setItem('theme', theme);
      console.log('已应用主题:', theme, '并保存到 localStorage');
      // 设置对应菜单项的样式
      setMenuItemStyle(theme);
  }

  /**
   * 设置菜单项的样式，根据选择的主题加粗并设置颜色
   * @param {string} selectedTheme - 选择的主题名称
   */
  function setMenuItemStyle(selectedTheme) {
      // 获取所有主题菜单项
      const themeItems = document.querySelectorAll('.theme-switch ul li');
      // 移除所有菜单项的加粗和颜色样式
      themeItems.forEach(item => {
          item.style.fontWeight = 'normal';
          item.style.color = '';
      });
      // 找到选择的主题对应的菜单项
      const selectedItem = Array.from(themeItems).find(item => item.dataset.theme === selectedTheme);
      if (selectedItem) {
          // 加粗选择的菜单项
          selectedItem.style.fontWeight = 'bold';
          // 根据不同主题设置菜单项颜色
          if (selectedTheme === 'light') {
              selectedItem.style.color = '#7cc198';
          } else if (selectedTheme === 'dark') {
              selectedItem.style.color = '#da8d7a';
          } else if (selectedTheme === 'system') {
              // 对于“Follow System”，根据设备主题偏好设置颜色
              selectedItem.style.color = prefersDarkScheme.matches ? '#da8d7a' : '#7cc198';
          }
      }
  }

  // 获取所有主题菜单项
  const themeItems = document.querySelectorAll('.theme-switch ul li');
  console.log('获取到的主题菜单项数量:', themeItems.length);
  if (themeItems.length === 0) {
      console.error('未找到任何主题菜单项，请检查 HTML 结构。');
  } else {
      // 为每个菜单项添加点击事件监听器
      themeItems.forEach((item, index) => {
          console.log(`为第 ${index + 1} 个菜单项绑定点击事件，主题:`, item.dataset.theme);
          item.addEventListener('click', function () {
              const selectedTheme = this.dataset.theme;
              console.log('用户点击了菜单项，选择的主题:', selectedTheme);
              if (selectedTheme === 'system') {
                  console.log('用户选择跟随系统，调用 applySystemTheme 函数');
                  applySystemTheme();
              } else {
                  console.log('用户选择具体主题，调用 applyTheme 函数，主题:', selectedTheme);
                  applyTheme(selectedTheme);
              }
          });
      });
  }

  // 监听设备主题偏好的变化
  prefersDarkScheme.addEventListener('change', function () {
      console.log('设备主题偏好发生变化');
      const storedTheme = localStorage.getItem('theme');
      console.log('localStorage 中存储的主题:', storedTheme);
      if (storedTheme === 'system') {
          console.log('当前主题设置为跟随系统，调用 applySystemTheme 函数');
          applySystemTheme();
      }
  });

  // 调用 setInitialTheme 函数设置初始主题
  setInitialTheme();
});