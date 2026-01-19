/**
 * Life Market - Member Card Generator
 * Logic for image upload, name input, croppie integration, and checkout navigation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('file-input');
    const uploadText = document.getElementById('upload-text');
    const uploadZone = document.getElementById('upload-zone');
    const btnCheckout = document.getElementById('btn-checkout');
    const memberNameInput = document.getElementById('member-name');
    const cropperContainer = document.getElementById('cropper-container');

    // Action Sheet Elements
    const actionSheet = document.getElementById('action-sheet-overlay');
    const btnChangePhoto = document.getElementById('btn-change-photo');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');
    const btnCancelSheet = document.getElementById('btn-cancel-sheet');

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
        if (cropperInstance) {
            // Already have a photo -> Show Action Sheet
            actionSheet.style.display = 'flex';
        } else {
            // No photo -> Open File Dialog directly
            fileInput.click();
        }
    });

    // Action Sheet: Change Photo
    btnChangePhoto.addEventListener('click', () => {
        closeActionSheet();
        fileInput.click();
    });

    // Action Sheet: Remove Photo
    btnRemovePhoto.addEventListener('click', () => {
        closeActionSheet();
        handleCancelUpload(); // Reset logic
    });

    // Action Sheet: Cancel
    btnCancelSheet.addEventListener('click', closeActionSheet);

    // Close when clicking overlay background
    actionSheet.addEventListener('click', (e) => {
        if (e.target === actionSheet) closeActionSheet();
    });

    fileInput.addEventListener('change', handleFileSelect);

    btnCheckout.addEventListener('click', handleCheckout);

    memberNameInput.addEventListener('input', handleNameInput);

    /**
     * Closes the Action Sheet
     */
    function closeActionSheet() {
        actionSheet.style.display = 'none';
    }

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
            viewport: { width: 80, height: 105, type: 'square' },
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
            // btnCancel removed in favor of Action Sheet

            // Init Croppie
            initCroppie(event.target.result);
        }
        reader.readAsDataURL(file);
    }

    /**
     * Resets upload state (Used by Remove Photo)
     */
    function handleCancelUpload() {
        // Prevent event bubbling handled by caller logic if needed, 
        // but here it's called programmatically so no event object needed usually.

        if (cropperInstance) {
            cropperInstance.destroy();
            cropperInstance = null;
        }

        cropperContainer.style.display = 'none';
        uploadText.style.display = 'block';
        uploadZone.style.border = '1px dashed rgba(0,0,0,0.3)';

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
                size: 'viewport',
                format: 'png'
            }).then(base64 => {
                localStorage.setItem(LOCAL_STORAGE_KEY_IMAGE, base64);
                window.location.href = 'checkout.html';
            });
        } else {
            window.location.href = 'checkout.html';
        }
    }
});
