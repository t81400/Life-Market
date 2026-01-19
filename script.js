/**
 * Life Market - Member Card Generator
 * Logic for image upload, name input, and checkout navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const previewImg = document.getElementById('preview-img');
    const uploadText = document.getElementById('upload-text');
    const uploadZone = document.getElementById('upload-zone');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');

    // Constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const LOCAL_STORAGE_KEY = 'life_market_member_name';

    // Initialize from LocalStorage
    initPersistence();

    // Event Listeners
    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', handleFileSelect);

    btnCancel.addEventListener('click', handleCancelUpload);

    btnCheckout.addEventListener('click', handleCheckout);

    memberNameInput.addEventListener('input', handleNameInput);

    /**
     * Initializes state from localStorage
     */
    function initPersistence() {
        const savedName = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedName) {
            memberNameInput.value = savedName;
        }
    }

    /**
     * Handles file selection with validation
     * @param {Event} e 
     */
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Security: Validate file type
        if (!file.type.startsWith('image/')) {
            alert('請上傳圖片檔案 (Please upload an image file)');
            fileInput.value = ''; // Reset
            return;
        }

        // Security: Validate file size
        if (file.size > MAX_FILE_SIZE) {
            alert('檔案大小超過 5MB (File size exceeds 5MB)');
            fileInput.value = ''; // Reset
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            previewImg.src = event.target.result;
            previewImg.style.display = 'block';
            uploadText.style.display = 'none';
            uploadZone.style.border = 'none';
            btnCancel.style.display = 'flex';
        }
        reader.readAsDataURL(file);
    }

    /**
     * Resets upload state
     * @param {Event} e 
     */
    function handleCancelUpload(e) {
        e.stopPropagation();
        previewImg.src = '';
        previewImg.style.display = 'none';
        uploadText.style.display = 'block';
        uploadZone.style.border = '1px dashed rgba(0,0,0,0.3)';
        btnCancel.style.display = 'none';
        fileInput.value = '';
    }

    /**
     * Sanitize and save name input
     * @param {Event} e 
     */
    function handleNameInput(e) {
        let value = e.target.value;

        // Security: Basic Sanitization (prevent script tags)
        // Although input values aren't directly executed, this prevents pasting bad chars
        // allowing Chinese, English, numbers, and basic punctuation
        const sanitized = value.replace(/[<>'"/`]/g, '');

        if (value !== sanitized) {
            e.target.value = sanitized;
            value = sanitized;
        }

        // Persistence
        localStorage.setItem(LOCAL_STORAGE_KEY, value);
    }

    /**
     * Validate and proceed to checkout
     */
    function handleCheckout() {
        const name = memberNameInput.value.trim();
        if (!name) {
            alert('請先輸入會員姓名');
            return;
        }

        // Final sanity check before navigation (optional)
        window.location.href = 'checkout.html';
    }
});
