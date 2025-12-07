document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI KUNCI JAWABAN ---
    const correctAnswers = {
        q1: 'A', // HTML
        q2: 'C', // color
        q3: 'C'  // HTML bukan bahasa pemrograman (markup)
    };

    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');

    submitBtn.addEventListener('click', function () {
        let score = 0;
        let totalQuestions = Object.keys(correctAnswers).length;
        const form = document.getElementById('quizForm');

        // Reset style sebelumnya
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('correct-highlight', 'wrong-highlight');
        });
        document.querySelectorAll('.feedback').forEach(fb => fb.innerHTML = '');

        // Loop periksa jawaban
        for (let questionId in correctAnswers) {
            const userAnswer = form.elements[questionId].value;
            const correctAnswer = correctAnswers[questionId];
            const questionCard = document.getElementById(questionId);
            const feedbackDiv = questionCard.querySelector('.feedback');

            // Logika pewarnaan
            if (userAnswer === correctAnswer) {
                score++;
                // Highlight pilihan yang benar (jika user memilihnya)
                const selectedOption = questionCard.querySelector(`input[value="${userAnswer}"]`).parentElement;
                selectedOption.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: green;">✓ Jawaban Benar!</span>';
            } else {
                if (userAnswer) {
                    // Highlight pilihan salah user
                    const selectedOption = questionCard.querySelector(`input[value="${userAnswer}"]`).parentElement;
                    selectedOption.classList.add('wrong-highlight');
                }
                feedbackDiv.innerHTML = `<span style="color: red;">✗ Salah. Jawaban: ${correctAnswer}</span>`;
            }
        }

        // Hitung Nilai Akhir (Skala 100)
        let finalScore = Math.round((score / totalQuestions) * 100);

        // Tampilkan Modal Hasil
        showResultModal(finalScore, score, totalQuestions);
    });

    // Fungsi Menampilkan Modal
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');

        scoreText.innerText = finalScore;
        scoreDetail.innerText = `Anda menjawab ${correctCount} benar dari ${totalQuestions} soal.`;

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
    closeBtn.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});