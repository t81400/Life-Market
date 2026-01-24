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
    
    // 視圖切換元件
    const homeView = document.querySelector('.layer-visual'); // 修正：首頁主要視覺層
    const menuView = document.getElementById('menu-view');
    const displayMemberName = document.getElementById('display-member-name');
    
    // Header 上的「重新辦卡」按鈕 (HTML ID 應為 btn-back-to-home 或對應 class)
    const btnBackToHome = document.getElementById('btn-back-to-home') || document.querySelector('.user-badge');

    let cropperInstance = null;

    // --- 關鍵修正：封裝統一的重置清理函式 ---
    function resetUploader() {
        // 1. 銷毀 Croppie 實例
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        // 2. 徹底清空容器內容，避免 DOM 殘留導致樣式跑掉
        if (cropperContainer) {
            cropperContainer.innerHTML = ''; 
        }
        // 3. 還原文字顯示與容器樣式 (配合 CSS 絕對定位)
        if (uploadText) {
            uploadText.style.display = 'block'; 
        }
        if (uploadContainer) {
            uploadContainer.classList.remove('has-photo');
        }
        // 4. 清空檔案輸入值，確保同一張照片可連續重複選取
        fileInput.value = '';
    }

    // --- 2. 彈窗顯示/隱藏 ---
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

    // --- 3. 照片上傳與裁切初始化 ---
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                // 隱藏提示文字並標記已上傳
                if (uploadText) uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');
                
                // 初始化裁切器
                if (cropperInstance) {
                    cropperInstance.destroy();
                    cropperContainer.innerHTML = '';
                }
                
                // 取得目前顯示區域大小作為裁切標準
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

            // 儲存資訊到 localStorage (供後續功能調用)
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            // 更新選單頁面的姓名顯示
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

    // --- 5. 返回首頁功能 (重新辦卡) ---
    if (btnBackToHome) {
        btnBackToHome.addEventListener('click', () => {
            if (confirm('確定要重新辦卡嗎？目前進度將不會保留。')) {
                // 1. 切換視圖回到首頁
                if (menuView) menuView.style.display = 'none';
                if (homeView) homeView.style.display = 'block';
                
                // 2. 清空輸入狀態與重置裁切器
                memberNameInputModal.value = '';
                resetUploader();
            }
        });
    }
});

/**
 * 選單跳轉功能：由 HTML onclick="navigateTo('hot-food')" 調用
 */
function navigateTo(pageId) {
    const targetName = pageId === 'hot-food' ? '熱食區 (年度Dump)' : pageId;
    alert(`歡迎來到【${targetName}】！\n接下來將載入編輯模板。`);
}
