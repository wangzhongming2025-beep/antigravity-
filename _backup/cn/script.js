document.addEventListener('DOMContentLoaded', () => {
    const rawInput = document.getElementById('raw-input');
    const titleInput = document.getElementById('exam-title');
    const subtitleInput = document.getElementById('exam-subtitle');

    const paperTitle = document.getElementById('paper-title');
    const paperSubtitle = document.getElementById('paper-subtitle');
    const paperContent = document.getElementById('paper-content');

    const btnPreview = document.getElementById('btn-preview');
    const btnPrint = document.getElementById('btn-print');
    const chkTwoCols = document.getElementById('chk-two-cols');

    // Layout Toggle
    chkTwoCols.addEventListener('change', (e) => {
        const paperContainer = document.getElementById('paper-container');
        if (e.target.checked) {
            paperContainer.classList.add('two-cols');
        } else {
            paperContainer.classList.remove('two-cols');
        }
    });

    // Live update titles
    titleInput.addEventListener('input', (e) => {
        paperTitle.textContent = e.target.value;
    });

    subtitleInput.addEventListener('input', (e) => {
        paperSubtitle.textContent = e.target.value;
    });

    // Preview Generation
    btnPreview.addEventListener('click', () => {
        const text = rawInput.value;
        if (!text.trim()) {
            alert('请先输入题目内容');
            return;
        }

        generatePaper(text);
    });

    // Print
    btnPrint.addEventListener('click', () => {
        window.print();
    });

    /**
     * Main function to parse text and render HTML
     */
    function generatePaper(text) {
        const questions = parseQuestions(text);
        renderQuestions(questions);
    }

    /**
     * Parser Logic
     * Converts raw text into array of question objects.
     * Expects format like "1. Question..." or "1、Question..."
     */
    function parseQuestions(text) {
        // Pre-process text to handle inline options like "A. xxx B. xxx"
        // We want to force a newline before any " [A-Z]. " pattern if it's not at start of line
        // But be careful not to break English sentences. 
        // Heuristic: " [A-Z][.、]" usually implies an option.

        let normalizedText = text.replace(/([^\n])\s+([A-D][\.、])/g, '$1\n$2');

        const lines = normalizedText.split(/\r?\n/);
        const questions = [];

        let currentQuestion = null;

        // Regex to identify Question start: "1." or "1、" or "(1)"
        const questionStartRegex = /^\s*(\d+[\.、\s]|\(\d+\))\s*(.*)/;
        // Regex to identify Option start: "A." or "A、" 
        const optionStartRegex = /^\s*([A-Z][\.、\s])\s*(.*)/;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            const qMatch = line.match(questionStartRegex);
            const oMatch = line.match(optionStartRegex);

            if (qMatch) {
                // New Question Found
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    title: line, // Keep full line as title for now
                    options: []
                };
            } else if (oMatch && currentQuestion) {
                // Option for current question
                currentQuestion.options.push(line);
            } else {
                // Continuation of previous line or unparseable
                if (currentQuestion) {
                    if (currentQuestion.options.length === 0) {
                        currentQuestion.title += " " + line;
                    } else {
                        currentQuestion.options[currentQuestion.options.length - 1] += " " + line;
                    }
                }
            }
        });

        if (currentQuestion) {
            questions.push(currentQuestion);
        }

        return questions;
    }

    /**
     * Render Logic
     */
    function renderQuestions(questions) {
        paperContent.innerHTML = '';

        if (questions.length === 0) {
            paperContent.innerHTML = '<div class="empty-state">未能识别到题目，请检查格式 (例如：1. 题目...)</div>';
            return;
        }

        questions.forEach((q, index) => {
            const qDiv = document.createElement('div');
            qDiv.className = 'question-item';

            // Question Title
            const titleDiv = document.createElement('div');
            titleDiv.className = 'q-text';
            titleDiv.textContent = q.title;
            qDiv.appendChild(titleDiv);

            // Options container
            if (q.options.length > 0) {
                const optContainer = document.createElement('div');
                optContainer.className = 'q-options';

                // Adjust layout based on option length?
                // For now, force grid
                q.options.forEach(opt => {
                    const optDiv = document.createElement('div');
                    optDiv.className = 'q-option';
                    optDiv.textContent = opt;
                    optContainer.appendChild(optDiv);
                });

                qDiv.appendChild(optContainer);
            }

            paperContent.appendChild(qDiv);
        });
    }
});
