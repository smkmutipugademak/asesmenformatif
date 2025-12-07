document.addEventListener('DOMContentLoaded', function () {

    // --- KONFIGURASI UTAMA ---
    // 👇👇 TEMPEL URL DARI GOOGLE APPS SCRIPT DI BAWAH INI 👇👇
    const GOOGLE_SCRIPT_URL = "TEMPEL_URL_SCRIPT_AKHIRAN_EXEC_DISINI";

    const TIME_LIMIT_MINUTES = 15;
    const QUESTIONS_TO_DISPLAY = 30;

    // --- STATE ---
    let studentName = ""; // Variabel untuk menyimpan nama siswa
    let timeRemaining = TIME_LIMIT_MINUTES * 60;
    let timerInterval;
    let isQuizActive = false;
    let selectedQuestions = [];
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
        },
        {
            id: "q4",
            question: "Harddisk (HDD) berfungsi menyimpan data secara permanen. Termasuk komponen?",
            options: { A: "Process Device", B: "Input Device", C: "Output Device", D: "Brainware", E: "Storage Device" },
            correctAnswer: "E",
            explanation: "Harddisk adalah media penyimpanan data, maka termasuk <b>Storage Device</b>."
        },
        {
            id: "q5",
            question: "Microsoft Windows 10 adalah contoh dari?",
            options: { A: "Hardware", B: "Brainware", C: "Software Aplikasi", D: "Software Sistem Operasi", E: "Input Device" },
            correctAnswer: "D",
            explanation: "Windows adalah <b>Sistem Operasi</b> yang mengatur sumber daya komputer."
        },
        {
            id: "q6",
            question: "Scanner digunakan untuk memindai dokumen fisik menjadi gambar digital. Scanner adalah?",
            options: { A: "Output Device", B: "Process Device", C: "Storage Device", D: "Input Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Scanner memasukkan data gambar ke dalam komputer, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q7",
            question: "Siapakah yang dimaksud dengan Brainware?",
            options: { A: "Perangkat keras", B: "Program aplikasi", C: "Manusia/Pengguna", D: "Sistem operasi", E: "Media penyimpanan" },
            correctAnswer: "C",
            explanation: "<b>Brainware</b> adalah manusia yang mengoperasikan atau mengatur sistem komputer."
        },
        {
            id: "q8",
            question: "Adobe Photoshop dan Microsoft Word termasuk ke dalam kategori?",
            options: { A: "Software Aplikasi", B: "Sistem Operasi", C: "Hardware", D: "Brainware", E: "Utility" },
            correctAnswer: "A",
            explanation: "Program yang dibuat untuk tugas khusus seperti desain atau mengetik disebut <b>Software Aplikasi</b>."
        },
        {
            id: "q9",
            question: "RAM (Random Access Memory) berfungsi menyimpan data sementara saat program berjalan. RAM termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Software", D: "Storage/Memory", E: "Brainware" },
            correctAnswer: "D",
            explanation: "RAM adalah memori penyimpanan sementara (Primary <b>Storage</b>)."
        },
        {
            id: "q10",
            question: "Printer mencetak dokumen digital menjadi fisik (kertas). Printer adalah?",
            options: { A: "Input Device", B: "Process Device", C: "Output Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Printer mengeluarkan hasil cetakan, jadi termasuk <b>Output Device</b>."
        },
        {
            id: "q11",
            question: "Flashdisk yang ditancapkan ke port USB berfungsi sebagai?",
            options: { A: "Process Device", B: "Storage Device", C: "Input Device", D: "Output Device", E: "Brainware" },
            correctAnswer: "B",
            explanation: "Flashdisk digunakan untuk menyimpan data yang bisa dibawa-bawa (<b>Storage</b>)."
        },
        {
            id: "q12",
            question: "Webcam digunakan untuk mengambil gambar wajah pengguna. Webcam termasuk?",
            options: { A: "Output Device", B: "Storage Device", C: "Process Device", D: "Software", E: "Input Device" },
            correctAnswer: "E",
            explanation: "Webcam memasukkan data visual (video) ke komputer, jadi adalah <b>Input Device</b>."
        },
        {
            id: "q13",
            question: "Seorang Programmer yang membuat kode aplikasi disebut sebagai?",
            options: { A: "Hardware", B: "Software", C: "Brainware", D: "Input", E: "Process" },
            correctAnswer: "C",
            explanation: "Programmer adalah manusia (user ahli), sehingga masuk kategori <b>Brainware</b>."
        },
        {
            id: "q14",
            question: "Speaker mengeluarkan suara dari komputer. Speaker termasuk?",
            options: { A: "Input Device", B: "Process Device", C: "Storage Device", D: "Output Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Speaker menghasilkan keluaran berupa audio, maka disebut <b>Output Device</b>."
        },
        {
            id: "q15",
            question: "Proyektor (LCD Projector) memancarkan layar ke dinding. Proyektor termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Process Device", D: "Storage Device", E: "Brainware" },
            correctAnswer: "B",
            explanation: "Proyektor menampilkan visual ke layar lebar, fungsinya sama seperti monitor (<b>Output</b>)."
        },
        {
            id: "q16",
            question: "Motherboard adalah papan sirkuit tempat komponen menempel. Motherboard termasuk?",
            options: { A: "Software", B: "Brainware", C: "Process Device (Hardware)", D: "Input Device", E: "Output Device" },
            correctAnswer: "C",
            explanation: "Motherboard adalah perangkat keras (<b>Hardware</b>) utama dalam unit pemrosesan."
        },
        {
            id: "q17",
            question: "Aplikasi 'Antivirus' bertugas menjaga keamanan sistem. Antivirus termasuk?",
            options: { A: "Hardware", B: "Brainware", C: "Software Utility", D: "Input Device", E: "Storage Device" },
            correctAnswer: "C",
            explanation: "Antivirus adalah <b>Software</b> (perangkat lunak) utilitas untuk pemeliharaan sistem."
        },
        {
            id: "q18",
            question: "Mouse digerakkan untuk mengarahkan kursor. Mouse adalah?",
            options: { A: "Output Device", B: "Process Device", C: "Storage Device", D: "Input Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Mouse memberikan perintah gerak ke komputer, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q19",
            question: "VGA Card (Kartu Grafis) mengolah tampilan visual. VGA Card termasuk?",
            options: { A: "Input Device", B: "Storage Device", C: "Process Device", D: "Output Device", E: "Brainware" },
            correctAnswer: "C",
            explanation: "VGA Card memproses data grafis sebelum ditampilkan, jadi bagian dari <b>Process Device</b>."
        },
        {
            id: "q20",
            question: "Joystick atau Gamepad digunakan untuk mengontrol game. Alat ini termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Process Device", D: "Storage Device", E: "Software" },
            correctAnswer: "A",
            explanation: "Joystick mengirimkan perintah kontrol ke dalam game, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q21",
            question: "SSD (Solid State Drive) lebih cepat dari Harddisk. Fungsi SSD adalah?",
            options: { A: "Input Data", B: "Output Data", C: "Memproses Data", D: "Menyimpan Data", E: "Menghapus Data" },
            correctAnswer: "D",
            explanation: "SSD adalah media <b>Storage</b> (penyimpanan) data permanen."
        },
        {
            id: "q22",
            question: "Microphone digunakan untuk merekam suara. Microphone termasuk?",
            options: { A: "Output Device", B: "Process Device", C: "Input Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Microphone memasukkan data audio ke sistem, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q23",
            question: "Google Chrome dan Mozilla Firefox adalah contoh dari?",
            options: { A: "Hardware", B: "Software Aplikasi", C: "Sistem Operasi", D: "Brainware", E: "Storage" },
            correctAnswer: "B",
            explanation: "Browser adalah <b>Software Aplikasi</b> untuk menjelajah internet."
        },
        {
            id: "q24",
            question: "Plotter adalah alat cetak ukuran besar untuk spanduk. Plotter termasuk?",
            options: { A: "Input Device", B: "Process Device", C: "Storage Device", D: "Brainware", E: "Output Device" },
            correctAnswer: "E",
            explanation: "Plotter mencetak hasil desain ke media fisik yang besar, jadi termasuk <b>Output Device</b>."
        },
        {
            id: "q25",
            question: "Touchscreen (Layar Sentuh) unik karena bisa berfungsi sebagai?",
            options: { A: "Hanya Input", B: "Hanya Output", C: "Input dan Output", D: "Hanya Storage", E: "Hanya Process" },
            correctAnswer: "C",
            explanation: "Touchscreen bisa menampilkan gambar (Output) dan menerima sentuhan jari (Input) sekaligus."
        }
    ];

    // --- LOGIKA START SCREEN (Validasi Nama) ---
    const btnStart = document.getElementById('btnStart');
    const startScreen = document.getElementById('startScreen');
    const quizInterface = document.getElementById('quizInterface');
    const inputNama = document.getElementById('inputNama');

    btnStart.addEventListener('click', function () {
        const namaValue = inputNama.value.trim();

        // Cek apakah nama sudah diisi
        if (namaValue === "") {
            alert("⚠️ Harap isi NAMA LENGKAP sebelum memulai!");
            inputNama.focus();
            return;
        }

        // Simpan Nama
        studentName = namaValue;

        // Mulai Kuis
        startScreen.style.display = 'none';
        quizInterface.style.display = 'block';
        isQuizActive = true;

        initQuizData();
        renderQuiz();
        checkCompletion();
        startTimer();
    });

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
                finishQuiz(true);
            }
            timeRemaining--;
        }, 1000);
    }

    // --- FUNGSI KIRIM KE GOOGLE SHEET ---
    function sendDataToGoogleSheet(finalScore) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) submitBtn.innerText = "Menyimpan Nilai...";

        // Data yang dikirim hanya Nama dan Nilai (Waktu ditangani oleh server Google)
        const payload = {
            nama: studentName,
            nilai: finalScore
        };

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting agar tidak error cross-origin
            headers: {
                'Content-Type': 'application/json',
            },
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

    function finishQuiz(isTimeOut = false) {
        isQuizActive = false;
        clearInterval(timerInterval);

        let score = 0;
        const form = document.getElementById('quizForm');

        if (isTimeOut) alert("Waktu Habis! Jawaban otomatis dikunci.");

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

        // >>> PANGGIL FUNGSI KIRIM DATA <<<
        sendDataToGoogleSheet(finalScore);

        showResultModal(finalScore, score, selectedQuestions.length);

        submitBtn.style.display = 'none';
        document.getElementById('restartBtn').style.display = 'flex';
        document.getElementById('timerContainer').style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    submitBtn.addEventListener('click', () => {
        const answered = document.querySelectorAll('#quizForm input[type="radio"]:checked').length;
        if (answered < selectedQuestions.length) return;

        if (confirm("Yakin ingin mengumpulkan jawaban?")) {
            finishQuiz(false);
        }
    });

    function showResultModal(finalScore, correct, total) {
        document.getElementById('scoreText').innerText = finalScore;
        // Tampilkan Nama Siswa di Modal Hasil
        document.getElementById('scoreDetail').innerHTML = `
            <div style="margin-bottom:5px; color:#6366f1;">${studentName}</div>
            Benar <b>${correct}</b> dari <b>${total}</b> soal.
        `;
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