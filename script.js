document.addEventListener('DOMContentLoaded', () => {
    let cropperInstance = null;
    const modal = document.getElementById('edit-modal');
    const fileInput = document.getElementById('file-input');

    // 開關彈窗
    document.getElementById('btn-start-edit').onclick = () => modal.style.display = 'flex';
    document.getElementById('btn-close-modal').onclick = () => modal.style.display = 'none';
    document.getElementById('modal-upload-trigger').onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('modal-upload-trigger').style.display = 'none';
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

    document.getElementById('btn-generate').onclick = async () => {
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
                    // 精確坐標對位 (基於 1000x1400 比例)
                    ctx.drawImage(photoImg, canvas.width * 0.142, canvas.height * 0.545, canvas.width * 0.23, canvas.width * 0.23 * 1.33);

                    // 繪製姓名
                    ctx.font = "bold 45px Arial";
                    ctx.fillStyle = "black";
                    ctx.fillText(name, canvas.width * 0.45, canvas.height * 0.63);

                    const finalData = canvas.toDataURL('image/png');
                    document.getElementById('final-card-img').src = finalData;
                    document.getElementById('final-result-display').style.display = 'block';
                    modal.style.display = 'none';

                    const link = document.createElement('a');
                    link.download = 'my-life-card.png';
                    link.href = finalData;
                    link.click();
                };
            }
        };
    };
});
