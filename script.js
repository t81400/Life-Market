document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadZone = document.getElementById('upload-zone');
    const uploadText = document.getElementById('upload-text');
    const cropperContainer = document.getElementById('cropper-container');
    const modal = document.getElementById('edit-modal');
    const homeView = document.getElementById('home-view');
    const menuView = document.getElementById('menu-view');
    const btnCheckout = document.getElementById('btn-checkout');
    const btnConfirm = document.getElementById('confirm-generate');
    const btnCancel = document.getElementById('cancel-edit');
    const memberNameInputModal = document.getElementById('member-name-modal');
    const displayMemberName = document.getElementById('display-member-name');
    const btnBackToHome = document.getElementById('btn-back-to-home');

    let cropperInstance = null;

    function resetUploader() {
        if (cropperInstance) { cropperInstance.destroy(); cropperInstance = null; }
        cropperContainer.innerHTML = '';
        uploadText.style.display = 'block';
        fileInput.value = '';
    }

    btnCheckout.addEventListener('click', () => {
        modal.style.display = 'flex';
        resetUploader();
    });

    btnCancel.addEventListener('click', () => { modal.style.display = 'none'; });

    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                uploadText.style.display = 'none';
                if (cropperInstance) cropperInstance.destroy();

                const rect = uploadZone.getBoundingClientRect();
                cropperInstance = new Croppie(cropperContainer, {
                    viewport: { width: rect.width, height: rect.height, type: 'square' },
                    boundary: { width: rect.width, height: rect.height },
                    showZoomer: false,
                    enableExif: true
                });
                cropperInstance.bind({ url: event.target.result });
            };
            reader.readAsDataURL(file);
        }
    });

    btnConfirm.addEventListener('click', async () => {
        const name = memberNameInputModal.value.trim();
        if (!name || !cropperInstance) { alert('請填寫姓名並上傳照片'); return; }

        btnConfirm.textContent = "製作中...";
        try {
            const croppedPhoto = await cropperInstance.result({
                type: 'base64', size: 'viewport', format: 'png', backgroundColor: '#ffffff'
            });

            localStorage.setItem('member_name', name);
            displayMemberName.textContent = name;

            modal.style.display = 'none';
            homeView.style.display = 'none';
            menuView.style.display = 'flex';
        } catch (e) { alert('處理失敗'); }
        btnConfirm.textContent = "確認製作並進店";
    });

    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            alert(`歡迎進入 ${item.querySelector('.tag-main').textContent}！`);
        });
    });

    btnBackToHome.addEventListener('click', () => {
        if (confirm('重新辦卡？')) {
            menuView.style.display = 'none';
            homeView.style.display = 'block';
        }
    });
});
