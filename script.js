/**
 * 人生超市 - 會員系統核心邏輯 (終極相容整合版)
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
        if (cropperInstance) {
            cropperInstance.destroy();
            elements.cropperContainer.innerHTML = '';
        }

        // 暴力破解 1：強制延遲執行，確保手機 DOM 已經完成渲染
        setTimeout(() => {
            let zoneW = elements.uploadZone.clientWidth;
            let zoneH = elements.uploadZone.clientHeight;

            // 暴力破解 2：如果還是抓不到，給予固定數值 (根據你設計稿的比例)
            if (zoneW <= 0) zoneW = 80;
            if (zoneH <= 0) zoneH = 110;

            cropperInstance = new Croppie(elements.cropperContainer, {
                viewport: { width: zoneW - 4, height: zoneH - 4, type: 'square' },
                boundary: { width: zoneW, height: zoneH },
                showZoomer: false,
                enableOrientation: true,
                mouseWheelZoom: true,
                enableZoom: true,
                enforceBoundary: false
            });

            cropperInstance.bind({
                url: imageSrc,
                zoom: 0
            }).then(() => {
                // 暴力破解 3：綁定後再次確認縮放
                setTimeout(() => cropperInstance.setZoom(0), 50);
            });
        }, 100); 
    }

    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        elements.cropperContainer.innerHTML = '';
        elements.uploadText.style.display = 'block';
        elements.uploadContainer.classList.remove('has-photo');
        elements.fileInput.value = '';
    }

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
                elements.uploadText.style.display = 'none';
                elements.uploadContainer.classList.add('has-photo');
                initCropper(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

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
            alert("照片處理出錯");
        } finally {
            elements.btnConfirm.textContent = "確認製作並進店";
            elements.btnConfirm.disabled = false;
        }
    });

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

function navigateTo(pageId) {
    alert(`歡迎來到【${pageId}】！`);
}
