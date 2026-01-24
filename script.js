/**
 * 人生超市 - 會員系統核心邏輯 (全平台穩定整合版)
 * 修復重點：移除延遲陷阱、強制同步獲取容器寬高、優化手機端初始化
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
        // 清理舊實例，確保不佔用記憶體
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        elements.cropperContainer.innerHTML = '';

        // 【同步獲取】當前容器的實體寬高，這是 Croppie 計算座標的基準
        const w = elements.uploadZone.offsetWidth;
        const h = elements.uploadZone.offsetHeight;

        // 若寬高抓不到 (手機渲染初期的極端情況)，則使用比例補償
        const finalW = w > 0 ? w : 80;
        const finalH = h > 0 ? h : 110;

        // 初始化 Croppie (同步執行)
        cropperInstance = new Croppie(elements.cropperContainer, {
            viewport: { 
                width: finalW - 2, 
                height: finalH - 2, 
                type: 'square' 
            },
            boundary: { 
                width: finalW, 
                height: finalH 
            },
            showZoomer: false,
            enableOrientation: true,
            mouseWheelZoom: true,
            enableZoom: true,
            enforceBoundary: false 
        });

        // 綁定圖片來源
        cropperInstance.bind({
            url: imageSrc,
            zoom: 0
        }).then(() => {
            // 綁定成功後的微調，確保圖片撐滿
            cropperInstance.setZoom(0);
        }).catch(err => {
            console.error("Croppie 綁定失敗:", err);
        });
    }

    // --- 3. 核心邏輯：重置上傳狀態 ---
    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        elements.cropperContainer.innerHTML = '';
        if (elements.uploadText) elements.uploadText.style.display = 'block';
        if (elements.uploadContainer) elements.uploadContainer.classList.remove('has-photo');
        if (elements.fileInput) elements.fileInput.value = '';
    }

    // --- 4. 事件監聽設定 ---

    // 點擊「前往結帳」開啟 Modal
    if (elements.btnCheckout) {
        elements.btnCheckout.addEventListener('click', () => {
            elements.modal.style.display = 'flex';
            resetUploader();
        });
    }

    // 關閉 Modal
    if (elements.btnCancel) {
        elements.btnCancel.addEventListener('click', () => {
            elements.modal.style.display = 'none';
        });
    }

    // 點擊虛線框上傳照片
    if (elements.uploadZone) {
        elements.uploadZone.addEventListener('click', () => {
            elements.fileInput.click();
        });
    }

    // 監聽檔案選擇
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // 先切換 CSS 狀態，再初始化 Croppie
                    if (elements.uploadText) elements.uploadText.style.display = 'none';
                    if (elements.uploadContainer) elements.uploadContainer.classList.add('has-photo');
                    
                    initCropper(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 確認製作
    if (elements.btnConfirm) {
        elements.btnConfirm.addEventListener('click', async () => {
            const name = elements.nameInput.value.trim();
            if (!name) return alert('請輸入會員姓名');
            if (!cropperInstance) return alert('請先上傳照片');

            elements.btnConfirm.textContent = "製作中...";
            elements.btnConfirm.disabled = true;

            try {
                // 取得裁切後的圖片
                const croppedPhoto = await cropperInstance.result({
                    type: 'base64',
                    size: 'viewport',
                    format: 'png',
                    quality: 1
                });

                // 儲存資料
                localStorage.setItem('member_name', name);
                localStorage.setItem('member_photo', croppedPhoto);

                // 更新顯示與視圖切換
                if (elements.displayName) elements.displayName.textContent = name;
                elements.modal.style.display = 'none';
                if (elements.homeView) elements.homeView.style.display = 'none';
                if (elements.menuView) elements.menuView.style.display = 'flex';

            } catch (err) {
                alert("照片處理出錯");
                console.error(err);
            } finally {
                elements.btnConfirm.textContent = "確認製作並進店";
                elements.btnConfirm.disabled = false;
            }
        });
    }

    // 返回首頁 (重新辦卡)
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

/**
 * 導覽跳轉
 */
function navigateTo(pageId) {
    alert(`歡迎來到【${pageId}】！`);
}
