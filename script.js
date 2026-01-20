document.addEventListener('DOMContentLoaded', () => {
    let cropperInstance = null;
    const modal = document.getElementById('edit-modal');
    const fileInput = document.getElementById('file-input');

    // 1. 修正按鈕點擊
    document.getElementById('btn-trigger-modal').onclick = () => { modal.style.display = 'flex'; };
    document.getElementById('btn-close').onclick = () => { modal.style.display = 'none'; };
    document.getElementById('upload-trigger').onclick = () => fileInput.click();

    // 2. 照片選取與裁剪
    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('upload-hint').style.display = 'none';
            if (cropperInstance) cropperInstance.destroy();
            cropperInstance = new Croppie(document.getElementById('cropper-container'), {
                viewport: { width: 120, height: 160, type: 'square' },
                boundary: { width: 150, height: 200 },
                showZoomer: false, enableZoom: true
            });
            cropperInstance.bind({ url: event.target.result });
        };
        reader.readAsDataURL(file);
    };

    // 3. 合成與下載
    document.getElementById('btn-save').onclick = async () => {
        const name = document.getElementById('member-name').value;
        if (!name) { alert('請輸入姓名'); return; }

        const canvas = document.getElementById('cardCanvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.src = '會員卡.png';

        bgImg.onload = async () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            if (cropperInstance) {
                const photoBase64 = await cropperInstance.result({ type: 'base64', size: 'original' });
                const photoImg = new Image();
                photoImg.src = photoBase64;
                photoImg.onload = () => {
                    // 根據圖檔精確座標繪製照片
                    ctx.drawImage(photoImg, canvas.width * 0.14, canvas.height * 0.54, canvas.width * 0.23, canvas.width * 0.23 * 1.33);
                    // 繪製姓名
                    ctx.font = "bold 42px Arial";
                    ctx.fillText(name, canvas.width * 0.45, canvas.height * 0.63);

                    const dataUrl = canvas.toDataURL('image/png');
                    document.getElementById('final-card-img').src = dataUrl;
                    document.getElementById('final-card-img').style.display = 'block';
                    modal.style.display = 'none';

                    // 下載
                    const link = document.createElement('a');
                    link.href = dataUrl;
                    link.download = 'my-life-card.png';
                    link.click();
                };
            }
        };
    };
});
