document.addEventListener('DOMContentLoaded', function () {

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
    renderQuiz();

    // --- 2. LOGIKA PROGRESS BAR ---
    window.updateProgress = function () {
        const totalQuestions = quizData.length;
        const answeredCount = document.querySelectorAll('input[type="radio"]:checked').length;
        const percentage = Math.round((answeredCount / totalQuestions) * 100);

        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progress-text').innerText = percentage + '%';
    };

    // --- 3. LOGIKA SUBMIT ---
    const submitBtn = document.getElementById('submitBtn');
    const restartBtn = document.getElementById('restartBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');
    const reviewBtn = document.getElementById('reviewBtn');

    submitBtn.addEventListener('click', function () {
        // Cek apakah semua soal sudah dijawab (opsional, bisa dihapus jika tidak wajib)
        const answeredCount = document.querySelectorAll('input[type="radio"]:checked').length;
        if (answeredCount < quizData.length) {
            const confirmSubmit = confirm("Masih ada soal yang belum dijawab. Yakin ingin mengumpulkan?");
            if (!confirmSubmit) return;
        }

        let score = 0;
        const totalQuestions = quizData.length;
        const form = document.getElementById('quizForm');

        quizData.forEach(data => {
            const userAnswer = form.elements[data.id].value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

            // Disable Input & Add Visual Styles
            const inputs = card.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.disabled = true;
                input.parentElement.classList.add('disabled');
            });

            // Logic Benar/Salah
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
                // Highlight jawaban yang benar agar user tahu
                const correctOption = card.querySelector(`input[value="${data.correctAnswer}"]`);
                if (correctOption) correctOption.parentElement.classList.add('correct-highlight');

                feedbackDiv.innerHTML = `<span style="color: var(--error);">✗ Salah. Jawaban yang benar: ${data.correctAnswer}</span>`;
            }

            explanationBox.style.display = 'block';
        });

        // Tampilkan Hasil
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);

        // Ganti Tombol
        submitBtn.style.display = 'none';
        restartBtn.style.display = 'flex';

        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    restartBtn.addEventListener('click', () => location.reload());

    // --- 4. MODAL LOGIC ---
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');
        const scoreBadge = document.getElementById('scoreBadge');

        scoreText.innerText = finalScore;
        scoreDetail.innerHTML = `Anda menjawab benar <b>${correctCount}</b> dari <b>${totalQuestions}</b> soal.`;

        if (finalScore >= 80) {
            scoreIcon.innerText = "🏆";
            scoreBadge.style.backgroundColor = "#d1fae5"; // Light Green
            scoreBadge.style.color = "#065f46";
        } else if (finalScore >= 60) {
            scoreIcon.innerText = "🤩";
            scoreBadge.style.backgroundColor = "#ffedd5"; // Light Orange
            scoreBadge.style.color = "#c2410c";
        } else {
            scoreIcon.innerText = "📚";
            scoreBadge.style.backgroundColor = "#fee2e2"; // Light Red
            scoreBadge.style.color = "#b91c1c";
        }
        modal.style.display = "block";
    }

    closeBtn.onclick = () => modal.style.display = "none";
    reviewBtn.onclick = () => {
        modal.style.display = "none";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Close modal when clicking outside
    window.onclick = function (event) {
        if (event.target == modal || event.target.classList.contains('modal-backdrop')) {
            modal.style.display = "none";
        }
    }
});