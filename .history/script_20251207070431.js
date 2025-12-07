document.addEventListener('DOMContentLoaded', function () {

    // --- 1. DATA SOAL & PEMBAHASAN ---
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
            explanation: "Properti <b>background-color</b> khusus untuk latar belakang element."
        },
        {
            id: "q3",
            question: "Algoritma adalah...",
            options: { A: "Bahasa pemrograman", B: "Aplikasi desain", C: "Urutan langkah logis", D: "Hardware", E: "Sistem Operasi" },
            correctAnswer: "C",
            explanation: "Algoritma adalah urutan langkah-langkah logis penyelesaian masalah yang disusun secara sistematis."
        }
    ];

    // --- 2. RENDER SOAL ---
    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        let htmlOutput = '';

        quizData.forEach((data, index) => {
            const questionNumber = (index + 1).toString().padStart(2, '0');

            htmlOutput += `
                <div class="question-card" id="${data.id}">
                    <div class="question-title">
                        <span class="q-number">${questionNumber}</span>
                        <h3>${data.question}</h3>
                    </div>
                    <div class="options-group">`;

            for (const [key, value] of Object.entries(data.options)) {
                htmlOutput += `
                    <label class="option">
                        <input type="radio" name="${data.id}" value="${key}">
                        <span class="circle">${key}</span>
                        <span class="text">${value}</span>
                    </label>`;
            }

            // Kotak pembahasan dibuat disini, tapi CSS membuatnya display:none
            htmlOutput += `
                    </div>
                    <div class="feedback"></div>
                    <div class="explanation-box">
                        <span class="explanation-title">💡 Pembahasan:</span>
                        ${data.explanation}
                    </div>
                </div>`;
        });
        quizContainer.innerHTML = htmlOutput;
    }
    renderQuiz();

    // --- 3. LOGIKA SUBMIT & BUKA PEMBAHASAN ---
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');
    const reviewBtn = document.getElementById('reviewBtn');

    submitBtn.addEventListener('click', function () {
        let score = 0;
        const totalQuestions = quizData.length;
        const form = document.getElementById('quizForm');

        // Loop Soal
        quizData.forEach(data => {
            const userAnswer = form.elements[data.id].value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

            // 1. Matikan Input (Disable) agar tidak bisa diganti lagi
            const inputs = card.querySelectorAll('input[type="radio"]');
            inputs.forEach(input => {
                input.disabled = true;
                input.parentElement.classList.add('disabled'); // Tambah style visual
            });

            // 2. Cek Jawaban
            if (userAnswer === data.correctAnswer) {
                score++;
                const selected = card.querySelector(`input[value="${userAnswer}"]`);
                if (selected) selected.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: #28a745;">✓ Benar</span>';
            } else {
                if (userAnswer) {
                    const selected = card.querySelector(`input[value="${userAnswer}"]`);
                    if (selected) selected.parentElement.classList.add('wrong-highlight');
                }
                feedbackDiv.innerHTML = `<span style="color: #dc3545;">✗ Salah. Jawaban: ${data.correctAnswer}</span>`;
            }

            // 3. MUNCULKAN PEMBAHASAN (Ini kuncinya)
            explanationBox.style.display = 'block';
        });

        // Tampilkan Modal Nilai
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);

        // Matikan tombol submit
        submitBtn.innerText = "Jawaban Terkirim";
        submitBtn.disabled = true;
    });

    // --- 4. MODAL ---
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');

        scoreText.innerText = finalScore;
        scoreDetail.innerHTML = `Benar <b>${correctCount}</b> dari <b>${totalQuestions}</b> soal.`;

        if (finalScore >= 80) {
            scoreIcon.innerText = "🏆";
            scoreText.style.color = "#28a745";
        } else if (finalScore >= 60) {
            scoreIcon.innerText = "🙂";
            scoreText.style.color = "#ffc107";
        } else {
            scoreIcon.innerText = "😢";
            scoreText.style.color = "#dc3545";
        }
        modal.style.display = "block";
    }

    closeBtn.onclick = () => modal.style.display = "none";

    // Tombol "Lihat Pembahasan" di Modal
    reviewBtn.addEventListener('click', function () {
        modal.style.display = "none";
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});