/**
 * NeuroFlow Data Tracker
 * Persists focus time and stress levels in localStorage
 */

const tracker = {
    // Schema: { '2026-W08': { focus: [0,0,0,0,0,0,0], stress: [50,50,50,50,50,50,50] } }

    getWeekKey() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
    },

    getTodayIndex() {
        const day = new Date().getDay(); // 0 is Sunday, 1 is Monday...
        return day === 0 ? 6 : day - 1; // Map to 0 (Mon) - 6 (Sun)
    },

    getLogs() {
        const key = this.getWeekKey();
        const data = localStorage.getItem('neuro_logs');
        let logs = data ? JSON.parse(data) : {};

        if (!logs[key]) {
            logs[key] = {
                focus: [0, 0, 0, 0, 0, 0, 0],
                stress: [50, 50, 50, 50, 50, 50, 50] // Default baseline stress
            };
            localStorage.setItem('neuro_logs', JSON.stringify(logs));
        }
        return logs[key];
    },

    saveLogs(data) {
        const key = this.getWeekKey();
        const fullData = JSON.parse(localStorage.getItem('neuro_logs') || '{}');
        fullData[key] = data;
        localStorage.setItem('neuro_logs', JSON.stringify(fullData));
    },

    /**
     * @param {number} minutes 
     */
    recordFocus(minutes) {
        const data = this.getLogs();
        const idx = this.getTodayIndex();
        data.focus[idx] += minutes;
        this.saveLogs(data);
        console.log(`[Tracker] Recorded ${minutes}min focus for index ${idx}`);
    },

    /**
     * @param {number} delta - positive for more stress, negative for less
     */
    updateStress(delta) {
        const data = this.getLogs();
        const idx = this.getTodayIndex();
        data.stress[idx] = Math.max(10, Math.min(100, data.stress[idx] + delta));
        this.saveLogs(data);
        console.log(`[Tracker] Updated stress by ${delta} for index ${idx}. New value: ${data.stress[idx]}`);
    },

    getWeeklyData() {
        return this.getLogs();
    }
};

window.NeuroTracker = tracker;
