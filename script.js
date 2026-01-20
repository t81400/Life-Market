document.addEventListener('DOMContentLoaded', () => {

    // --- Security / Protocol Check ---
    if (window.location.protocol === 'file:') {
        alert('警告：你正在使用 "file://" 模式開啟檔案。\n\n這會導致會員卡製作失敗 (安全性錯誤)。\n\n請務必使用 Local Server (例如 python3 -m http.server 8000) 並開啟 http://localhost:8000');
    }

    // Elements
    const app = document.getElementById('app');
    const modal = document.getElementById('edit-modal');
    const btnStart = document.getElementById('btn-start');
    const cardDisplayContainer = document.getElementById('card-display-container');
    const mainCardVisual = document.getElementById('main-card-visual');

    // Modal Inputs
    const btnConfirm = document.getElementById('btn-confirm');
    const btnCancel = document.getElementById('btn-cancel');
    const photoInput = document.getElementById('photo-input');
    const photoPreview = document.getElementById('photo-preview');
    const nameInput = document.getElementById('name-input');

    // Canvas
    const canvas = document.getElementById('cardCanvas');
    const ctx = canvas.getContext('2d');

    // State
    let uploadedImage = null;

    // --- Initialization ---
    checkUser();

    function checkUser() {
        const userData = localStorage.getItem('life_supermarket_user');
        if (userData) {
            try {
                const user = JSON.parse(userData);
                if (user.cardImage) {
                    showResultState(user.cardImage);
                }
            } catch (e) {
                console.error('Error parsing user data', e);
            }
        }
    }

    // --- Event Listeners ---

    // Open Modal (Triggered by Card Click or Start Button)
    const openModal = () => {
        modal.classList.remove('hidden');
        // Small delay to allow display:flex to apply before opacity transition
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    };

    btnStart.addEventListener('click', openModal);
    cardDisplayContainer.addEventListener('click', () => {
        // Only open if not already finished (optional, but good UX)
        if (!localStorage.getItem('life_supermarket_user')) {
            openModal();
        } else {
            // If they really want to re-edit? Maybe allow it but warn? 
            // Current flow: lock it.
            // But for dev testing, let's allow re-open if the container is clicked 
            // (Wait, we disabled pointer-events in showResultState. So this won't fire if done.)
            openModal();
        }
    });

    // Close Modal
    const closeModal = () => {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300); // Match transition duration
    };

    btnCancel.addEventListener('click', closeModal);

    // Photo Upload Preview
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                photoPreview.style.backgroundImage = `url(${event.target.result})`;
                photoPreview.parentElement.querySelector('.photo-hint').style.display = 'none'; // Hide hint

                const img = new Image();
                img.onload = () => { uploadedImage = img; };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Confirm & Generate
    btnConfirm.addEventListener('click', async () => {
        const name = nameInput.value.trim();
        if (!name) {
            alert('請輸入名字');
            return;
        }

        btnConfirm.textContent = '製作中...';
        btnConfirm.disabled = true;

        try {
            await generateAndSaveCard(name, uploadedImage);
            closeModal();
            // Reset button text
            btnConfirm.textContent = '確認製作 (Done)';
            btnConfirm.disabled = false;
        } catch (err) {
            console.error(err);
            // Detailed error message for the user
            alert('製作失敗: ' + err.message + '\n\n請確認網址是否為 http://localhost:8000 (不要直接開啟 html 檔案)');
            btnConfirm.textContent = '確認製作 (Done)';
            btnConfirm.disabled = false;
        }
    });


    // --- Core Logic ---

    // Clean Loader to ensure No Tainting
    async function loadCardFrameClean() {
        try {
            const response = await fetch('./assets/card-frame.png');
            if (!response.ok) throw new Error('Network response was not ok');
            const blob = await response.blob();
            const img = new Image();
            return new Promise((resolve, reject) => {
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = URL.createObjectURL(blob);
            });
        } catch (error) {
            throw new Error('無法載入卡片素材 (Could not load asset). 請確認您是使用 Server 運行網頁。');
        }
    }

    async function generateAndSaveCard(name, photo) {

        // Load the frame via Fetch to ensure it's clean and accessible
        const cardFrameImg = await loadCardFrameClean();

        // Set dimensions (High Res)
        const width = cardFrameImg.naturalWidth;
        const height = cardFrameImg.naturalHeight;
        canvas.width = width;
        canvas.height = height;

        // 1. Draw Frame
        ctx.drawImage(cardFrameImg, 0, 0);

        // 2. Draw Photo (Synced with User CSS: Top 47%, Left 10%, Width 33%, Height 33%)
        if (photo) {
            const destX = width * 0.10;
            const destY = height * 0.47;
            const destW = width * 0.33;
            // User specified height 33% in CSS explicitly (Step 126), implying 33% of container height.
            // Container relates to image aspect ratio, so height * 0.33 is correct.
            const destH = height * 0.33;

            const imgRatio = photo.width / photo.height;
            const destRatio = destW / destH;
            let sX, sY, sW, sH;

            if (imgRatio > destRatio) {
                sH = photo.height;
                sW = sH * destRatio;
                sX = (photo.width - sW) / 2;
                sY = 0;
            } else {
                sW = photo.width;
                sH = sW / destRatio;
                sX = 0;
                sY = (photo.height - sH) / 2;
            }

            ctx.save();
            // Rounded corners for photo
            ctx.beginPath();
            // Simple rect clip
            ctx.rect(destX, destY, destW, destH);
            ctx.clip();
            ctx.drawImage(photo, sX, sY, sW, sH, destX, destY, destW, destH);
            ctx.restore();
        }

        // 3. Draw Name (Synced with CSS: Top 50%, Height 15% -> Center ~57.5%)
        const nX = width * 0.72; // Right 8% + Half Width (40%) = Center 72%
        const nY = height * 0.575; // Top 50% + Half Height (7.5%)

        const fontSize = Math.floor(height * 0.045);
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = '#333';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, nX, nY);

        // 4. Export & Save
        try {
            const dataUrl = canvas.toDataURL('image/png');

            const user = {
                name: name,
                cardImage: dataUrl,
                timestamp: new Date().toISOString()
            };

            localStorage.setItem('life_supermarket_user', JSON.stringify(user));

            // 5. Update UI
            showResultState(dataUrl);

            // Auto-Download once
            downloadImage(dataUrl, 'my-life-card.png');

        } catch (e) {
            throw new Error('Canvas Tainted. ' + e.message);
        }
    }

    function showResultState(imageUrl) {
        // Switch the visual source of the main card
        mainCardVisual.src = imageUrl;

        // Allow re-editing (Do not lock)
        cardDisplayContainer.style.pointerEvents = 'auto';

        // Ensure Start Button is visible for re-triggering
        const btnStart = document.getElementById('btn-start');
        if (btnStart) btnStart.style.display = 'block';

        console.log('Card Updated');
    }

    function downloadImage(dataUrl, filename) {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- Reset Logic (New) ---
    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (confirm('確定要重做嗎？目前的會員卡會消失喔！')) {
                localStorage.removeItem('life_supermarket_user');
                location.reload();
            }
        });
    }

});
ㄒ
