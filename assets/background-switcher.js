// 创建一个 style 元素，用于插入自定义的 CSS 样式
const style = document.createElement('style');

// 定义页面背景样式的 CSS 代码
// 背景图片不重复，固定在右下角，并且背景图片切换有 0.1 秒的过渡效果
// 当页面宽度小于等于 768px 时，不显示背景图片
style.textContent = `
body {
    /* background-image: url("./_media/image.png"); */
    background-repeat: no-repeat;
    background-position: right bottom;
    background-attachment: fixed;
    transition: background-image 0.1s ease;
}

@media (max-width: 768px) {
    body {
        background-image: none !important;
    }
}
`;

// 将 style 元素添加到文档的头部，使其生效
document.head.appendChild(style);

// 定义一个包含背景图片路径的数组
const images = [
    '../_media/image1.png',
    '../_media/image2.png',
    '../_media/image3.png',
];

// 初始化当前显示的图片索引，从第一张图片开始
let currentImageIndex = 0;

/**
 * 切换背景图片的函数
 * 该函数会将当前图片索引切换到下一张图片的索引，并更新页面的背景图片
 */
function changeBackgroundImage() {
    // 使用取模运算切换到下一张图片的索引
    currentImageIndex = (currentImageIndex + 1) % images.length;
    // 根据新的索引设置页面的背景图片
    document.body.style.backgroundImage = `url(${images[currentImageIndex]})`;
}

// 页面加载时，首次调用切换背景图片的函数，显示第一张背景图片
changeBackgroundImage();

/**
 * 从 URL 中提取路径部分的函数
 * @param {string} url - 完整的 URL 地址
 * @returns {string} - URL 的路径部分（问号之前的部分）
 */
function getPathFromURL(url) {
    // 通过分割字符串的方式获取问号之前的路径部分
    return url.split('?')[0];
}

/**
 * 监听地址栏 URL 路径变化的函数
 * 该函数会每隔 100 毫秒检查一次 URL 的路径部分是否发生变化
 * 如果路径部分发生变化，则调用切换背景图片的函数
 */
function listenToURLChanges() {
    // 获取当前 URL 的路径部分，并保存为上一次的路径
    let lastPath = getPathFromURL(window.location.href);

    // 每隔 100 毫秒执行一次检查
    setInterval(() => {
        // 获取当前 URL 的路径部分
        const currentPath = getPathFromURL(window.location.href);

        // 比较当前路径和上一次的路径是否不同
        if (currentPath !== lastPath) {
            // 如果不同，更新上一次的路径为当前路径
            lastPath = currentPath;
            // 调用切换背景图片的函数
            changeBackgroundImage();
        }
    }, 100);
}

// 启动地址栏 URL 路径变化的监听功能
listenToURLChanges();