document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI ---
    const TIME_LIMIT_MINUTES = 15;
    const QUESTIONS_TO_DISPLAY = 30; // Pastikan jumlah soal cukup

    // --- STATE ---
    let timeRemaining = TIME_LIMIT_MINUTES * 60;
    let timerInterval;
    let isQuizActive = false; // Default False, belum mulai
    let selectedQuestions = [];

    // --- DATABASE SOAL (CONTOH) ---
    const questionBank = [
        {
            id: "q1",
            question: "Manakah tag HTML yang benar untuk membuat paragraf?",
            options: { A: "&lt;par&gt;", B: "&lt;pg&gt;", C: "&lt;p&gt;", D: "&lt;paragraph&gt;", E: "&lt;text&gt;" },
            correctAnswer: "C",
            explanation: "Tag <b>&lt;p&gt;</b> adalah standar HTML untuk paragraf."
        },
        {
            id: "q2",
            question: "Dalam CSS, properti 'background-color' digunakan untuk?",
            options: { A: "Warna teks", B: "Warna latar belakang", C: "Garis tepi", D: "Ukuran font", E: "Jarak elemen" },
            correctAnswer: "B",
            explanation: "Properti <b>background-color</b> mengatur warna latar elemen."
        },
        // ... MASUKKAN SISA SOAL ANDA DI SINI ...
    ];

    // --- LOGIKA START SCREEN ---
    const btnStart = document.getElementById('btnStart');
    const startScreen = document.getElementById('startScreen');
    const quizInterface = document.getElementById('quizInterface');

    btnStart.addEventListener('click', function () {
        // 1. Sembunyikan layar pembuka, munculkan soal
        startScreen.style.display = 'none';
        quizInterface.style.display = 'block';

        // 2. Set status aktif (PENTING UNTUK ANTI-REFRESH)
        isQuizActive = true;

        // 3. Jalankan fungsi-fungsi kuis
        initQuizData();
        renderQuiz();
        checkCompletion();
        startTimer();
    });

    // --- ANTI REFRESH (Hanya bekerja setelah btnStart diklik) ---
    window.addEventListener('beforeunload', function (e) {
        if (isQuizActive) {
            e.preventDefault();
            e.returnValue = ''; // Wajib ada untuk memicu alert browser
        }
    });

    // --- LOGIKA UTAMA (SAMA SEPERTI SEBELUMNYA) ---

    function initQuizData() {
        let shuffled = [...questionBank];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        const limit = Math.min(QUESTIONS_TO_DISPLAY, shuffled.length);
        selectedQuestions = shuffled.slice(0, limit);
    }

    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        let htmlOutput = '';
        selectedQuestions.forEach((data, index) => {
            const questionNumber = (index + 1).toString().padStart(2, '0');
            const uniqueName = `q_${data.id}`; // Gunakan nama unik

            htmlOutput += `
                <div class="question-card" id="${data.id}">
                    <div class="question-title">
                        <span class="q-number">#${questionNumber}</span>
                        <h3>${data.question}</h3>
                    </div>
                    <div class="options-group">`;
            for (const [key, value] of Object.entries(data.options)) {
                htmlOutput += `
                    <label class="option">
                        <input type="radio" name="${uniqueName}" value="${key}" onchange="checkCompletion()">
                        <span class="checkmark"></span>
                        <span class="text">${value}</span>
                    </label>`;
            }
            htmlOutput += `
                    </div>
                    <div class="feedback"></div>
                    <div class="explanation-box">
                        <div style="font-weight:600; margin-bottom:5px; color:#4f46e5;">💡 PEMBAHASAN</div>
                        ${data.explanation}
                    </div>
                </div>`;
        });
        quizContainer.innerHTML = htmlOutput;
    }

    window.checkCompletion = function () {
        const totalQuestions = selectedQuestions.length;
        const answeredCount = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
        const submitBtn = document.getElementById('submitBtn');

        const percentage = Math.round((answeredCount / totalQuestions) * 100);
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progress-text').innerText = percentage + '%';

        if (answeredCount === totalQuestions) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Kirim Jawaban</span><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>`;
        } else {
            submitBtn.disabled = true;
            submitBtn.innerText = `Selesaikan ${totalQuestions - answeredCount} soal lagi...`;
        }
    };

    function startTimer() {
        const timeDisplay = document.getElementById('timeDisplay');
        const timerPill = document.getElementById('timerPill');

        timerInterval = setInterval(() => {
            if (!isQuizActive) { clearInterval(timerInterval); return; }

            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeRemaining <= 60) timerPill.classList.add('timer-critical');
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                finishQuiz(true);
            }
            timeRemaining--;
        }, 1000);
    }

    // --- SUBMIT & HASIL ---
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('resultModal');

    function finishQuiz(isTimeOut = false) {
        // Matikan proteksi refresh karena ujian sudah selesai
        isQuizActive = false;
        clearInterval(timerInterval);

        let score = 0;
        const form = document.getElementById('quizForm');

        if (isTimeOut) alert("Waktu Habis!");

        selectedQuestions.forEach(data => {
            const uniqueName = `q_${data.id}`;
            const userAnswer = form.elements[uniqueName]?.value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

            // Disable Inputs
            const inputs = card.querySelectorAll('input');
            inputs.forEach(inp => { inp.disabled = true; inp.parentElement.classList.add('disabled'); });

            if (userAnswer === data.correctAnswer) {
                score++;
                if (userAnswer) card.querySelector(`input[value="${userAnswer}"]`).parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: var(--success);">✓ Benar</span>';
            } else {
                if (userAnswer) card.querySelector(`input[value="${userAnswer}"]`).parentElement.classList.add('wrong-highlight');
                const correct = card.querySelector(`input[value="${data.correctAnswer}"]`);
                if (correct) correct.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = `<span style="color: var(--error);">✗ Salah. (Jwb: ${data.correctAnswer})</span>`;
            }
            explanationBox.style.display = 'block';
        });

        // Show Result
        const finalScore = Math.round((score / selectedQuestions.length) * 100);
        showResultModal(finalScore, score, selectedQuestions.length);

        submitBtn.style.display = 'none';
        document.getElementById('restartBtn').style.display = 'flex';
        document.getElementById('timerContainer').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    submitBtn.addEventListener('click', () => {
        const answered = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
        if (answered < selectedQuestions.length) return;
        finishQuiz(false);
    });

    // --- MODAL & HELPERS ---
    function showResultModal(finalScore, correct, total) {
        document.getElementById('scoreText').innerText = finalScore;
        document.getElementById('scoreDetail').innerHTML = `Benar <b>${correct}</b> dari <b>${total}</b> soal.`;
        const badge = document.getElementById('scoreBadge');

        if (finalScore >= 80) { badge.style.backgroundColor = "#d1fae5"; badge.style.color = "#065f46"; }
        else if (finalScore >= 60) { badge.style.backgroundColor = "#ffedd5"; badge.style.color = "#c2410c"; }
        else { badge.style.backgroundColor = "#fee2e2"; badge.style.color = "#b91c1c"; }

        modal.style.display = "block";
    }

    document.querySelector('.close-btn').onclick = () => modal.style.display = "none";
    document.getElementById('reviewBtn').onclick = () => { modal.style.display = "none"; window.scrollTo(0, 0); };
    document.getElementById('restartBtn').onclick = () => location.reload();
});