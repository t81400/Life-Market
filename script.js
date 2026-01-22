/**
 * 人生超市 - 會員系統核心邏輯
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
    
    // 新增：返回按鈕元件
    const btnBackToHome = document.getElementById('btn-back-to-home');

    let cropperInstance = null;

    // --- 2. 彈窗顯示/隱藏 ---
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
        // 開啟時重置裁切器
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
            uploadText.style.display = 'flex';
            if (uploadContainer) uploadContainer.classList.remove('has-photo');
        }
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
                uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');
                
                if (cropperInstance) cropperInstance.destroy();
                
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

    // --- 5. 新增：返回首頁功能 (重新辦卡) ---
    if (btnBackToHome) {
        btnBackToHome.addEventListener('click', () => {
            // 詢問使用者是否確定 (選填)
            if (confirm('確定要重新辦卡嗎？目前進度將不會保留。')) {
                // 回到首頁狀態
                if (menuView) menuView.style.display = 'none';
                if (homeView) homeView.style.display = 'flex';
                
                // 清空輸入框與裁切狀態，方便重新開始
                memberNameInputModal.value = '';
                if (cropperInstance) {
                    cropperInstance.destroy();
                    cropperInstance = null;
                }
                uploadText.style.display = 'flex';
                if (uploadContainer) uploadContainer.classList.remove('has-photo');
            }
        });
    }
});

/**
 * 選單跳轉功能
 */
function navigateTo(pageId) {
    const targetName = pageId === 'hot-food' ? '熱食區 (年度Dump)' : pageId;
    alert(`歡迎來到【${targetName}】！\n接下來將載入六宮格編輯模板。`);
}
