/**
 * Life Market - Member Card Generator
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const cropperContainer = document.getElementById('cropper-container');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');

    let cropperInstance = null;

    // 點擊文字改為「照片」
    uploadText.textContent = "照片";

    // 無論何時點擊照片區域，都觸發選擇檔案
    uploadZone.addEventListener('click', () => fileInput.click());

    function initCroppie(src) {
        if (cropperInstance) cropperInstance.destroy();

        // Get the actual size of the container to match perfectly
        const width = cropperContainer.offsetWidth;
        const height = cropperContainer.offsetHeight;

        cropperInstance = new Croppie(cropperContainer, {
            viewport: { width: width, height: height, type: 'square' },
            boundary: { width: width, height: height },
            showZoomer: false,        // 隱藏滑桿
            enableOrientation: true,
            mouseWheelZoom: true,     // 支援滑鼠滾輪縮放
            enableZoom: true          // 確保支援手指捏合縮放 (Pinch to Zoom)
        });
        cropperInstance.bind({ url: src });
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                uploadZone.style.border = 'none';
                cropperContainer.style.display = 'block';

                // 給瀏覽器 100 毫秒的時間渲染容器，再啟動 Croppie
                setTimeout(() => {
                    initCroppie(event.target.result);
                }, 100);
            };
            // Error Handling: Handle file reading errors
            reader.onerror = (error) => {
                console.error("File reading failed:", error);
                alert("圖片讀取失敗，請重試 (Failed to read file)");
            };
            reader.readAsDataURL(file);
        }
    });

    // Initialize Name from LocalStorage if exists
    const savedName = localStorage.getItem('life_market_member_name');
    if (savedName) {
        memberNameInput.value = savedName;
    }

    // Performance: Debounce function to limit LocalStorage writes
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    const saveName = debounce((value) => {
        localStorage.setItem('life_market_member_name', value);
    }, 300);

    // Input Persistence
    memberNameInput.addEventListener('input', (e) => {
        saveName(e.target.value);
    });

    // 結帳邏輯：點擊「開始結帳」觸發合成
    btnCheckout.addEventListener('click', async () => {
        const name = memberNameInput.value.trim();
        if (!name) {
            alert('請先輸入會員姓名');
            return;
        }

        // 1. 建立畫布與工具
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.src = '會員卡.png'; // 確保路徑正確

        bgImg.onload = async () => {
            // 2. 設定畫布尺寸與背景圖一致
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            // 3. 取得 Croppie 裁切後的結果
            if (cropperInstance) {
                // result('base64') 會拿到你在框框內縮放、移動後的最終樣貌
                const croppedDataUrl = await cropperInstance.result({
                    type: 'base64',
                    size: 'original',
                    format: 'png',
                    quality: 1
                });

                const photoImg = new Image();
                photoImg.src = croppedDataUrl;
                photoImg.onload = () => {
                    // 1. 照片位置校準
                    // 原本 0.082 太靠左且太下面，我們向右移一點、向上提
                    const photoW = canvas.width * 0.22; 
                    const photoH = photoW * (4 / 3); 
                    
                    // 橫向改為 0.12 (12%), 縱向提到 0.35 (35%)
                    ctx.drawImage(photoImg, canvas.width * 0.12, canvas.height * 0.35, photoW, photoH);

                    // 2. 寫入姓名區塊
                    ctx.fillStyle = "#000000";
                    ctx.textAlign = "left";
                    
                    // A. 畫出固定標籤「會員姓名：」
                    ctx.font = "bold 45px -apple-system, sans-serif"; 
                    ctx.fillText("會員姓名：", canvas.width * 0.40, canvas.height * 0.53);

                    // B. 畫出使用者輸入的名字 (例如 "t")
                    // 我們把起始點往右移，對準標籤後方
                    ctx.font = "bold 45px -apple-system, sans-serif";
                    ctx.fillText(name, canvas.width * 0.58, canvas.height * 0.53);

                    // 3. 產出與下載
                    const finalDataUrl = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.download = `人生超市會員卡-${name}.png`;
                    link.href = finalDataUrl;
                    link.click();

                    alert('結帳完成！請檢查下載的圖片。');
                };
            } else {
                alert('請先上傳會員照片');
            }
        };
    });
});
