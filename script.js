/**
 * 人生超市 - 會員系統核心邏輯 (整合修正版)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 元件宣告 ---
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
    
    const homeView = document.getElementById('home-view');
    const menuView = document.getElementById('menu-view');
    const displayMemberName = document.getElementById('display-member-name');
    
    // 對應新 HTML 結構中，位於 Header 的重新辦卡按鈕
    const btnBackToHome = document.getElementById('btn-back-to-home');

    let cropperInstance = null;

    // --- 關鍵修正：封裝統一的重置清理函式 ---
    function resetUploader() {
        // 1. 銷毀 Croppie 實例
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        // 2. 徹底清空容器內容 (解決文字跑掉的關鍵)
        if (cropperContainer) {
            cropperContainer.innerHTML = ''; 
        }
        // 3. 還原文字顯示與容器樣式
        if (uploadText) {
            uploadText.style.display = 'flex';
        }
        if (uploadContainer) {
            uploadContainer.classList.remove('has-photo');
        }
        // 4. 清空檔案輸入值
        fileInput.value = '';
    }

    // --- 2. 彈窗顯示/隱藏 ---
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
        // 開啟時呼叫清理邏輯，確保提示文字在正中央
        resetUploader();
    });

    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 3. 照片上傳與裁切初始化 ---
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // 隱藏提示文字並標記已上傳
                if (uploadText) uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');
                
                // 重新初始化前先清理
                if (cropperInstance) {
                    cropperInstance.destroy();
                    cropperContainer.innerHTML = '';
                }
                
                const zoneW = uploadZone.offsetWidth;
                const zoneH = uploadZone.offsetHeight;
                
                cropperInstance = new Croppie(cropperContainer, {
                    viewport: { width: zoneW, height: zoneH, type: 'square' },
                    boundary: { width: zoneW, height: zoneH },
                    showZoomer: false,
                    enableOrientation: true,
                    mouseWheelZoom: true
                });
                
                cropperInstance.bind({
                    url: event.target.result,
                    zoom: 0
                });
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 4. 確認製作並進入選單 ---
    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();
        
        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請先點擊方框上傳照片'); return; }

        btnConfirm.textContent = "製作中...";
        btnConfirm.disabled = true;

        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport', 
                format: 'png',
                quality: 1
            });

            // 儲存資訊
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            if (displayMemberName) {
                displayMemberName.textContent = name;
            }

            // 切換視圖
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

    // --- 5. 返回首頁功能 (重新辦卡按鈕邏輯) ---
    if (btnBackToHome) {
        btnBackToHome.addEventListener('click', () => {
            if (confirm('確定要重新辦卡嗎？目前進度將不會保留。')) {
                // 1. 切換視圖回到首頁
                if (menuView) menuView.style.display = 'none';
                if (homeView) homeView.style.display = 'flex';
                
                // 2. 清空所有輸入狀態
                memberNameInputModal.value = '';
                
                // 3. 呼叫核心清理邏輯，確保下次打開彈窗時文字不跑位
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
