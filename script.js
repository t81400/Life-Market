/**
 * 人生超市 - 會員系統核心邏輯 (全平台相容完整整合版)
 * 修復重點：移除非同步延遲、修正手機渲染座標、強制同步容器寬高
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
        // 先徹底清理舊的實例與 DOM 殘留
        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }
        elements.cropperContainer.innerHTML = '';

        // 強制同步獲取當前容器的實體寬高 (不再使用暴力數值或延遲)
        const w = elements.uploadZone.offsetWidth;
        const h = elements.uploadZone.offsetHeight;

        // 如果容器尚未渲染完成 (寬度為 0)，則回退到一個安全比例
        const finalW = w > 0 ? w : 80;
        const finalH = h > 0 ? h : 110;

        // 初始化 Croppie
        cropperInstance = new Croppie(elements.cropperContainer, {
            viewport: { 
                width: finalW - 4, 
                height: finalH - 4, 
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
            enforceBoundary: false // 讓照片操作更自由，解決邊界卡住問題
        });

        // 綁定圖片來源
        cropperInstance.bind({
            url: imageSrc,
            zoom: 0
        }).then(() => {
            console.log("照片綁定成功");
            // 針對某些瀏覽器渲染緩慢的補償
            cropperInstance.setZoom(0);
        }).catch(err => {
            console.error("照片綁定失敗:", err);
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
        elements.fileInput.value = '';
    }

    // --- 4. 事件監聽設定 ---

    // 開啟編輯彈窗
    if (elements.btnCheckout) {
        elements.btnCheckout.addEventListener('click', () => {
            elements.modal.style.display = 'flex';
            resetUploader();
        });
    }

    // 關閉編輯彈窗
    if (elements.btnCancel) {
        elements.btnCancel.addEventListener('click', () => {
            elements.modal.style.display = 'none';
        });
    }

    // 點擊上傳區域觸發檔案選擇
    if (elements.uploadZone) {
        elements.uploadZone.addEventListener('click', () => elements.fileInput.click());
    }

    // 處理檔案選取
    if (elements.fileInput) {
        elements.fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    // 切換視覺狀態：隱藏文字，加上 has-photo class
                    if (elements.uploadText) elements.uploadText.style.display = 'none';
                    if (elements.uploadContainer) elements.uploadContainer.classList.add('has-photo');
                    
                    // 啟動裁切器
                    initCropper(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 確認製作：執行裁切並儲存
    if (elements.btnConfirm) {
        elements.btnConfirm.addEventListener('click', async () => {
            const name = elements.nameInput.value.trim();
            if (!name) {
                alert('請輸入會員姓名');
                return;
            }
            if (!cropperInstance) {
                alert('請先上傳照片');
                return;
            }

            elements.btnConfirm.textContent = "製作中...";
            elements.btnConfirm.disabled = true;

            try {
                // 取得裁切後的 Base64 圖片
                const croppedPhoto = await cropperInstance.result({
                    type: 'base64',
                    size: 'viewport',
                    format: 'png',
                    quality: 1
                });

                // 儲存至本地快取
                localStorage.setItem('member_name', name);
                localStorage.setItem('member_photo', croppedPhoto);

                // 更新選單頁面的姓名顯示
                if (elements.displayName) elements.displayName.textContent = name;

                // 切換視圖
                elements.modal.style.display = 'none';
                if (elements.homeView) elements.homeView.style.display = 'none';
                if (elements.menuView) elements.menuView.style.display = 'flex';

            } catch (err) {
                console.error("裁切製作出錯:", err);
                alert("照片處理出錯，請重新嘗試");
            } finally {
                elements.btnConfirm.textContent = "確認製作並進店";
                elements.btnConfirm.disabled = false;
            }
        });
    }

    // 重新辦卡邏輯
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
 * 選單跳轉路由
 */
function navigateTo(pageId) {
    const targetName = pageId === 'hot-food' ? '熱食區 (年度Dump)' : pageId;
    alert(`歡迎來到【${targetName}】！\n即將載入專屬內容。`);
}
