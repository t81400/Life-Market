document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const cropperContainer = document.getElementById('cropper-container');
    const uploadContainer = document.querySelector('.upload-container-modal');

    const btnCheckout = document.getElementById('btn-checkout');
    const modal = document.getElementById('edit-modal');
    const btnConfirm = document.getElementById('confirm-generate');
    const btnCancel = document.getElementById('cancel-edit');
    const memberNameInputModal = document.getElementById('member-name-modal');

    const menuItems = document.querySelectorAll('[data-action]');

    const homeView = document.querySelector('.layer-visual');
    const menuView = document.getElementById('menu-view');
    const displayMemberName = document.getElementById('display-member-name');

    const btnBackToHome = document.getElementById('btn-back-to-home') || document.querySelector('.user-badge');

    let cropperInstance = null;

    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        if (cropperContainer) {
            cropperContainer.innerHTML = '';
        }
        if (uploadText) {
            uploadText.style.display = 'block';
        }
        if (uploadContainer) {
            uploadContainer.classList.remove('has-photo');
        }
        fileInput.value = '';
    }

    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            modal.style.display = 'flex';
            resetUploader();
        });
    }

    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (uploadText) uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');

                requestAnimationFrame(() => {
                    if (cropperInstance) {
                        cropperInstance.destroy();
                        cropperContainer.innerHTML = '';
                    }

                    // 修正點：使用 getBoundingClientRect 獲取精確寬高，確保與 CSS 完美同步
                    const rect = uploadZone.getBoundingClientRect();
                    const zoneW = rect.width;
                    const zoneH = rect.height;

                    cropperInstance = new Croppie(cropperContainer, {
                        // 修正點：移除 -4 偏移，確保照片 1:1 填滿你在 CSS 調好的高度
                        viewport: { 
                            width: zoneW, 
                            height: zoneH, 
                            type: 'square' 
                        },
                        boundary: { 
                            width: zoneW, 
                            height: zoneH 
                        },
                        showZoomer: false,
                        enableOrientation: true,
                        mouseWheelZoom: true,
                        enableExif: true // 支援手機照片元數據，防止轉向錯誤
                    });

                    cropperInstance.bind({
                        url: event.target.result,
                        zoom: 0
                    });
                });
            };
            reader.readAsDataURL(file);
        }
    });

    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();

        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請先點擊方框上傳照片'); return; }

        const cropperData = await cropperInstance.get();
        if (!cropperData.points) { alert('圖片載入中，請稍候再試'); return; }

        btnConfirm.textContent = "製作中...";
        btnConfirm.disabled = true;

        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport', // 輸出尺寸與調好的 CSS 框完全一致
                format: 'png',
                quality: 1
            });

            try {
                localStorage.setItem('member_name', name);
                localStorage.setItem('member_photo', croppedPhoto);
            } catch (e) {
                console.warn("LocalStorage 額度不足，僅供當前 Session 使用", e);
            }

            if (displayMemberName) {
                displayMemberName.textContent = name;
            }

            modal.style.display = 'none';
            if (homeView) homeView.style.display = 'none';
            if (menuView) menuView.style.display = 'flex';

        } catch (err) {
            console.error("製作失敗:", err);
            alert("照片處理出錯");
        } finally {
            btnConfirm.textContent = "確認製作並進店";
            btnConfirm.disabled = false;
        }
    });

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            const targetName = action === 'hot-food' ? '熱食區 (年度Dump)' : action;
            alert(`歡迎來到【${targetName}】！\n接下來將載入編輯模板。`);
        });
    });

    if (btnBackToHome) {
        btnBackToHome.addEventListener('click', () => {
            if (confirm('確定要重新辦卡嗎？目前進度將不會保留。')) {
                if (menuView) menuView.style.display = 'none';
                if (homeView) homeView.style.display = 'block';

                memberNameInputModal.value = '';
                resetUploader();
            }
        });
    }
});
