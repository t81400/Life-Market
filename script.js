/**
 * Life Market - Member Card Generator
 */

document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const btnCancel = document.getElementById('btn-cancel');
    const cropperContainer = document.getElementById('cropper-container');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');

    let cropperInstance = null;

    // 初始化 Croppie
    function initCroppie(src) {
        if (cropperInstance) cropperInstance.destroy();

        cropperInstance = new Croppie(cropperContainer, {
            viewport: { width: 80, height: 105, type: 'square' }, // 配合你的 3:4 比例
            boundary: { width: 80, height: 105 },
            showZoomer: true,
            enableOrientation: true
        });
        cropperInstance.bind({ url: src });
    }

    uploadZone.addEventListener('click', () => {
        if (!cropperInstance) fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                uploadZone.style.border = 'none';
                cropperContainer.style.display = 'block';
                btnCancel.style.display = 'flex';
                initCroppie(event.target.result);
            }
            reader.readAsDataURL(file);
        }
    });

    btnCancel.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        cropperContainer.style.display = 'none';
        uploadText.style.display = 'block';
        uploadZone.style.border = '1px dashed rgba(0,0,0,0.3)';
        btnCancel.style.display = 'none';
        fileInput.value = '';
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
            window.location.href = 'checkout.html';
        }
    });
});
