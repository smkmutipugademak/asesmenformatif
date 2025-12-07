document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. DATA SOAL + PEMBAHASAN ---
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
            correctAnswer: "C",
            explanation: "Tag <b>&lt;p&gt;</b> adalah elemen standar HTML untuk mendefinisikan sebuah paragraf. Tag lain seperti &lt;paragraph&gt; tidak valid dalam standar HTML5."
        },
        {
            id: "q2",
            question: "Dalam CSS, properti 'background-color' digunakan untuk?",
            options: {
                A: "Mengubah warna teks",
                B: "Mengubah warna latar belakang",
                C: "Membuat garis tepi",
                D: "Mengubah ukuran font",
                E: "Mengatur jarak antar elemen"
            },
            correctAnswer: "B",
            explanation: "Properti <b>background-color</b> digunakan khusus untuk memberikan warna latar belakang pada elemen. Untuk warna teks, digunakan properti <b>color</b>."
        },
        {
            id: "q3",
            question: "Algoritma adalah...",
            options: {
                A: "Bahasa pemrograman tingkat tinggi",
                B: "Aplikasi untuk membuat desain grafis",
                C: "Urutan langkah-langkah logis untuk menyelesaikan masalah",
                D: "Komponen fisik komputer (hardware)",
                E: "Sistem operasi berbasis open source"
            },
            correctAnswer: "C",
            explanation: "Algoritma adalah dasar dari pemrograman, yaitu urutan langkah-langkah logis dan sistematis yang disusun untuk menyelesaikan suatu masalah tertentu."
        },
        {
            id: "q5",
            question: "Fungsi 'console.log()' pada JavaScript digunakan untuk...",
            options: {
                A: "Menampilkan pesan di halaman web",
                B: "Membuat variabel baru",
                C: "Menampilkan output di tab Console browser",
                D: "Menghapus elemen HTML",
                E: "Mengubah gaya CSS"
            },
            correctAnswer: "C",
            explanation: "Fungsi <b>console.log()</b> sangat berguna untuk debugging karena menampilkan output data atau pesan kesalahan langsung ke Console pengembang (Inspect Element)."
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

            // Menambahkan Div Feedback dan Div Penjelasan (Hidden di awal)
            htmlOutput += `
                    </div>
                    <div class="feedback"></div>
                    <div class="explanation-box">
                        <span class="explanation-title">💡 Pembahasan:</span>
                        ${data.explanation}
                    </div>
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
    const reviewBtn = document.getElementById('reviewBtn');

    submitBtn.addEventListener('click', function() {
        let score = 0;
        const totalQuestions = quizData.length;
        const form = document.getElementById('quizForm');

        // Reset tampilan sebelumnya
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('correct-highlight', 'wrong-highlight');
        });
        document.querySelectorAll('.explanation-box').forEach(box => box.style.display = 'none');
        document.querySelectorAll('.feedback').forEach(fb => fb.innerHTML = '');

        // Cek jawaban
        quizData.forEach(data => {
            const userAnswer = form.elements[data.id].value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

            // Logika Score & Highlight
            if (userAnswer === data.correctAnswer) {
                score++;
                // Highlight Pilihan Benar
                const selected = card.querySelector(`input[value="${userAnswer}"]`);
                if(selected) selected.parentElement.classList.add('correct-highlight');
                
                feedbackDiv.innerHTML = '<span style="color: #28a745;">✓ Jawaban Anda Benar</span>';
            } else {
                // Highlight Pilihan Salah User
                if (userAnswer) {
                    const selected = card.querySelector(`input[value="${userAnswer}"]`);
                    if(selected) selected.parentElement.classList.add('wrong-highlight');
                }
                feedbackDiv.innerHTML = `<span style="color: #dc3545;">✗ Jawaban Anda Salah. (Benar: ${data.correctAnswer})</span>`;
            }

            // Tampilkan kotak pembahasan (selalu muncul setelah submit, baik benar/salah)
            explanationBox.style.display = 'block';
        });

        // Hitung Skor
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);
        
        // Disable tombol submit agar tidak spam
        submitBtn.disabled = true;
        submitBtn.innerText = "Jawaban Sudah Terkirim";
        submitBtn.style.backgroundColor = "#999";
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

    // --- 5. NAVIGASI MODAL ---
    
    // Tutup Modal (Tombol X)
    closeBtn.onclick = () => modal.style.display = "none";
    
    // Klik di luar modal menutup modal
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    // Tombol "Lihat Pembahasan"
    reviewBtn.addEventListener('click', function() {
        modal.style.display = "none";
        // Scroll ke atas halaman agar user bisa mulai membaca dari nomor 1
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});