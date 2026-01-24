/**
 * 人生超市 - 會員系統核心邏輯 (先進架構優化版)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 元件宣告 ---
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

    // --- 2. 核心邏輯：圖片裁切初始化 ---
    function initCropper(imageSrc) {
        // 先清理舊實例
        if (cropperInstance) {
            cropperInstance.destroy();
            elements.cropperContainer.innerHTML = '';
        }

        const zoneW = elements.uploadZone.offsetWidth;
        const zoneH = elements.uploadZone.offsetHeight;

        // 初始化 Croppie (解鎖自由模式)
        cropperInstance = new Croppie(elements.cropperContainer, {
            viewport: { width: zoneW, height: zoneH, type: 'square' },
            boundary: { width: zoneW, height: zoneH },
            showZoomer: false,
            enableOrientation: true,
            mouseWheelZoom: true,
            enableZoom: true,
            enforceBoundary: false, // 關鍵：允許照片自由拖動超出邊框
            enableKeyGrid: true     // 增加裁切對齊感
        });

        cropperInstance.bind({
            url: imageSrc,
            zoom: 0
        });
    }

    // --- 3. 核心邏輯：重置上傳狀態 ---
    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        if (elements.cropperContainer) elements.cropperContainer.innerHTML = '';
        if (elements.uploadText) elements.uploadText.style.display = 'block';
        if (elements.uploadContainer) elements.uploadContainer.classList.remove('has-photo');
        elements.fileInput.value = '';
    }

    // --- 4. 事件監聽 ---

    // 啟動彈窗
    if (elements.btnCheckout) {
        elements.btnCheckout.addEventListener('click', () => {
            elements.modal.style.display = 'flex';
            resetUploader();
        });
    }

    // 取消編輯
    if (elements.btnCancel) {
        elements.btnCancel.addEventListener('click', () => {
            elements.modal.style.display = 'none';
        });
    }

    // 觸發檔案選擇
    if (elements.uploadZone) {
        elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    }

    // 檔案選取處理
    elements.fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
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

            // 儲存數據
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            if (elements.displayName) elements.displayName.textContent = name;

            // 切換視圖
            elements.modal.style.display = 'none';
            if (elements.homeView) elements.homeView.style.display = 'none';
            if (elements.menuView) elements.menuView.style.display = 'flex';

        } catch (err) {
            console.error("製作失敗:", err);
            alert("照片處理出錯");
        } finally {
            elements.btnConfirm.textContent = "確認製作並進店";
            elements.btnConfirm.disabled = false;
        }
    });

    // 重新辦卡
    if (elements.btnBackToHome) {
        elements.btnBackToHome.addEventListener('click', () => {
            if (confirm('確定要重新辦卡嗎？目前進度將不會保留。')) {
                if (elements.menuView) elements.menuView.style.display = 'none';
                if (elements.homeView) elements.homeView.style.display = 'block';
                elements.nameInput.value = '';
                resetUploader();
            }
        });
    }
});

/**
 * 選單跳轉功能
 */
function navigateTo(pageId) {
    const targetName = pageId === 'hot-food' ? '熱食區 (年度Dump)' : pageId;
    alert(`歡迎來到【${targetName}】！\n接下來將載入編輯模板。`);
}
