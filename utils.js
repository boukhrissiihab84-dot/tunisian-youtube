// ==========================================
// 2. UTILS.JS - أدوات مساعدة (تنظيف الروابط وضغط الصور)
// ==========================================

function extractCleanId(raw) {
    if (!raw) return "";
    let s = String(raw).trim();
    if (s.length === 11 && !s.includes("/") && !s.includes("?")) return s;
    let m = s.match(/(?:v=|\/|youtu\.be\/)([0-9A-Za-z_-]{11})/);
    return m ? m[1] : (s.length >= 11 ? s.substring(0, 11) : "");
}

function compressAndCropImage(file, maxSize, callback) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = x => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext("2d");
                const minDim = Math.min(img.width, img.height);
                const sx = (img.width - minDim) / 2;
                const sy = (img.height - minDim) / 2;
                ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, maxSize, maxSize);
                const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
                callback(dataUrl);
            } catch (err) {
                callback(x.target.result);
            }
        };
        img.onerror = () => callback(x.target.result);
        img.src = x.target.result;
    };
    reader.onerror = () => {};
    reader.readAsDataURL(file);
}
