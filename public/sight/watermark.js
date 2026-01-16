// WatermarkPro - Main Logic
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const fileList = document.getElementById('file-list');
    const fileCount = document.getElementById('file-count');
    const clearList = document.getElementById('clear-list');
    const previewCanvas = document.getElementById('preview-canvas');
    const previewPlaceholder = document.getElementById('preview-placeholder');
    const processBtn = document.getElementById('process-btn');
    const successModal = document.getElementById('success-modal');
    const colorVal = document.getElementById('color-val');

    // Settings
    const wmText = document.getElementById('wm-text');
    const wmSize = document.getElementById('wm-size');
    const wmOpacity = document.getElementById('wm-opacity');
    const wmRotation = document.getElementById('wm-rotation');
    const wmColor = document.getElementById('wm-color');
    const wmX = document.getElementById('wm-x');
    const wmY = document.getElementById('wm-y');
    const wmGap = document.getElementById('wm-gap');
    const gridSettings = document.getElementById('grid-settings');
    const positionSettings = document.getElementById('position-settings');
    const modeButtons = document.querySelectorAll('.toggle-group button');

    let files = [];
    let currentMode = 'single';
    let previewSource = null; // Can be PDF object or Image object
    let isPdf = false;

    // Initialize PDF.js
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // --- Event Listeners ---

    // File Upload
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

    clearList.addEventListener('click', () => {
        files = [];
        updateFileList();
        resetPreview();
    });

    // Mode Toggle
    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            gridSettings.style.display = currentMode === 'grid' ? 'block' : 'none';
            positionSettings.style.display = currentMode === 'single' ? 'block' : 'none';
            updatePreview();
        });
    });

    // Setting Changes
    const updateInputs = [wmText, wmSize, wmOpacity, wmRotation, wmColor, wmX, wmY, wmGap];
    updateInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Update labels
            if (e.target.nextElementSibling && e.target.nextElementSibling.classList.contains('val-display')) {
                let val = e.target.value;
                if (e.target.id === 'wm-opacity' || e.target.id === 'wm-x' || e.target.id === 'wm-y') val += '%';
                if (e.target.id === 'wm-rotation') val += '°';
                if (e.target.id === 'wm-gap') val += 'px';
                e.target.nextElementSibling.textContent = val;
            }
            if (e.target.id === 'wm-color') {
                colorVal.textContent = e.target.value.toUpperCase();
            }
            updatePreview();
        });
    });

    // --- File Handling ---

    function handleFiles(newFiles) {
        const fileArray = Array.from(newFiles);
        files = [...files, ...fileArray];
        updateFileList();

        // Load first file for preview if nothing is loaded
        if (!previewSource && fileArray.length > 0) {
            loadPreviewFile(fileArray[0]);
        }
    }

    function updateFileList() {
        fileList.innerHTML = '';
        fileCount.textContent = files.length;
        files.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.5rem; overflow:hidden;">
                    <span>${file.type.includes('pdf') ? '📄' : '🖼️'}</span>
                    <span style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${file.name}</span>
                </div>
                <span class="remove" data-index="${index}">✕</span>
            `;
            fileList.appendChild(li);
        });

        // Add remove handlers
        document.querySelectorAll('.remove').forEach(r => {
            r.onclick = (e) => {
                const idx = parseInt(e.target.dataset.index);
                files.splice(idx, 1);
                updateFileList();
                if (files.length === 0) resetPreview();
                else if (idx === 0) loadPreviewFile(files[0]); // Reload preview if first file removed
            };
        });
    }

    async function loadPreviewFile(file) {
        resetPreview();
        isPdf = file.type === 'application/pdf';

        if (isPdf) {
            const reader = new FileReader();
            reader.onload = async function () {
                const typedarray = new Uint8Array(this.result);
                previewSource = await pdfjsLib.getDocument(typedarray).promise;
                updatePreview();
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type.startsWith('image/')) {
            const img = new Image();
            img.onload = () => {
                previewSource = img;
                updatePreview();
            };
            img.src = URL.createObjectURL(file);
        }
    }

    function resetPreview() {
        previewSource = null;
        previewPlaceholder.style.display = 'flex';
        previewCanvas.style.display = 'none';
        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    // --- Rendering Logic ---

    async function updatePreview() {
        if (!previewSource) return;

        previewPlaceholder.style.display = 'none';
        previewCanvas.style.display = 'block';

        const ctx = previewCanvas.getContext('2d');
        let w, h;

        if (isPdf) {
            const page = await previewSource.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            previewCanvas.width = viewport.width;
            previewCanvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            w = viewport.width;
            h = viewport.height;
        } else {
            // Adjust canvas to match image aspect ratio but keep reasonable size
            const maxPreviewW = 600;
            const scale = Math.min(1, maxPreviewW / previewSource.width);
            previewCanvas.width = previewSource.width * scale;
            previewCanvas.height = previewSource.height * scale;
            ctx.drawImage(previewSource, 0, 0, previewCanvas.width, previewCanvas.height);
            w = previewCanvas.width;
            h = previewCanvas.height;
        }

        drawWatermark(ctx, w, h);
    }

    function drawWatermark(ctx, w, h) {
        const text = wmText.value || '';
        const size = parseInt(wmSize.value);
        const opacity = parseInt(wmOpacity.value) / 100;
        const rotation = parseInt(wmRotation.value) * Math.PI / 180;
        const color = wmColor.value;
        const xPct = parseInt(wmX.value);
        const yPct = parseInt(wmY.value);
        const gap = parseInt(wmGap.value);

        ctx.save();
        ctx.font = `bold ${size}px Inter, sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (currentMode === 'single') {
            const x = (w * xPct) / 100;
            const y = (h * yPct) / 100;
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.fillText(text, 0, 0);
        } else {
            // Grid mode
            ctx.rotate(rotation);
            const diag = Math.sqrt(w * w + h * h);
            // Offset to cover the corners when rotated
            for (let x = -diag; x < diag * 1.5; x += gap) {
                for (let y = -diag; y < diag * 1.5; y += gap) {
                    ctx.fillText(text, x, y);
                }
            }
        }
        ctx.restore();
    }

    // --- Batch Processing ---

    processBtn.onclick = async () => {
        if (files.length === 0) return alert('请先上传文件');

        processBtn.disabled = true;
        processBtn.querySelector('.btn-text').textContent = '急速处理中...';
        processBtn.querySelector('.loader').hidden = false;

        const results = [];
        const config = {
            text: wmText.value,
            size: parseInt(wmSize.value),
            opacity: parseInt(wmOpacity.value) / 100,
            rotation: parseInt(wmRotation.value),
            color: wmColor.value,
            mode: currentMode,
            gap: parseInt(wmGap.value),
            xPercent: parseInt(wmX.value),
            yPercent: 100 - parseInt(wmY.value) // PDF coordinates start from bottom-left
        };

        const worker = new Worker('worker.js');

        try {
            for (const file of files) {
                if (file.type === 'application/pdf') {
                    const arrayBuffer = await file.arrayBuffer();
                    const result = await new Promise((resolve) => {
                        worker.onmessage = (e) => resolve(e.data);
                        worker.postMessage({ arrayBuffer, config }, [arrayBuffer]);
                    });
                    if (result) {
                        results.push({
                            name: `watermarked_${file.name}`,
                            blob: new Blob([result], { type: 'application/pdf' })
                        });
                    }
                } else {
                    // Image processing
                    const blob = await watermarkImage(file, config);
                    results.push({ name: `watermarked_${file.name}`, blob });
                }
            }
        } catch (err) {
            console.error(err);
            alert('处理过程中出现错误');
        } finally {
            worker.terminate();
            showSuccess(results);
        }
    };

    async function watermarkImage(file, config) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // Use the same drawWatermark logic but adjusted for original image size
                ctx.save();
                ctx.font = `bold ${config.size}px Inter, sans-serif`;
                ctx.fillStyle = config.color;
                ctx.globalAlpha = config.opacity;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (config.mode === 'single') {
                    const x = (img.width * config.xPercent) / 100;
                    const y = (img.height * (100 - config.yPercent)) / 100; // Match preview Y
                    ctx.translate(x, y);
                    ctx.rotate(config.rotation * Math.PI / 180);
                    ctx.fillText(config.text, 0, 0);
                } else {
                    ctx.rotate(config.rotation * Math.PI / 180);
                    const diag = Math.sqrt(img.width ** 2 + img.height ** 2);
                    for (let x = -diag; x < diag * 1.5; x += config.gap) {
                        for (let y = -diag; y < diag * 1.5; y += config.gap) {
                            ctx.fillText(config.text, x, y);
                        }
                    }
                }
                ctx.restore();

                canvas.toBlob(resolve, file.type);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    function showSuccess(results) {
        processBtn.disabled = false;
        processBtn.querySelector('.btn-text').textContent = '开始批量导出';
        processBtn.querySelector('.loader').hidden = true;

        const downloadLinks = document.getElementById('download-links');
        downloadLinks.innerHTML = '';

        results.forEach(res => {
            const url = URL.createObjectURL(res.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = res.name;
            a.className = 'download-btn';
            a.innerHTML = `<span>⬇️ 下载</span> <small>${res.name}</small>`;
            downloadLinks.appendChild(a);
        });

        document.getElementById('success-count').textContent = results.length;
        successModal.hidden = false;
    }
});
