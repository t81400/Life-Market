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

        cropperInstance = new Croppie(cropperContainer, {
            viewport: { width: 80, height: 105, type: 'square' },
            boundary: { width: 80, height: 105 },
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
                // 移除 btnCancel.style.display = 'flex'
                initCroppie(event.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    // Initialize Name from LocalStorage if exists
    const savedName = localStorage.getItem('life_market_member_name');
    if (savedName) {
        memberNameInput.value = savedName;
    }

    // Input Persistence
    memberNameInput.addEventListener('input', (e) => {
        localStorage.setItem('life_market_member_name', e.target.value);
    });

    // 結帳邏輯保留
    btnCheckout.addEventListener('click', () => {
        const name = memberNameInput.value.trim();
        if (!name) { alert('請先輸入會員姓名'); return; }

        // 如果有調整照片，可以在這裡取得調整後的結果 (Base64)
        if (cropperInstance) {
            cropperInstance.result('base64').then(base64 => {
                localStorage.setItem('cropped_image', base64);
                window.location.href = 'checkout.html';
            });
        } else {
            localStorage.setItem('life_market_member_name', name);
            window.location.href = 'checkout.html';
        }
    });
});
