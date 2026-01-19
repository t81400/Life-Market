/**
 * Life Market - Member Card Generator
 * Logic for image upload, name input, croppie integration, and checkout navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const uploadText = document.getElementById('upload-text');
    const uploadZone = document.getElementById('upload-zone');
    const btnCancel = document.getElementById('btn-cancel');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');
    const cropperContainer = document.getElementById('cropper-container');

    // State
    let cropperInstance = null;

    // Constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const LOCAL_STORAGE_KEY_NAME = 'life_market_member_name';
    const LOCAL_STORAGE_KEY_IMAGE = 'cropped_image';

    // Initialize from LocalStorage
    initPersistence();

    // Event Listeners
    uploadZone.addEventListener('click', () => {
        // Only open file dialog if we don't already have an active cropper (or if user wants to change)
        // User logic says: if (!cropperInstance) fileInput.click();
        if (!cropperInstance) fileInput.click();
    });

    fileInput.addEventListener('change', handleFileSelect);

    btnCancel.addEventListener('click', handleCancelUpload);

    btnCheckout.addEventListener('click', handleCheckout);

    memberNameInput.addEventListener('input', handleNameInput);

    /**
     * Initializes state from localStorage
     */
    function initPersistence() {
        const savedName = localStorage.getItem(LOCAL_STORAGE_KEY_NAME);
        if (savedName) {
            memberNameInput.value = savedName;
        }
    }

    /**
     * Initialize Croppie instance
     * @param {string} src - Image Data URL
     */
    function initCroppie(src) {
        if (cropperInstance) cropperInstance.destroy();

        cropperInstance = new Croppie(cropperContainer, {
            viewport: { width: 80, height: 105, type: 'square' }, // Matches aspect ratio ~3:4
            boundary: { width: 80, height: 105 },
            showZoomer: true,
            enableOrientation: true
        });
        cropperInstance.bind({ url: src });
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
            // UI Updates
            uploadText.style.display = 'none';
            uploadZone.style.border = 'none';
            cropperContainer.style.display = 'block';
            btnCancel.style.display = 'flex';

            // Init Croppie
            initCroppie(event.target.result);
        }
        reader.readAsDataURL(file);
    }

    /**
     * Resets upload state
     * @param {Event} e 
     */
    function handleCancelUpload(e) {
        e.stopPropagation(); // Prevent triggering uploadZone click

        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }

        cropperContainer.style.display = 'none';
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

        // Security: Basic Sanitization
        const sanitized = value.replace(/[<>'"/`]/g, '');

        if (value !== sanitized) {
            e.target.value = sanitized;
            value = sanitized;
        }

        // Persistence
        localStorage.setItem(LOCAL_STORAGE_KEY_NAME, value);
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

        // Handle Image Export if Croppie is active
        if (cropperInstance) {
            cropperInstance.result({
                type: 'base64',
                size: 'viewport', // Get image sized to viewport (80x105) for consistency
                format: 'png' // or jpeg
            }).then(base64 => {
                localStorage.setItem(LOCAL_STORAGE_KEY_IMAGE, base64);
                window.location.href = 'checkout.html';
            });
        } else {
            // No image uploaded is apparently allowed (or maybe we should block? 
            // Following user's code logic: just go to checkout if name exists)
            window.location.href = 'checkout.html';
        }
    }
});
