document.addEventListener('DOMContentLoaded', () => {
    // --- 元件宣告 ---
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

    let cropperInstance = null;

    // --- 1. 彈窗顯示/隱藏 ---
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 2. 照片上傳與裁切初始化 ---
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');
                
                // 清除舊的 Croppie 實例
                if (cropperInstance) cropperInstance.destroy();
                
                // 初始化 Croppie (符合會員卡比例)
                cropperInstance = new Croppie(cropperContainer, {
                    viewport: { width: 80, height: 106, type: 'square' },
                    boundary: { width: 80, height: 106 },
                    showZoomer: false,
                    enableOrientation: true
                });
                cropperInstance.bind({ url: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 3. 核心：確認製作並進入選單 ---
    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();
        
        // 驗證輸入
        if (!name) { 
            alert('請輸入會員姓名'); 
            return; 
        }
        if (!cropperInstance) { 
            alert('請上傳照片'); 
            return; 
        }

        // 狀態切換
        btnConfirm.textContent = "正在製作通行證...";
        btnConfirm.disabled = true;

        try {
            // 取得裁切後的頭像 (Base64)
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'original',
                quality: 0.9
            });

            // 儲存資料到本地，方便跨頁面呼叫
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            // 更新選單頁面的個人資訊
            if (displayMemberName) {
                displayMemberName.textContent = name;
            }

            // 畫面切換：關閉彈窗 -> 隱藏首頁 -> 顯示選單
            modal.style.display = 'none';
            homeView.style.display = 'none';
            menuView.style.display = 'flex';

            console.log("會員卡製作完成，已進入選單。姓名：" + name);

        } catch (err) {
            console.error("製作過程中發生錯誤:", err);
            alert("製作失敗，請重試");
        } finally {
            btnConfirm.textContent = "確認製作並進店";
            btnConfirm.disabled = false;
        }
    });
});

/**
 * 選單跳轉功能
 * @param {string} pageId - 點擊的區域標籤
 */
function navigateTo(pageId) {
    // 這裡預留給下一步：六宮格編輯器的跳轉
    const zoneNames = {
        'hot-food': '熱食區 (年度Dump)',
        'fresh': '生鮮區 (失敗list)',
        'bestseller': '暢銷榜 (成就list)',
        'thanksgiving': '感謝祭'
    };

    console.log(`正在準備進入：${zoneNames[pageId] || pageId}`);
    
    // 目前先以 Alert 提示，下一步我們會實作載入對應模板的邏輯
    alert(`歡迎來到【${zoneNames[pageId] || pageId}】！\n接下來將載入六宮格編輯模板。`);
    
    // 未來範例：
    // window.location.href = `editor.html?type=${pageId}`;
}
