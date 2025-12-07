document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI UTAMA ---
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCPLNZcQ-7rjg74-pfTkrodI_srdDcAbno6ccI1kWK7CsCMqtT2Rxt4WJLOvhmm1Ol/exec";

    const TIME_LIMIT_MINUTES = 15;
    const QUESTIONS_TO_DISPLAY = 30;
    const MAX_VIOLATIONS = 3; // Batas maksimal nyontek (pindah tab)

    // --- STATE ---
    let studentName = "";
    let timeRemaining = TIME_LIMIT_MINUTES * 60;
    let timerInterval;
    let isQuizActive = false;
    let selectedQuestions = [];
    let violationCount = 0; // Hitungan pelanggaran

    // --- DATABASE SOAL (CONTOH) ---
    const questionBank = [
        {
            id: "q1",
            question: "Keyboard digunakan untuk mengetik perintah. Termasuk kategori perangkat apa?",
            options: { A: "Output Device", B: "Process Device", C: "Input Device", D: "Storage Device", E: "Brainware" },
            correctAnswer: "C",
            explanation: "Keyboard berfungsi memasukkan data/perintah, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q2",
            question: "Monitor menampilkan hasil pengolahan data secara visual. Monitor termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Software", D: "Storage Device", E: "Process Device" },
            correctAnswer: "B",
            explanation: "Monitor mengeluarkan informasi visual kepada pengguna, maka disebut <b>Output Device</b>."
        },
        {
            id: "q3",
            question: "CPU (Central Processing Unit) sering disebut sebagai otak komputer. CPU termasuk?",
            options: { A: "Storage Device", B: "Input Device", C: "Output Device", D: "Process Device", E: "Software" },
            correctAnswer: "D",
            explanation: "CPU bertugas mengolah dan memproses data, sehingga masuk kategori <b>Process Device</b>."
        }
    ];

    // --- ELEMEN DOM ---
    const btnStart = document.getElementById('btnStart');
    const startScreen = document.getElementById('startScreen');
    const quizInterface = document.getElementById('quizInterface');
    const inputNama = document.getElementById('inputNama');

    // ==========================================
    // 🔥 FITUR ANTI-CHEAT (ANTI NYONTEK) 🔥
    // ==========================================

    // 1. Mencegah Klik Kanan (Context Menu)
    document.addEventListener('contextmenu', event => event.preventDefault());

    // 2. Mencegah Copy, Cut, Paste, dan Select
    document.addEventListener('copy', event => event.preventDefault());
    document.addEventListener('cut', event => event.preventDefault());
    document.addEventListener('paste', event => event.preventDefault());
    document.addEventListener('dragstart', event => event.preventDefault());

    // Mencegah select text (CSS style injection lewat JS)
    const style = document.createElement('style');
    style.innerHTML = `
        body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        input { -webkit-user-select: auto; -moz-user-select: auto; -ms-user-select: auto; user-select: auto; }
    `;
    document.head.appendChild(style);

    // 3. Deteksi Pindah Tab / Minimize Browser
    document.addEventListener("visibilitychange", function () {
        if (document.hidden && isQuizActive) {
            handleViolation("Membuka tab lain atau minimize browser.");
        }
    });

    // 4. Deteksi Kehilangan Fokus (Klik aplikasi lain di split screen)
    window.addEventListener("blur", function () {
        if (isQuizActive) {
            // Kita beri sedikit delay agar tidak terlalu sensitif pada klik tidak sengaja
            setTimeout(() => {
                if (document.activeElement.tagName === "IFRAME") return; // Abaikan jika klik iframe
                // handleViolation("Keluar dari area kuis."); // Opsional: aktifkan jika ingin super ketat
            }, 500);
        }
    });

    function handleViolation(reason) {
        if (!isQuizActive) return;

        violationCount++;
        const sisa = MAX_VIOLATIONS - violationCount;

        if (sisa > 0) {
            alert(`⚠️ PERINGATAN PELANGGARAN! ⚠️\n\nAnda terdeteksi: ${reason}\n\nJangan coba-coba membuka Google, Tab Baru, atau Aplikasi lain.\nSisa toleransi: ${sisa} kali lagi sebelum didiskualifikasi!`);
        } else {
            alert(`⛔ DISKUALIFIKASI ⛔\n\nAnda telah melanggar aturan berulang kali.\nJawaban Anda akan otomatis dikunci dan dikirim.`);
            finishQuiz(true, "Diskualifikasi (Curang)");
        }
    }

    // ==========================================
    // END FITUR ANTI-CHEAT
    // ==========================================

    btnStart.addEventListener('click', function () {
        const namaValue = inputNama.value.trim();

        if (namaValue === "") {
            alert("⚠️ Harap isi NAMA LENGKAP sebelum memulai!");
            inputNama.focus();
            return;
        }

        studentName = namaValue;

        // Reset Pelanggaran
        violationCount = 0;

        startScreen.style.display = 'none';
        quizInterface.style.display = 'block';
        isQuizActive = true;

        // Masuk Fullscreen (Opsional - agar lebih fokus)
        openFullscreen();

        initQuizData();
        renderQuiz();
        checkCompletion();
        startTimer();
    });

    /* Helper Fullscreen */
    function openFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) { elem.requestFullscreen().catch(err => { }); }
        else if (elem.webkitRequestFullscreen) { elem.webkitRequestFullscreen(); }
        else if (elem.msRequestFullscreen) { elem.msRequestFullscreen(); }
    }

    // --- ANTI REFRESH ---
    window.addEventListener('beforeunload', function (e) {
        if (isQuizActive) {
            e.preventDefault();
            e.returnValue = '';
        }
    });

    // --- FUNGSI QUIZ ENGINE ---
    function initQuizData() {
        if (questionBank.length < QUESTIONS_TO_DISPLAY) {
            selectedQuestions = [...questionBank];
        } else {
            let shuffled = [...questionBank];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            selectedQuestions = shuffled.slice(0, QUESTIONS_TO_DISPLAY);
        }
    }

    function renderQuiz() {
        const quizContainer = document.getElementById('quiz-container');
        let htmlOutput = '';
        selectedQuestions.forEach((data, index) => {
            const questionNumber = (index + 1).toString().padStart(2, '0');
            const uniqueName = `q_${data.id}`;

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
                finishQuiz(true, "Waktu Habis");
            }
            timeRemaining--;
        }, 1000);
    }

    // --- FUNGSI KIRIM KE GOOGLE SHEET ---
    function sendDataToGoogleSheet(finalScore, statusNote = "") {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.innerText = "Menyimpan Nilai...";

        // Menambahkan status pelanggaran jika ada
        let statusKirim = statusNote;
        if (violationCount > 0) {
            statusKirim += ` (Terdeteksi pindah tab ${violationCount}x)`;
        }

        const payload = {
            nama: studentName,
            nilai: finalScore,
            status: statusKirim // Pastikan di Google Script kolomnya ditangani atau digabung
        };

        // Note: Google Script Anda mungkin perlu disesuaikan untuk menerima parameter tambahan jika mau, 
        // tapi jika tidak, kirim 'nama' dan 'nilai' saja sudah cukup.

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(() => {
            console.log("Data terkirim ke server.");
        }).catch(error => {
            console.error('Gagal kirim:', error);
        });
    }

    // --- SELESAI & HITUNG SKOR ---
    const submitBtn = document.getElementById('submitBtn');
    const modal = document.getElementById('resultModal');

    // Menambahkan parameter 'reason' untuk mengetahui kenapa kuis selesai (Waktu habis / Curang / Selesai normal)
    function finishQuiz(forceStop = false, reason = "Selesai") {
        isQuizActive = false;
        clearInterval(timerInterval);

        let score = 0;
        const form = document.getElementById('quizForm');

        selectedQuestions.forEach(data => {
            const uniqueName = `q_${data.id}`;
            const userAnswer = form.elements[uniqueName]?.value;
            const card = document.getElementById(data.id);
            const feedbackDiv = card.querySelector('.feedback');
            const explanationBox = card.querySelector('.explanation-box');

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

        const finalScore = Math.round((score / selectedQuestions.length) * 100);

        sendDataToGoogleSheet(finalScore, reason);
        showResultModal(finalScore, score, selectedQuestions.length, reason);

        if (submitBtn) submitBtn.style.display = 'none';

        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) restartBtn.style.display = 'flex';

        const timerContainer = document.getElementById('timerContainer');
        if (timerContainer) timerContainer.style.display = 'none';

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const answered = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
            if (answered < selectedQuestions.length) return;

            if (confirm("Yakin ingin mengumpulkan jawaban?")) {
                finishQuiz(false, "Selesai Normal");
            }
        });
    }

    function showResultModal(finalScore, correct, total, reason) {
        document.getElementById('scoreText').innerText = finalScore;

        let statusBadge = "";
        if (reason.includes("Curang")) {
            statusBadge = `<br><span style="color:red; font-size:0.8em; font-weight:bold;">(DISKUALIFIKASI)</span>`;
        }

        document.getElementById('scoreDetail').innerHTML = `
            <div style="margin-bottom:5px; color:#6366f1;">${studentName}</div>
            Benar <b>${correct}</b> dari <b>${total}</b> soal.${statusBadge}
        `;
        const badge = document.getElementById('scoreBadge');

        if (finalScore >= 80) { badge.style.backgroundColor = "#d1fae5"; badge.style.color = "#065f46"; }
        else if (finalScore >= 60) { badge.style.backgroundColor = "#ffedd5"; badge.style.color = "#c2410c"; }
        else { badge.style.backgroundColor = "#fee2e2"; badge.style.color = "#b91c1c"; }

        modal.style.display = "block";
    }

    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) closeBtn.onclick = () => modal.style.display = "none";

    const reviewBtn = document.getElementById('reviewBtn');
    if (reviewBtn) reviewBtn.onclick = () => { modal.style.display = "none"; window.scrollTo(0, 0); };

    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.onclick = () => location.reload();
});