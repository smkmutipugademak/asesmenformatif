document.addEventListener('DOMContentLoaded', function() {
    const quizData = [
        {
            id: "q1",
            question: "Manakah tag HTML yang benar untuk membuat paragraf?",
            options: {
                A: "&lt;par&gt;",
                B: "&lt;pg&gt;",
                C: "&lt;p&gt;",
                D: "&lt;paragraph&gt;",
                E: "&lt;text&gt;"
            },
            correctAnswer: "C"
        }
    ];

    // --- 2. RENDER SOAL KE HTML ---
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
                    <div class="options-group">
            `;

            for (const [key, value] of Object.entries(data.options)) {
                 htmlOutput += `
                    <label class="option">
                        <input type="radio" name="${data.id}" value="${key}">
                        <span class="circle">${key}</span>
                        <span class="text">${value}</span>
                    </label>
                 `;
            }

            htmlOutput += `
                    </div>
                    <div class="feedback"></div>
                </div>
            `;
        });

        quizContainer.innerHTML = htmlOutput;
    }

    renderQuiz();

    // --- 3. LOGIKA PENILAIAN ---
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');

    submitBtn.addEventListener('click', function() {
        let score = 0;
        const totalQuestions = quizData.length;
        const form = document.getElementById('quizForm');
        let allAnswered = true;

        // Reset tampilan sebelumnya
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('correct-highlight', 'wrong-highlight');
        });
        document.querySelectorAll('.feedback').forEach(fb => fb.innerHTML = '');

        // Cek jawaban
        quizData.forEach(data => {
            const userAnswer = form.elements[data.id].value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');

            if (!userAnswer) {
                allAnswered = false; // Ada yang belum dijawab (opsional logic)
            }

            if (userAnswer === data.correctAnswer) {
                score++;
                // Highlight hijau
                const selected = card.querySelector(`input[value="${userAnswer}"]`);
                if(selected) selected.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: #28a745;">✓ Benar</span>';
            } else {
                // Highlight merah jika salah
                if (userAnswer) {
                    const selected = card.querySelector(`input[value="${userAnswer}"]`);
                    if(selected) selected.parentElement.classList.add('wrong-highlight');
                }
                feedbackDiv.innerHTML = `<span style="color: #dc3545;">✗ Salah. Jawaban: ${data.correctAnswer}</span>`;
            }
        });

        // Hitung Skor (Skala 0-100)
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);
    });

    // --- 4. TAMPILAN POPUP ---
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');

        scoreText.innerText = finalScore;
        scoreDetail.innerHTML = `Anda menjawab <b>${correctCount}</b> benar dari <b>${totalQuestions}</b> soal.`;

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

    // Tutup Modal
    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };
});