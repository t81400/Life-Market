/**
 * 人生超市 - 會員系統核心邏輯 (同步渲染穩定版)
 */
document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        fileInput: document.getElementById('file-input'),
        uploadZone: document.getElementById('upload-zone'),
        uploadText: document.getElementById('upload-text'),
        cropperContainer: document.getElementById('cropper-container'),
        uploadContainer: document.querySelector('.upload-container-modal'),
        btnCheckout: document.getElementById('btn-checkout'),
        modal: document.getElementById('edit-modal'),
        btnConfirm: document.getElementById('confirm-generate'),
        btnCancel: document.getElementById('cancel-edit'),
        nameInput: document.getElementById('member-name-modal'),
        homeView: document.querySelector('.layer-visual'),
        menuView: document.getElementById('menu-view'),
        displayName: document.getElementById('display-member-name'),
        btnBackToHome: document.getElementById('btn-back-to-home') || document.querySelector('.user-badge')
    };

    let cropperInstance = null;

    function initCropper(imageSrc) {
        // 1. 清理舊實例
        if (cropperInstance) {
            cropperInstance.destroy();
            elements.cropperContainer.innerHTML = '';
        }

        // 2. 核心修正：強制瀏覽器重繪，確認容器寬高
        const w = elements.uploadZone.offsetWidth;
        const h = elements.uploadZone.offsetHeight;

        // 3. 立即初始化，不再使用 setTimeout
        cropperInstance = new Croppie(elements.cropperContainer, {
            viewport: { width: w - 2, height: h - 2, type: 'square' },
            boundary: { width: w, height: h },
            showZoomer: false,
            enableOrientation: true,
            enableZoom: true,
            mouseWheelZoom: true,
            enforceBoundary: false
        });

        // 4. 綁定圖片
        cropperInstance.bind({
            url: imageSrc,
            zoom: 0
        }).then(() => {
            // 綁定成功後再次微調，解決手機端首幀不顯示問題
            cropperInstance.setZoom(0);
        });
    }

    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        elements.cropperContainer.innerHTML = '';
        if (elements.uploadText) elements.uploadText.style.display = 'block';
        if (elements.uploadContainer) elements.uploadContainer.classList.remove('has-photo');
        elements.fileInput.value = '';
    }

    // 事件監聽邏輯
    if (elements.btnCheckout) {
        elements.btnCheckout.addEventListener('click', () => {
            elements.modal.style.display = 'flex';
            resetUploader();
        });
    }

    if (elements.btnCancel) {
        elements.btnCancel.addEventListener('click', () => {
            elements.modal.style.display = 'none';
        });
    }

    if (elements.uploadZone) {
        elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    }

    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // 先切換 CSS 狀態，再初始化裁切器
                if (elements.uploadText) elements.uploadText.style.display = 'none';
                if (elements.uploadContainer) elements.uploadContainer.classList.add('has-photo');
                initCropper(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    // 確認製作
    elements.btnConfirm.addEventListener('click', async () => {
        const name = elements.nameInput.value.trim();
        if (!name) return alert('請輸入會員姓名');
        if (!cropperInstance) return alert('請先上傳照片');

        elements.btnConfirm.textContent = "製作中...";
        elements.btnConfirm.disabled = true;

        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport',
                format: 'png',
                quality: 1
            });

            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);
            if (elements.displayName) elements.displayName.textContent = name;

            elements.modal.style.display = 'none';
            if (elements.homeView) elements.homeView.style.display = 'none';
            if (elements.menuView) elements.menuView.style.display = 'flex';

        } catch (err) {
            console.error(err);
            alert("處理出錯");
        } finally {
            elements.btnConfirm.textContent = "確認製作並進店";
            elements.btnConfirm.disabled = false;
        }
    });

    // 重新辦卡
    if (elements.btnBackToHome) {
        elements.btnBackToHome.addEventListener('click', () => {
            if (confirm('確定要重新辦卡嗎？')) {
                if (elements.menuView) elements.menuView.style.display = 'none';
                if (elements.homeView) elements.homeView.style.display = 'block';
                elements.nameInput.value = '';
                resetUploader();
            }
        });
    }
});
