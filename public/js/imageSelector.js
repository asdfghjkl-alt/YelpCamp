const $input = $("#images");
const $list = $("#file-list");
const storedFiles = new DataTransfer();

const MB_SIZE = 1024 * 1024;

const MAX_FILE_SIZE_MB = 7;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * MB_SIZE;

const MAX_TOTAL_SIZE_MB = 15;
const MAX_TOTAL_SIZE = MAX_TOTAL_SIZE_MB * MB_SIZE;

const MAX_FILES = 5;

const imgField = document.getElementById("images");
const campgroundForm = document.getElementById("campgroundForm");
const sizeSpan = document.getElementById("totalSize");
const noImgSpan = document.getElementById("totalNoImg");

const formatSize = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

const initNoImages = parseInt(campgroundForm.dataset.existingLength | 0);

sizeSpan.textContent = (
    campgroundForm.dataset.existingSize / 1024 / 1024 || 0
).toFixed(2);
noImgSpan.textContent = initNoImages;

function fileSizeValid() {
    const files = imgField.files;
    let totalSize =
        [...storedFiles.files].reduce((acc, f) => acc + f.size, 0) +
        (parseFloat(campgroundForm.dataset.existingSize) || 0);
    const errorMsg = document.getElementById("errorMsg");
    errorMsg.textContent = ""; // Reset error

    // 1. Check File Count
    if (files.length + storedFiles.files.length + initNoImages > MAX_FILES) {
        errorMsg.textContent = `Too many files selected. Max ${MAX_FILES} allowed.`;
        imgField.files = storedFiles.files;
        return false;
    }

    for (let i = 0; i < files.length; i++) {
        // 2. Check Individual File Size
        if (files[i].size > MAX_FILE_SIZE) {
            errorMsg.textContent = `File "${files[i].name}" is too large (Max ${MAX_FILE_SIZE_MB}MB).`;
            imgField.files = storedFiles.files;
            return false;
        }

        totalSize += files[i].size;
    }

    // 3. Check Total Size
    if (totalSize > MAX_TOTAL_SIZE) {
        errorMsg.textContent = `Total size exceeds limit of ${MAX_TOTAL_SIZE_MB}MB.`;
        imgField.files = storedFiles.files;
        return false;
    }
    return true;
}

$input.on("change", function () {
    if (fileSizeValid()) {
        Array.from(this.files).forEach((file) => {
            const exists = [...storedFiles.files].some(
                (f) => f.name === file.name && f.size === file.size,
            );
            if (!exists) {
                storedFiles.items.add(file);
            }
        });
        this.value = null;
        renderFileList();
    }
});

$list.on("click", ".delete", function () {
    const index = $(this).data("idx");
    storedFiles.items.remove(index);
    renderFileList();
});

function renderFileList() {
    const dataTransfer = new DataTransfer();
    $list.empty();
    let totalUploadSize = 0;

    [...storedFiles.files].forEach((file, index) => {
        dataTransfer.items.add(file);
        totalUploadSize += file.size;
        $list.append(`
                <div class="file-row">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatSize(file.size)}</span>
                    <span class="icon delete" data-idx="${index}">✕</span>
                </div>
            `);
    });

    sizeSpan.textContent = (
        (totalUploadSize +
            (parseFloat(campgroundForm.dataset.existingSize) || 0)) /
        1024 /
        1024
    ).toFixed(2);
    noImgSpan.textContent = initNoImages + storedFiles.files.length;

    $input[0].files = dataTransfer.files;
}
