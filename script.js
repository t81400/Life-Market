/**
 * Life Market - Member Card Generator (Modal & Realistic Preview Version)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 元件宣告 ---
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const cropperContainer = document.getElementById('cropper-container');
    
    // 主畫面按鈕
    const btnCheckout = document.getElementById('btn-checkout');
    
    // 彈窗元件 (使用你 HTML 中的新 ID)
    const modal = document.getElementById('edit-modal');
    const btnConfirm = document.getElementById('confirm-generate');
    const btnCancel = document.getElementById('cancel-edit');
    const memberNameInputModal = document.getElementById('member-name-modal');

    let cropperInstance = null;

    // --- 2. 彈窗控制邏輯 ---
    
    // 點擊「開始結帳」 -> 打開彈窗
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
        // 確保彈窗打開後，如果已經有圖片，重新計算尺寸
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
            uploadText.style.display = 'flex';
        }
    });

    // 點擊「返回修改」 -> 關閉彈窗
    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 3. 照片上傳與裁切 (Croppie) 邏輯 ---

    uploadZone.addEventListener('click', () => fileInput.click());

    function initCroppie(src) {
        if (cropperInstance) cropperInstance.destroy();

        // 取得彈窗內預覽框的精確尺寸
        const width = cropperContainer.offsetWidth;
        const height = cropperContainer.offsetHeight;

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
                // 延時確保 CSS 渲染完成再初始化，避免縫隙
                setTimeout(() => {
                    initCroppie(event.target.result);
                }, 200);
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. 最終合成與下載邏輯 ---

    btnConfirm.addEventListener('click', async () => {
        // 【關鍵修改】改抓彈窗內的輸入框值
        const name = memberNameInputModal.value.trim();
        
        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請上傳會員照片'); return; }

        btnConfirm.textContent = "正在製作...";
        btnConfirm.disabled = true;

        // A. 建立畫布
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const bgImg = new Image();
        bgImg.src = '會員卡.png'; 

        bgImg.onload = async () => {
            canvas.width = bgImg.width;
            canvas.height = bgImg.height;
            ctx.drawImage(bgImg, 0, 0);

            // B. 取得裁切照片
            const croppedDataUrl = await cropperInstance.result({
                type: 'base64',
                size: 'original',
                format: 'png',
                quality: 1
            });

            const photoImg = new Image();
            photoImg.src = croppedDataUrl;
            photoImg.onload = () => {
                // C. 繪製照片 (座標對應 CSS 中的 0.12, 0.35)
                const photoW = canvas.width * 0.22;
                const photoH = photoW * (4 / 3);
                ctx.drawImage(photoImg, canvas.width * 0.12, canvas.height * 0.35, photoW, photoH);

                // D. 繪製姓名 (座標對應 CSS 中的 0.40, 0.52)
                ctx.fillStyle = "#000000";
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                const fontSize = Math.round(canvas.height * 0.05);
                ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
                
                const textX = canvas.width * 0.40;
                const textY = canvas.height * 0.52;
                ctx.fillText(`會員姓名：${name}`, textX, textY);

                // E. 產出並下載
                const finalDataUrl = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `人生超市會員卡-${name}.png`;
                link.href = finalDataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // F. 恢復狀態
                btnConfirm.textContent = "確認製作並下載";
                btnConfirm.disabled = false;
                modal.style.display = 'none';
                alert('結帳完成！');
            };
        };
    });
});
