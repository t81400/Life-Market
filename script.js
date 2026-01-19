/**
 * Life Market - Member Card Generator
 * Logic for image upload, name input, croppie integration, and checkout navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadText = document.getElementById('upload-text');
    const uploadZone = document.getElementById('upload-zone');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');
    const cropperContainer = document.getElementById('cropper-container');

    let cropperInstance = null;

    // 點擊區域一律觸發檔案選擇
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // 安全檢查
        if (!file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            // 如果已有實例，先銷毀 (無縫替換關鍵)
            if (cropperInstance) {
                cropperInstance.destroy();
            }

            uploadText.style.display = 'none';
            uploadZone.style.border = 'none';

            cropperInstance = new Croppie(cropperContainer, {
                viewport: { width: 80, height: 105, type: 'square' },
                boundary: { width: 80, height: 105 },
                showZoomer: true,
                enableOrientation: true
            });
            cropperInstance.bind({ url: event.target.result });
        };
        reader.readAsDataURL(file);
    });

    // 結帳邏輯與資料持久化 (LocalStorage)
    btnCheckout.addEventListener('click', () => {
        const name = memberNameInput.value.trim();
        if (!name) { alert('請先輸入會員姓名'); return; }

        if (cropperInstance) {
            cropperInstance.result('base64').then(base64 => {
                localStorage.setItem('cropped_image', base64);
                localStorage.setItem('life_market_member_name', name);
                window.location.href = 'checkout.html';
            });
        } else {
            localStorage.setItem('life_market_member_name', name);
            window.location.href = 'checkout.html';
        }
    });

    // Initialize Name from LocalStorage if exists
    const savedName = localStorage.getItem('life_market_member_name');
    if (savedName) {
        memberNameInput.value = savedName;
    }
});
