document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素獲取
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
    const homeView = document.getElementById('home-view');
    const menuView = document.getElementById('menu-view');
    const displayMemberName = document.getElementById('display-member-name');
    const btnBackToHome = document.getElementById('btn-back-to-home') || document.querySelector('.user-badge');

    let cropperInstance = null;

    /**
     * 重置上傳器狀態，清理 Croppie 實例
     */
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
        if (fileInput) fileInput.value = '';
    }

    // 開啟 Modal
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            modal.style.display = 'flex';
            resetUploader();
        });
    }

    // 關閉 Modal
    if (btnCancel) {
        btnCancel.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    // 觸發檔案選擇
    if (uploadZone) {
        uploadZone.addEventListener('click', () => fileInput.click());
    }

    // 處理圖片上傳與初始化裁切器
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (uploadText) uploadText.style.display = 'none';
                if (uploadContainer) uploadContainer.classList.add('has-photo');

                // 使用 requestAnimationFrame 確保 Modal 渲染完成，獲取正確寬高
                requestAnimationFrame(() => {
                    if (cropperInstance) {
                        cropperInstance.destroy();
                        cropperContainer.innerHTML = '';
                    }

                    // 修正點：移除 -4 偏移，確保裁切範圍貼齊邊界，消除縫隙
                    const zoneW = uploadZone.offsetWidth;
                    const zoneH = uploadZone.offsetHeight;

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
                        mouseWheelZoom: true,
                        enableExif: true // 增加對手機照片轉向的支援
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

    // 確認製作並存儲資料
    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();

        if (!name) { alert('請輸入會員姓名'); return; }
        if (!cropperInstance) { alert('請先點擊方框上傳照片'); return; }

        // 確保圖片已載入完畢
        const cropperData = await cropperInstance.get();
        if (!cropperData.points || cropperData.points.length === 0) { 
            alert('圖片處理中，請稍候再試'); 
            return; 
        }

        btnConfirm.textContent = "製作中...";
        btnConfirm.disabled = true;

        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64',
                size: 'viewport', // 嚴格按照 viewport 大小輸出
                format: 'png',
                quality: 1
            });

            // 儲存至本地，用於後續 Agent 調用
            try {
                localStorage.setItem('member_name', name);
                localStorage.setItem('member_photo', croppedPhoto);
            } catch (e) {
                console.warn("LocalStorage 儲存失敗，可能是隱私模式或空間不足", e);
            }

            if (displayMemberName) {
                displayMemberName.textContent = name;
            }

            // 切換視圖
            modal.style.display = 'none';
            if (homeView) homeView.style.display = 'none';
            if (menuView) menuView.style.display = 'flex';

        } catch (err) {
            console.error("照片製作出錯:", err);
            alert("處理照片時發生錯誤，請重試");
        } finally {
            btnConfirm.textContent = "確認製作並進店";
            btnConfirm.disabled = false;
        }
    });

    // 菜單點擊邏輯
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            const targetName = action === 'hot-food' ? '熱食區 (年度Dump)' : action;
            alert(`歡迎來到【${targetName}】！\n正在呼叫 AI 結帳員準備明細...`);
        });
    });

    // 返回首頁（重新辦卡）
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
