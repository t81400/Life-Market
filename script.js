/**
 * Life Market - Member Card Generator (Modal Version)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 元件宣告 ---
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const cropperContainer = document.getElementById('cropper-container');
    const memberNameInput = document.getElementById('member-name');
    
    // 主畫面按鈕
    const btnCheckout = document.getElementById('btn-checkout');
    
    // 彈窗元件
    const modal = document.getElementById('edit-modal');
    const btnConfirm = document.getElementById('confirm-generate');
    const btnCancel = document.getElementById('cancel-edit');

    let cropperInstance = null;

    // --- 2. 彈窗控制邏輯 ---
    
    // 點擊主畫面「開始結帳」 -> 打開彈窗
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // 點擊「取消/返回」 -> 關閉彈窗
    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 3. 照片上傳與裁切 (Croppie) 邏輯 ---

    uploadZone.addEventListener('click', () => fileInput.click());

    function initCroppie(src) {
        if (cropperInstance) cropperInstance.destroy();

        // 彈窗內的容器尺寸
        const width = cropperContainer.offsetWidth || 140;
        const height = cropperContainer.offsetHeight || 186;

        cropperInstance = new Croppie(cropperContainer, {
            viewport: { width: width, height: height, type: 'square' },
            boundary: { width: width, height: height },
            showZoomer: false,
            enableOrientation: true,
            mouseWheelZoom: true,
            enableZoom: true
        });
        cropperInstance.bind({ url: src });
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                cropperContainer.style.display = 'block';
                // 給瀏覽器時間渲染彈窗內容
                setTimeout(() => {
                    initCroppie(event.target.result);
                }, 150);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. 最終合成與下載邏輯 (點擊彈窗內的確認製作) ---

    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInput.value.trim();
        if (!name) { alert('請先輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請先上傳照片'); return; }

        // 顯示處理中（可選）
        btnConfirm.textContent = "處理中...";
        btnConfirm.disabled = true;

        // A. 建立畫布
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.src = '會員卡.png'; 

        bgImg.onload = async () => {
            // B. 設定尺寸
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            // C. 取得裁切照片
            const croppedDataUrl = await cropperInstance.result({
                type: 'base64',
                size: 'original',
                format: 'png',
                quality: 1
            });

            const photoImg = new Image();
            photoImg.src = croppedDataUrl;
            photoImg.onload = () => {
                // D. 繪製照片 (已調校座標)
                const photoW = canvas.width * 0.22;
                const photoH = photoW * (4 / 3);
                ctx.drawImage(photoImg, canvas.width * 0.12, canvas.height * 0.35, photoW, photoH);

                // E. 繪製姓名 (已調校座標)
                ctx.fillStyle = "#000000";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                const fontSize = Math.round(canvas.height * 0.05);
                ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                
                const textX = canvas.width * 0.40;
                const textY = canvas.height * 0.52;
                ctx.fillText(`會員姓名：${name}`, textX, textY);

                // F. 產出並下載
                const finalDataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `人生超市會員卡-${name}.png`;
                link.href = finalDataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // G. 恢復按鈕並關閉彈窗
                btnConfirm.textContent = "確認製作並下載";
                btnConfirm.disabled = false;
                modal.style.display = 'none';
                alert('結帳完成！會員卡已準備下載。');
            };
        };
    });
});
