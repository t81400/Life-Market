document.addEventListener('DOMContentLoaded', () => {
    // 1. 元素選取
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

    const menuItems = document.querySelectorAll('.menu-item');
    const homeView = document.getElementById('home-view');
    const menuView = document.getElementById('menu-view');
    const displayMemberName = document.getElementById('display-member-name');
    const btnBackToHome = document.getElementById('btn-back-to-home');

    let cropperInstance = null;

    // 2. 重置上傳器邏輯
    function resetUploader() {
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        if (cropperContainer) cropperContainer.innerHTML = '';
        if (uploadText) uploadText.style.display = 'block';
        if (uploadContainer) uploadContainer.classList.remove('has-photo');
        fileInput.value = '';
    }

    // 3. 辦卡彈窗控制
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

    // 4. 照片處理與裁切 (精確同步 CSS 尺寸)
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
                    if (cropperInstance) cropperInstance.destroy();
                    
                    const rect = uploadZone.getBoundingClientRect();
                    const zoneW = rect.width;
                    const zoneH = rect.height;

                    cropperInstance = new Croppie(cropperContainer, {
                        viewport: { width: zoneW, height: zoneH, type: 'square' },
                        boundary: { width: zoneW, height: zoneH },
                        showZoomer: false,
                        enableOrientation: true,
                        mouseWheelZoom: true,
                        enableExif: true
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

    // 5. 確認製作：切換至超市選單
    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();

        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請先上傳照片'); return; }

        btnConfirm.textContent = "製作中...";
        btnConfirm.disabled = true;

        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport',
                format: 'png',
                quality: 1
            });

            // 存儲數據
            localStorage.setItem('member_name', name);
            localStorage.setItem('member_photo', croppedPhoto);

            // 更新 UI 顯示
            if (displayMemberName) displayMemberName.textContent = name;

            // 視圖切換邏輯
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

    // 6. 選單標籤點擊：進入 Agent 語境
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            const memberName = localStorage.getItem('member_name') || '貴賓';
            
            // 這裡根據選單區域定義不同的 Agent 指令語氣
            const prompts = {
                'hot-food': "【熟食區】這是一份熱騰騰的年度回憶，請問要加辣嗎？",
                'history': "【出清區】這些過期黑歷史，打 0.1 折可能都沒人要喔。",
                'future': "【生鮮區】新的目標看起來很新鮮，保質期看起來很長！"
            };

            alert(`歡迎，${memberName}！\n${prompts[action] || "請選擇編輯區"}`);
            // 這裡未來將對接實際的對話生成頁面
        });
    });

    // 7. 返回首頁 (重新辦卡)
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
