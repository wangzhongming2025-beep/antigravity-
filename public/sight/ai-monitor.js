let videoElement;
let canvasElement;
let gridBg;
let overlay;
let startBtn;
let uiLayer;
let distanceReadout;
let reticleBox;
let corners;
let statusPulse;

let isRunning = false;
let camera = null;

document.addEventListener('DOMContentLoaded', () => {
    videoElement = document.getElementById('webcam');
    canvasElement = document.getElementById('output_canvas');
    gridBg = document.getElementById('camera-feed-bg');
    overlay = document.getElementById('start-cam-overlay');
    startBtn = document.getElementById('start-camera-btn');
    uiLayer = document.getElementById('monitoring-ui');
    distanceReadout = document.getElementById('distance-readout');
    reticleBox = document.getElementById('reticle-box');
    corners = document.querySelectorAll('.reticle-corner');
    statusPulse = document.getElementById('status-dot');

    if(startBtn) {
        startBtn.addEventListener('click', startAI);
        console.log("AI Monitor: Button listener attached successfully.");
    } else {
        console.error("AI Monitor: startBtn not found!");
    }
});

function calculateDistance(boxWidthRatio) {
    // Rough estimation calibrated for standard laptops
    // Adjust scale factor based on approximate human face width proportion to frame
    const estimatedCm = 16 / boxWidthRatio; 
    return Math.round(estimatedCm);
}

function onResults(results) {
    if (!isRunning) return;
    
    // Check if face detected
    if (results.detections && results.detections.length > 0) {
        statusPulse.classList.replace('bg-yellow-500', 'bg-green-500');
        statusPulse.classList.replace('bg-red-500', 'bg-green-500');
        
        const face = results.detections[0];
        const width = face.boundingBox.width;
        const dist = calculateDistance(width);
        
        // Update distance text
        if (dist < 40) {
            distanceReadout.textContent = `${dist} cm (太近!)`;
            distanceReadout.className = "absolute top-2 left-1/2 -translate-x-1/2 bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-300";
            reticleBox.className = "w-64 h-64 border-2 border-red-500/50 rounded-lg relative transition-colors duration-300 scale-110";
            corners.forEach(c => c.style.borderColor = "#ef4444");
        } else if (dist < 50) {
            distanceReadout.textContent = `${dist} cm (警告)`;
            distanceReadout.className = "absolute top-2 left-1/2 -translate-x-1/2 bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-300";
            reticleBox.className = "w-64 h-64 border-2 border-yellow-500/50 rounded-lg relative transition-colors duration-300 scale-105";
            corners.forEach(c => c.style.borderColor = "#eab308");
        } else {
            distanceReadout.textContent = `${dist} cm (良好)`;
            distanceReadout.className = "absolute top-2 left-1/2 -translate-x-1/2 bg-cyan-500/20 text-cyan-400 text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-300";
            reticleBox.className = "w-64 h-64 border-2 border-cyan-500/30 rounded-lg relative transition-colors duration-300 scale-100";
            corners.forEach(c => c.style.borderColor = "#06b6d4");
        }
    } else {
        // No face detected
        statusPulse.classList.replace('bg-green-500', 'bg-yellow-500');
        distanceReadout.textContent = "未检测到人脸";
        distanceReadout.className = "absolute top-2 left-1/2 -translate-x-1/2 bg-zinc-500/20 text-zinc-400 text-[10px] px-2 py-0.5 rounded font-mono transition-colors duration-300";
        reticleBox.className = "w-64 h-64 border-2 border-zinc-500/30 rounded-lg relative transition-colors duration-300 scale-95 opacity-50";
        corners.forEach(c => c.style.borderColor = "#71717a");
    }
}

async function startAI() {
    console.log("AI Monitor: startAI called.");
    if (!startBtn) return;
    
    startBtn.disabled = true;
    startBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-2 text-black inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>初始化 AI...`;
    
    try {
        const faceDetection = new FaceDetection({locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
        }});
        
        faceDetection.setOptions({
            model: 'short',
            minDetectionConfidence: 0.5
        });
        
        faceDetection.onResults(onResults);
        
        camera = new Camera(videoElement, {
            onFrame: async () => {
                await faceDetection.send({image: videoElement});
            },
            width: 640,
            height: 480
        });
        
        await camera.start();
        
        isRunning = true;
        // Update UI
        videoElement.classList.remove('opacity-0');
        videoElement.classList.add('opacity-40', 'grayscale');
        gridBg.style.display = 'none'; // Hide static image
        overlay.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => overlay.style.display = 'none', 500); 
        uiLayer.classList.remove('opacity-0');
        
    } catch (err) {
        console.error("Camera error: ", err);
        startBtn.disabled = false;
        startBtn.innerHTML = "尝试重连相机";
        alert("无法访问摄像头或网络。确保您已授予权限且网络畅通。\n\n详细信息: " + err.message);
    }
}

window.startAI = startAI;
