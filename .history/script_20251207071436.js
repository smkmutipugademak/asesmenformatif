document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI ---
    const TIME_LIMIT_MINUTES = 15; // Waktu dalam menit
    let timeRemaining = TIME_LIMIT_MINUTES * 60;
    let timerInterval;
    let isQuizActive = true;

    // --- DATA SOAL ---
    const quizData = [
        {
            id: "q1",
            question: "Manakah tag HTML yang benar untuk membuat paragraf?",
            options: { A: "&lt;par&gt;", B: "&lt;pg&gt;", C: "&lt;p&gt;", D: "&lt;paragraph&gt;", E: "&lt;text&gt;" },
            correctAnswer: "C",
            explanation: "Tag <b>&lt;p&gt;</b> adalah standar HTML untuk paragraf. Tag lain tidak valid."
        },
        {
            id: "q2",
            question: "Dalam CSS, properti 'background-color' digunakan untuk?",
            options: { A: "Warna teks", B: "Warna latar belakang", C: "Garis tepi", D: "Ukuran font", E: "Jarak elemen" },
            correctAnswer: "B",
            explanation: "Properti <b>background-color</b> khusus untuk mengatur warna latar belakang elemen."
        },
        {
            id: "q3",
            question: "Algoritma adalah...",
            options: { A: "Bahasa pemrograman", B: "Aplikasi desain", C: "Urutan langkah logis", D: "Hardware", E: "Sistem Operasi" },
            correctAnswer: "C",
            explanation: "Algoritma adalah urutan langkah-langkah logis penyelesaian masalah yang disusun secara sistematis."
        }
    ];

    // --- 1. RENDER SOAL ---
    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        let htmlOutput = '';

        quizData.forEach((data, index) => {
            const questionNumber = (index + 1).toString().padStart(2, '0');
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
                        <input type="radio" name="${data.id}" value="${key}" onchange="updateProgress()">
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

    // --- 2. LOGIKA TIMER ---
    function startTimer() {
        const timeDisplay = document.getElementById('timeDisplay');
        const timerPill = document.getElementById('timerPill');

        timerInterval = setInterval(() => {
            if (!isQuizActive) {
                clearInterval(timerInterval);
                return;
            }

            // Hitung menit dan detik
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;

            // Format tampilan 00:00
            timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            // Peringatan jika waktu < 1 menit (60 detik)
            if (timeRemaining <= 60) {
                timerPill.classList.add('timer-critical');
            } else {
                timerPill.classList.remove('timer-critical');
            }

            // Waktu Habis
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timeDisplay.innerText = "00:00";
                finishQuiz(true); // true = forced submit (waktu habis)
            }

            timeRemaining--;
        }, 1000);
    }

    // --- 3. LOGIKA PROGRESS BAR ---
    window.updateProgress = function () {
        const totalQuestions = quizData.length;
        const answeredCount = document.querySelectorAll('input[type="radio"]:checked').length;
        const percentage = Math.round((answeredCount / totalQuestions) * 100);

        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progress-text').innerText = percentage + '%';
    };

    // --- 4. LOGIKA SUBMIT / SELESAI ---
    const submitBtn = document.getElementById('submitBtn');
    const restartBtn = document.getElementById('restartBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');
    const reviewBtn = document.getElementById('reviewBtn');

    // Wrapper function untuk menyelesaikan kuis
    function finishQuiz(isTimeOut = false) {
        if (!isQuizActive) return; // Mencegah double submit
        isQuizActive = false;
        clearInterval(timerInterval); // Matikan timer

        let score = 0;
        const totalQuestions = quizData.length;
        const form = document.getElementById('quizForm');

        if (isTimeOut) {
            alert("Waktu Habis! Jawaban Anda akan otomatis dikumpulkan.");
        }

        quizData.forEach(data => {
            const userAnswer = form.elements[data.id].value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

            // Disable Input
            const inputs = card.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.disabled = true;
                input.parentElement.classList.add('disabled');
            });

            // Cek Jawaban
            if (userAnswer === data.correctAnswer) {
                score++;
                const selected = card.querySelector(`input[value="${userAnswer}"]`);
                if (selected) selected.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: var(--success);">✓ Jawaban Benar</span>';
            } else {
                if (userAnswer) {
                    const selected = card.querySelector(`input[value="${userAnswer}"]`);
                    if (selected) selected.parentElement.classList.add('wrong-highlight');
                }
                const correctOption = card.querySelector(`input[value="${data.correctAnswer}"]`);
                if (correctOption) correctOption.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = `<span style="color: var(--error);">✗ Salah. Jawaban yang benar: ${data.correctAnswer}</span>`;
            }

            explanationBox.style.display = 'block';
        });

        // Tampilkan Modal
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);

        // UI Changes
        submitBtn.style.display = 'none';
        restartBtn.style.display = 'flex';
        document.getElementById('timerContainer').style.display = 'none'; // Sembunyikan timer setelah selesai
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event Listener Tombol Submit
    submitBtn.addEventListener('click', function () {
        const answeredCount = document.querySelectorAll('input[type="radio"]:checked').length;
        if (answeredCount < quizData.length) {
            const confirmSubmit = confirm("Masih ada soal yang belum dijawab. Yakin ingin mengumpulkan?");
            if (!confirmSubmit) return;
        }
        finishQuiz(false);
    });

    restartBtn.addEventListener('click', () => location.reload());

    // --- 5. MODAL LOGIC ---
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');
        const scoreBadge = document.getElementById('scoreBadge');

        scoreText.innerText = finalScore;
        scoreDetail.innerHTML = `Anda menjawab benar <b>${correctCount}</b> dari <b>${totalQuestions}</b> soal.`;

        if (finalScore >= 80) {
            scoreIcon.innerText = "🏆";
            scoreBadge.style.backgroundColor = "#d1fae5";
            scoreBadge.style.color = "#065f46";
        } else if (finalScore >= 60) {
            scoreIcon.innerText = "🤩";
            scoreBadge.style.backgroundColor = "#ffedd5";
            scoreBadge.style.color = "#c2410c";
        } else {
            scoreIcon.innerText = "📚";
            scoreBadge.style.backgroundColor = "#fee2e2";
            scoreBadge.style.color = "#b91c1c";
        }
        modal.style.display = "block";
    }

    closeBtn.onclick = () => modal.style.display = "none";
    reviewBtn.onclick = () => {
        modal.style.display = "none";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.onclick = function (event) {
        if (event.target == modal || event.target.classList.contains('modal-backdrop')) {
            modal.style.display = "none";
        }
    }

    // --- INISIALISASI ---
    renderQuiz();
    startTimer(); // Mulai timer saat halaman dimuat
});