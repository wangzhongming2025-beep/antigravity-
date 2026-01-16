
let timerInterval = null;
let seconds = 0;
let isRunning = false;
let limit = 1200; // 20 minutes default

self.onmessage = function (e) {
    const { type, payload } = e.data;

    switch (type) {
        case 'START':
            if (!isRunning) {
                isRunning = true;
                timerInterval = setInterval(() => {
                    seconds++;
                    self.postMessage({ type: 'TICK', seconds: seconds });

                    if (seconds >= limit) {
                        self.postMessage({ type: 'ALARM' });
                        // Don't auto-stop, let the user acknowledge? 
                        // Or auto-reset? 
                        // For 20-20-20, we usually alert, then maybe user takes a break.
                        // Let's just alert every X seconds after limit?
                        // Or just alert once.
                    }
                }, 1000);
            }
            break;
        case 'PAUSE':
            isRunning = false;
            clearInterval(timerInterval);
            break;
        case 'RESET':
            isRunning = false;
            clearInterval(timerInterval);
            seconds = 0;
            self.postMessage({ type: 'TICK', seconds: 0 });
            break;
        case 'SET_LIMIT':
            limit = payload;
            break;
    }
};
