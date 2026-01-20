document.addEventListener('DOMContentLoaded', () => {
    let cropperInstance = null;
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const cropperContainer = document.getElementById('cropper-container');
    const uploadHint = document.getElementById('upload-hint');

    // 點擊區域觸發上傳
    uploadZone.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadHint.style.display = 'none';
            cropperContainer.style.display = 'block';
            
            if (cropperInstance) cropperInstance.destroy();
            
            // 初始化 Croppie：這就是你要的自動縮放功能
            cropperInstance = new Croppie(cropperContainer, {
                viewport: { width: 80, height: 105, type: 'square' }, // 3:4 比例
                boundary: { width: 80, height: 105 },
                showZoomer: false, // 隱藏滑桿，改用手指/滾輪縮放
                enableOrientation: true,
                mouseWheelZoom: true
            });
            cropperInstance.bind({ url: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    // 結帳合成
    document.getElementById('btn-checkout').onclick = async () => {
        const name = document.getElementById('member-name').value;
        if (!name) { alert('請輸入會員姓名'); return; }

        const canvas = document.getElementById('cardCanvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.src = '會員卡.png';

        bgImg.onload = async () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            if (cropperInstance) {
                // 取得裁切後的圖片
                const photoBase64 = await cropperInstance.result({ type: 'base64', size: 'original' });
                const photoImg = new Image();
                photoImg.src = photoBase64;
                photoImg.onload = () => {
                    // 繪製照片到畫布的正確位置
                    ctx.drawImage(photoImg, canvas.width * 0.142, canvas.height * 0.545, canvas.width * 0.23, canvas.width * 0.23 * 1.33);
                    
                    // 繪製姓名
                    ctx.font = "bold 42px Arial";
                    ctx.fillText(name, canvas.width * 0.45, canvas.height * 0.635);

                    // 顯示合成圖並下載
                    const finalData = canvas.toDataURL('image/png');
                    const display = document.getElementById('final-card-img');
                    display.src = finalData;
                    display.style.display = 'block';

                    const link = document.createElement('a');
                    link.download = 'my-life-card.png';
                    link.href = finalData;
                    link.click();
                };
            }
        };
    };
});
