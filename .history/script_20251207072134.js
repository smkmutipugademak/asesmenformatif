document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI UTAMA ---
    const TIME_LIMIT_MINUTES = 15;
    const QUESTIONS_TO_DISPLAY = 30; // Tampilkan 30 soal saja
    // (PENTING: Pastikan jumlah total soal di database >= QUESTIONS_TO_DISPLAY)

    // --- VARIABEL STATE ---
    let timeRemaining = TIME_LIMIT_MINUTES * 60;
    let timerInterval;
    let isQuizActive = true;
    let selectedQuestions = []; // Array untuk menampung soal terpilih

    // --- 1. DATABASE SOAL (BANK SOAL) ---
    // Masukkan lebih dari 50 soal di sini. 
    // Saya buatkan contoh 5 soal, nanti Anda bisa tambahkan sisanya.
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
        {
            id: "q3",
            question: "Algoritma adalah...",
            options: { A: "Bahasa pemrograman", B: "Aplikasi desain", C: "Urutan langkah logis", D: "Hardware", E: "Sistem Operasi" },
            correctAnswer: "C",
            explanation: "Algoritma adalah urutan langkah logis penyelesaian masalah."
        },
        {
            id: "q4",
            question: "Shortcut CTRL+C berfungsi untuk...",
            options: { A: "Paste", B: "Cut", C: "Copy", D: "Undo", E: "Redo" },
            correctAnswer: "C",
            explanation: "CTRL+C digunakan untuk menyalin (Copy)."
        },
        {
            id: "q5",
            question: "Simbol Flowchart bentuk belah ketupat (Decision) digunakan untuk?",
            options: { A: "Mulai/Selesai", B: "Proses", C: "Input/Output", D: "Percabangan/Keputusan", E: "Konektor" },
            correctAnswer: "D",
            explanation: "Belah ketupat melambangkan pengambilan keputusan (Ya/Tidak)."
        }
        // ... TAMBAHKAN SOAL KE-6 SAMPAI KE-50 DI SINI ...
    ];

    // --- 2. LOGIKA PENGACAKAN (FISHER-YATES SHUFFLE) ---
    function initQuizData() {
        // 1. Copy array agar data asli aman
        let shuffled = [...questionBank];

        // 2. Acak posisi array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // 3. Ambil sejumlah soal yang diinginkan (Misal: 30)
        // Jika soal di database kurang dari target, ambil semua yang ada.
        const limit = Math.min(QUESTIONS_TO_DISPLAY, shuffled.length);
        selectedQuestions = shuffled.slice(0, limit);
    }

    // --- 3. FITUR ANTI-REFRESH (BEFOREUNLOAD) ---
    window.addEventListener('beforeunload', function (e) {
        if (isQuizActive) {
            // Standar modern browser mengharuskan preventDefault
            e.preventDefault();
            // Pesan ini mungkin tidak tampil di Chrome modern (diganti pesan default browser),
            // tapi properti ini wajib ada untuk memicu alert.
            e.returnValue = 'Ujian sedang berlangsung. Data jawaban akan hilang jika Anda keluar.';
        }
    });

    // --- 4. RENDER SOAL ---
    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        let htmlOutput = '';

        selectedQuestions.forEach((data, index) => {
            const questionNumber = (index + 1).toString().padStart(2, '0');
            htmlOutput += `
                <div class="question-card" id="${data.id}">
                    <div class="question-title">
                        <span class="q-number">#${questionNumber}</span>
                        <h3>${data.question}</h3>
                    </div>
                    <div class="options-group">`;

            for (const [key, value] of Object.entries(data.options)) {
                // Generate ID unik untuk radio button agar label bekerja dengan benar
                // meskipun soal diacak
                const uniqueId = `${data.id}_${key}`;

                htmlOutput += `
                    <label class="option" for="${uniqueId}">
                        <input type="radio" id="${uniqueId}" name="${data.id}" value="${key}" onchange="checkCompletion()">
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

    // --- 5. LOGIKA VALIDASI TOMBOL ---
    window.checkCompletion = function () {
        const totalQuestions = selectedQuestions.length;
        // Hitung radio button yang dicentang di dalam form quiz
        const answeredCount = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
        const submitBtn = document.getElementById('submitBtn');

        // Update Progress Bar
        const percentage = Math.round((answeredCount / totalQuestions) * 100);
        document.getElementById('progressBar').style.width = percentage + '%';
        document.getElementById('progress-text').innerText = percentage + '%';

        // Logika Kunci Tombol
        if (answeredCount === totalQuestions) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `
                <span>Kirim Jawaban</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
            `;
        } else {
            submitBtn.disabled = true;
            const sisa = totalQuestions - answeredCount;
            submitBtn.innerText = `Selesaikan ${sisa} soal lagi...`;
        }
    };

    // --- 6. TIMER ---
    function startTimer() {
        const timeDisplay = document.getElementById('timeDisplay');
        const timerPill = document.getElementById('timerPill');

        timerInterval = setInterval(() => {
            if (!isQuizActive) {
                clearInterval(timerInterval);
                return;
            }

            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timeDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            if (timeRemaining <= 60) timerPill.classList.add('timer-critical');

            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timeDisplay.innerText = "00:00";
                finishQuiz(true);
            }
            timeRemaining--;
        }, 1000);
    }

    // --- 7. LOGIKA SELESAI (SUBMIT) ---
    const submitBtn = document.getElementById('submitBtn');
    const restartBtn = document.getElementById('restartBtn');
    const modal = document.getElementById('resultModal');
    const closeBtn = document.querySelector('.close-btn');
    const reviewBtn = document.getElementById('reviewBtn');

    function finishQuiz(isTimeOut = false) {
        if (!isQuizActive) return;

        // PENTING: Set false agar beforeunload tidak muncul lagi setelah submit
        isQuizActive = false;
        clearInterval(timerInterval);

        let score = 0;
        const totalQuestions = selectedQuestions.length;
        const form = document.getElementById('quizForm');

        if (isTimeOut) {
            alert("Waktu Habis! Jawaban Anda akan dikumpulkan otomatis.");
        }

        selectedQuestions.forEach(data => {
            const userAnswer = form.elements[data.id]?.value; // Pake optional chaining
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
                // Highlight pilihan user
                const selected = card.querySelector(`input[value="${userAnswer}"]`);
                if (selected) selected.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = '<span style="color: var(--success);">✓ Jawaban Benar</span>';
            } else {
                // Highlight jawaban salah user
                if (userAnswer) {
                    const selected = card.querySelector(`input[value="${userAnswer}"]`);
                    if (selected) selected.parentElement.classList.add('wrong-highlight');
                }
                // Beritahu jawaban benar
                const correctOption = card.querySelector(`input[value="${data.correctAnswer}"]`);
                if (correctOption) correctOption.parentElement.classList.add('correct-highlight');
                feedbackDiv.innerHTML = `<span style="color: var(--error);">✗ Salah. Jawaban: ${data.correctAnswer}</span>`;
            }
            explanationBox.style.display = 'block';
        });

        // Tampilkan Modal
        let finalScore = Math.round((score / totalQuestions) * 100);
        showResultModal(finalScore, score, totalQuestions);

        // UI Changes
        submitBtn.style.display = 'none';
        restartBtn.style.display = 'flex';
        document.getElementById('timerContainer').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Event Submit Manual
    submitBtn.addEventListener('click', function () {
        const answeredCount = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
        // Double security check
        if (answeredCount < selectedQuestions.length) return;

        finishQuiz(false);
    });

    restartBtn.addEventListener('click', () => location.reload());

    // --- 8. MODAL HANDLING ---
    function showResultModal(finalScore, correctCount, totalQuestions) {
        const scoreText = document.getElementById('scoreText');
        const scoreDetail = document.getElementById('scoreDetail');
        const scoreIcon = document.getElementById('scoreIcon');
        const scoreBadge = document.getElementById('scoreBadge');

        scoreText.innerText = finalScore;
        scoreDetail.innerHTML = `Benar <b>${correctCount}</b> dari <b>${totalQuestions}</b> soal.`;

        if (finalScore >= 80) {
            scoreIcon.innerText = "🏆";
            scoreBadge.style.backgroundColor = "#d1fae5"; scoreBadge.style.color = "#065f46";
        } else if (finalScore >= 60) {
            scoreIcon.innerText = "🤩";
            scoreBadge.style.backgroundColor = "#ffedd5"; scoreBadge.style.color = "#c2410c";
        } else {
            scoreIcon.innerText = "📚";
            scoreBadge.style.backgroundColor = "#fee2e2"; scoreBadge.style.color = "#b91c1c";
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

    // --- INITIALIZATION ---
    initQuizData();     // 1. Acak dan pilih soal
    renderQuiz();       // 2. Tampilkan soal terpilih
    checkCompletion();  // 3. Set tombol ke disabled awal
    startTimer();       // 4. Mulai timer
});