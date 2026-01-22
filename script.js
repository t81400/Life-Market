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

    let cropperInstance = null;

    // --- 2. 彈窗顯示/隱藏 ---
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
        // 開啟時重置：如果已經有舊的裁切器則銷毀，回歸初始狀態
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
                
                // 銷毀舊實例
                if (cropperInstance) cropperInstance.destroy();
                
                /**
                 * 動態獲取容器尺寸
                 * 解決「比例跑掉」的關鍵：Croppie 的 viewport 必須等於容器的實際尺寸
                 */
                const zoneW = uploadZone.offsetWidth;
                const zoneH = uploadZone.offsetHeight;
                
                // 初始化 Croppie
                cropperInstance = new Croppie(cropperContainer, {
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
        
        // 驗證
        if (!name) { 
            alert('請輸入會員姓名'); 
            return; 
        }
        if (!cropperInstance) { 
            alert('請先點擊方框上傳照片'); 
            return; 
        }

        // UI 狀態切換
        btnConfirm.textContent = "製作中...";
        btnConfirm.disabled = true;

        try {
            // 取得裁切後的圖片 (size 使用 viewport 確保完全填滿容器)
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport', 
                format: 'png',
                quality: 1
            });

            // 儲存資料到本地 (供後續編輯器使用)
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            // 更新選單頁面的個人資訊
            if (displayMemberName) {
                displayMemberName.textContent = name;
            }

            // 畫面轉場邏輯
            modal.style.display = 'none';
            if (homeView) homeView.style.display = 'none';
            if (menuView) {
                menuView.style.display = 'flex';
                // 隱藏全域跑馬燈，或是讓它保持顯示（視設計而定）
                // document.querySelector('.layer-overlay').style.display = 'none';
            }

            console.log("會員卡製作成功，姓名：" + name);

        } catch (err) {
            console.error("製作失敗:", err);
            alert("照片處理出錯，請換一張試試看");
        } finally {
            btnConfirm.textContent = "確認製作並進店";
            btnConfirm.disabled = false;
        }
    });
});

/**
 * 選單跳轉功能
 */
function navigateTo(pageId) {
    const zoneNames = {
        'hot-food': '熱食區 (年度Dump)',
        'fresh': '生鮮區 (失敗list)',
        'bestseller': '暢銷榜 (成就list)',
        'thanksgiving': '感謝祭'
    };

    const targetName = zoneNames[pageId] || pageId;
    console.log(`正在準備進入：${targetName}`);
    alert(`歡迎來到【${targetName}】！\n接下來將載入六宮格編輯模板。`);
}
