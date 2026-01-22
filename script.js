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

    // --- 彈窗控制 ---
    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    btnCancel.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // --- 照片上傳 ---
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');
                
                if (cropperInstance) cropperInstance.destroy();
                cropperInstance = new Croppie(cropperContainer, {
                    viewport: { width: 80, height: 106, type: 'square' },
                    boundary: { width: 80, height: 106 },
                    showZoomer: false
                });
                cropperInstance.bind({ url: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    });

    // --- 核心：確認製作並進入選單 ---
    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();
        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請上傳照片'); return; }

        btnConfirm.textContent = "正在製作通行證...";
        btnConfirm.disabled = true;

        try {
            // 1. 取得裁切後的頭像
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'original'
            });

            // 2. 模擬合成會員卡並儲存 (這步可確保之後頁面拿得到這張卡)
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            // 3. 切換畫面
            modal.style.display = 'none';
            homeView.style.display = 'none';
            menuView.style.display = 'flex';
            displayMemberName.textContent = name + " 會員";

            console.log("會員卡製作完成，已進入選單");
        } catch (err) {
            console.error(err);
            alert("製作失敗，請重試");
        } finally {
            btnConfirm.textContent = "確認製作並進店";
            btnConfirm.disabled = false;
        }
    });
});

// 跳轉功能
function navigateTo(pageId) {
    // 根據你的需求，這裡可以導向不同的編輯 HTML
    // 例如：location.href = `editor_${pageId}.html`;
    alert(`歡迎來到超市【${pageId}】分區！\n功能開發中，即將啟動圖片模板編輯器...`);
}
