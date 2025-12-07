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
        },
        // --- TAMBAHAN SOAL (q26 - q50) ---
        {
            id: "q26",
            question: "Barcode Reader yang sering digunakan di kasir supermarket berfungsi membaca kode barang. Alat ini termasuk?",
            options: { A: "Output Device", B: "Process Device", C: "Input Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Barcode reader memindai kode batang dan memasukkan datanya ke komputer, maka termasuk <b>Input Device</b>."
        },
        {
            id: "q27",
            question: "Sistem operasi open source yang berlambang pinguin adalah Linux. Linux termasuk kategori?",
            options: { A: "Hardware", B: "Brainware", C: "Software Aplikasi", D: "Software Sistem Operasi", E: "Storage" },
            correctAnswer: "D",
            explanation: "Linux adalah <b>Sistem Operasi</b> yang bertugas mengelola sumber daya komputer, sama seperti Windows."
        },
        {
            id: "q28",
            question: "Seorang Teknisi yang memperbaiki kerusakan komputer disebut?",
            options: { A: "Hardware", B: "Software", C: "Brainware", D: "Input", E: "Output" },
            correctAnswer: "C",
            explanation: "Teknisi adalah manusia yang memiliki keahlian mengelola perangkat keras, jadi termasuk <b>Brainware</b>."
        },
        {
            id: "q29",
            question: "Headphone digunakan untuk mendengarkan audio secara pribadi. Headphone termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Process Device", D: "Storage Device", E: "Brainware" },
            correctAnswer: "B",
            explanation: "Headphone mengeluarkan suara (audio) dari komputer ke telinga pengguna, maka disebut <b>Output Device</b>."
        },
        {
            id: "q30",
            question: "Stylus Pen digunakan untuk menggambar di tablet grafis. Alat ini termasuk?",
            options: { A: "Storage Device", B: "Output Device", C: "Process Device", D: "Input Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Stylus Pen berfungsi seperti mouse atau pensil untuk memasukkan perintah grafis, jadi merupakan <b>Input Device</b>."
        },
        {
            id: "q31",
            question: "Microsoft Excel adalah program yang digunakan untuk mengolah angka dan tabel. Excel termasuk?",
            options: { A: "Sistem Operasi", B: "Software Aplikasi", C: "Hardware", D: "Utility", E: "Brainware" },
            correctAnswer: "B",
            explanation: "Excel adalah program yang dibuat untuk tujuan khusus (pengolah angka), disebut <b>Software Aplikasi</b>."
        },
        {
            id: "q32",
            question: "Touchpad pada laptop memiliki fungsi yang sama dengan?",
            options: { A: "Keyboard", B: "Monitor", C: "Mouse", D: "Speaker", E: "Printer" },
            correctAnswer: "C",
            explanation: "Touchpad adalah alat penunjuk (pointing device) pengganti <b>Mouse</b> pada laptop (Input Device)."
        },
        {
            id: "q33",
            question: "Seseorang yang hanya bertugas menggunakan aplikasi untuk memasukkan data (entry data) disebut?",
            options: { A: "System Analyst", B: "Programmer", C: "Operator", D: "Administrator", E: "Hacker" },
            correctAnswer: "C",
            explanation: "Pengguna level dasar yang hanya menjalankan aplikasi disebut <b>Operator</b> (Brainware)."
        },
        {
            id: "q34",
            question: "SD Card (Secure Digital Card) yang ada di kamera atau HP berfungsi sebagai?",
            options: { A: "Process Device", B: "Input Device", C: "Storage Device", D: "Output Device", E: "Software" },
            correctAnswer: "C",
            explanation: "SD Card digunakan untuk menyimpan file foto atau video, jadi termasuk <b>Storage Device</b>."
        },
        {
            id: "q35",
            question: "macOS adalah sistem operasi yang dikembangkan oleh perusahaan?",
            options: { A: "Microsoft", B: "Google", C: "Apple", D: "Linux", E: "IBM" },
            correctAnswer: "C",
            explanation: "macOS adalah <b>Sistem Operasi</b> buatan Apple untuk perangkat komputer Mac."
        },
        {
            id: "q36",
            question: "Aplikasi WinRAR atau 7-Zip digunakan untuk mengompres ukuran file. Ini termasuk jenis software?",
            options: { A: "Sistem Operasi", B: "Software Utility", C: "Bahasa Pemrograman", D: "Brainware", E: "Hardware" },
            correctAnswer: "B",
            explanation: "Program bantu yang merawat atau mengelola file sistem disebut <b>Software Utility</b>."
        },
        {
            id: "q37",
            question: "Fingerprint Scanner (pemindai sidik jari) digunakan untuk keamanan login. Alat ini adalah?",
            options: { A: "Output Device", B: "Process Device", C: "Input Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Fingerprint scanner mengambil data biometrik sidik jari untuk dimasukkan ke sistem (<b>Input Device</b>)."
        },
        {
            id: "q38",
            question: "Keping CD-R atau DVD-R digunakan untuk membakar data. Benda ini termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Process Device", D: "Storage Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Keping CD/DVD adalah media penyimpanan optik, jadi termasuk <b>Storage Device</b>."
        },
        {
            id: "q39",
            question: "Sound Card di dalam komputer berfungsi mengolah data audio. Sound Card merupakan bagian dari?",
            options: { A: "Software", B: "Brainware", C: "Hardware (Process)", D: "Input Device", E: "Output Device" },
            correctAnswer: "C",
            explanation: "Sound Card adalah komponen keras yang memproses sinyal suara, bagian dari <b>Process Device</b>."
        },
        {
            id: "q40",
            question: "Android dan iOS pada smartphone adalah contoh dari?",
            options: { A: "Hardware", B: "Software Aplikasi", C: "Sistem Operasi Mobile", D: "Brainware", E: "Input Device" },
            correctAnswer: "C",
            explanation: "Android dan iOS adalah <b>Sistem Operasi</b> yang mengatur kinerja smartphone."
        },
        {
            id: "q41",
            question: "Seorang System Analyst bertugas untuk?",
            options: { A: "Memperbaiki mouse rusak", B: "Merancang dan menganalisis sistem komputer", C: "Hanya mengetik dokumen", D: "Menjual komputer", E: "Membersihkan debu CPU" },
            correctAnswer: "B",
            explanation: "System Analyst adalah <b>Brainware</b> tingkat ahli yang merancang alur sistem."
        },
        {
            id: "q42",
            question: "Printer 3D dapat mencetak benda padat tiga dimensi. Printer 3D termasuk?",
            options: { A: "Input Device", B: "Process Device", C: "Output Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Printer 3D mengeluarkan hasil cetakan fisik berbentuk benda, jadi termasuk <b>Output Device</b>."
        },
        {
            id: "q43",
            question: "Aplikasi WhatsApp yang diinstal di komputer termasuk kategori?",
            options: { A: "Sistem Operasi", B: "Software Aplikasi", C: "Hardware", D: "Brainware", E: "Storage" },
            correctAnswer: "B",
            explanation: "WhatsApp adalah program untuk komunikasi, termasuk <b>Software Aplikasi</b>."
        },
        {
            id: "q44",
            question: "Harddisk Eksternal memiliki fungsi yang sama dengan Harddisk internal, yaitu?",
            options: { A: "Memproses data", B: "Menampilkan data", C: "Menyimpan data", D: "Mencetak data", E: "Menghapus virus" },
            correctAnswer: "C",
            explanation: "Fungsi utama Harddisk (internal/eksternal) adalah sebagai media <b>Storage</b> (penyimpanan)."
        },
        {
            id: "q45",
            question: "Layanan Google Drive atau iCloud disebut sebagai Cloud Storage. Apa fungsinya?",
            options: { A: "Menyimpan data di server internet", B: "Mencetak data jarak jauh", C: "Memproses data grafis", D: "Sebagai sistem operasi utama", E: "Sebagai input device" },
            correctAnswer: "A",
            explanation: "Cloud Storage adalah media <b>penyimpanan</b> berbasis internet (awan)."
        },
        {
            id: "q46",
            question: "Trackball adalah alat yang fungsinya mirip dengan mouse. Trackball termasuk?",
            options: { A: "Output Device", B: "Input Device", C: "Process Device", D: "Storage Device", E: "Software" },
            correctAnswer: "B",
            explanation: "Trackball digunakan untuk menggerakkan kursor dengan memutar bola, fungsinya sebagai <b>Input Device</b>."
        },
        {
            id: "q47",
            question: "Intel Core i3, i5, dan i7 adalah nama model dari komponen?",
            options: { A: "Harddisk", B: "RAM", C: "Processor (CPU)", D: "VGA Card", E: "Motherboard" },
            correctAnswer: "C",
            explanation: "Seri Intel Core adalah contoh produk <b>Processor</b> (Process Device) atau otak komputer."
        },
        {
            id: "q48",
            question: "Bahasa pemrograman seperti Python, Java, dan C++ termasuk dalam kategori?",
            options: { A: "Hardware", B: "Sistem Operasi", C: "Software", D: "Brainware", E: "Storage" },
            correctAnswer: "C",
            explanation: "Bahasa pemrograman adalah kumpulan kode/instruksi digital, jadi termasuk <b>Software</b>."
        },
        {
            id: "q49",
            question: "Kacamata VR (Virtual Reality) menampilkan dunia simulasi ke mata pengguna. Alat ini berfungsi utama sebagai?",
            options: { A: "Input Device", B: "Output Device", C: "Storage Device", D: "Process Device", E: "Software" },
            correctAnswer: "B",
            explanation: "Meskipun canggih, fungsi utama layarnya adalah menampilkan visual ke mata, jadi <b>Output Device</b>."
        },
        {
            id: "q50",
            question: "Seorang Game Developer yang menciptakan permainan komputer termasuk dalam kategori?",
            options: { A: "Hardware", B: "Software", C: "Brainware", D: "Sistem Operasi", E: "User Interface" },
            correctAnswer: "C",
            explanation: "Pembuat game adalah manusia dengan keahlian khusus, maka disebut <b>Brainware</b>."
        },// --- TAMBAHAN SOAL (q51 - q100) ---
        {
            id: "q51",
            question: "Power Supply Unit (PSU) berfungsi menyalurkan listrik ke komponen komputer. PSU termasuk?",
            options: { A: "Software", B: "Storage Device", C: "Process Device", D: "Hardware Pendukung", E: "Brainware" },
            correctAnswer: "D",
            explanation: "PSU adalah <b>Hardware</b> vital yang mengatur daya listrik agar komputer bisa menyala."
        },
        {
            id: "q52",
            question: "Kabel HDMI menghubungkan komputer dengan monitor/proyektor untuk mengirimkan?",
            options: { A: "Hanya Suara", B: "Hanya Gambar", C: "Gambar dan Suara", D: "Listrik", E: "Data Internet" },
            correctAnswer: "C",
            explanation: "HDMI (High-Definition Multimedia Interface) mentransfer <b>audio dan visual</b> (gambar) sekaligus."
        },
        {
            id: "q53",
            question: "Router adalah alat yang berfungsi mengirimkan paket data jaringan internet. Router termasuk?",
            options: { A: "Input Device", B: "Output Device", C: "Network Hardware", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Router dikategorikan sebagai <b>Network Hardware</b> (perangkat keras jaringan)."
        },
        {
            id: "q54",
            question: "Aplikasi 'CorelDRAW' yang sering digunakan anak DKV termasuk jenis software?",
            options: { A: "Sistem Operasi", B: "Software Grafis (Aplikasi)", C: "Utility", D: "Programming", E: "Brainware" },
            correctAnswer: "B",
            explanation: "CorelDRAW adalah <b>Software Aplikasi</b> yang dikhususkan untuk desain grafis vektor."
        },
        {
            id: "q55",
            question: "BIOS (Basic Input Output System) adalah program dasar yang tertanam di motherboard. Ini sering disebut?",
            options: { A: "Freeware", B: "Malware", C: "Firmware", D: "Hardware", E: "Brainware" },
            correctAnswer: "C",
            explanation: "Software yang tertanam permanen pada hardware disebut <b>Firmware</b>."
        },
        {
            id: "q56",
            question: "Satuan terkecil dalam penyimpanan data digital adalah?",
            options: { A: "Byte", B: "Bit", C: "Kilobyte", D: "Megabyte", E: "Gigabyte" },
            correctAnswer: "B",
            explanation: "<b>Bit</b> (Binary Digit) adalah satuan data terkecil (hanya bernilai 0 atau 1)."
        },
        {
            id: "q57",
            question: "Seorang Network Administrator bertugas untuk?",
            options: { A: "Mengedit video", B: "Mengelola jaringan komputer", C: "Mengetik surat", D: "Membuat desain logo", E: "Menjual komputer" },
            correctAnswer: "B",
            explanation: "Network Administrator adalah <b>Brainware</b> yang bertanggung jawab atas kelancaran jaringan (LAN/WAN)."
        },
        {
            id: "q58",
            question: "Optical Mark Reader (OMR) yang digunakan untuk mengoreksi lembar jawab komputer (LJK) termasuk?",
            options: { A: "Output Device", B: "Storage Device", C: "Input Device", D: "Process Device", E: "Software" },
            correctAnswer: "C",
            explanation: "OMR membaca tanda pensil pada kertas dan memasukkannya sebagai data, jadi termasuk <b>Input Device</b>."
        },
        {
            id: "q59",
            question: "Perangkat 'Modem' berfungsi mengubah sinyal digital menjadi analog dan sebaliknya. Modem termasuk?",
            options: { A: "Storage", B: "Hardware Komunikasi", C: "Software", D: "Brainware", E: "Output Saja" },
            correctAnswer: "B",
            explanation: "Modem adalah <b>Hardware</b> yang menjembatani komunikasi data internet."
        },
        {
            id: "q60",
            question: "Heatsink dan Kipas (Fan) di atas prosesor berfungsi untuk?",
            options: { A: "Menambah kecepatan", B: "Menyimpan data", C: "Mendinginkan suhu", D: "Menghasilkan suara", E: "Mencetak gambar" },
            correctAnswer: "C",
            explanation: "Heatsink/Fan adalah hardware pendukung untuk <b>pendinginan</b> agar prosesor tidak overheat."
        },
        {
            id: "q61",
            question: "Istilah 'Freeware' dalam perangkat lunak berarti?",
            options: { A: "Software berbayar mahal", B: "Software gratis sepenuhnya", C: "Software bajakan", D: "Software masa percobaan", E: "Hardware gratis" },
            correctAnswer: "B",
            explanation: "<b>Freeware</b> adalah software yang boleh digunakan secara gratis tanpa batasan waktu."
        },
        {
            id: "q62",
            question: "Istilah 'Shareware' atau 'Trial' berarti?",
            options: { A: "Gratis selamanya", B: "Gratis dalam masa percobaan tertentu", C: "Software rusak", D: "Sistem Operasi", E: "Perangkat Keras" },
            correctAnswer: "B",
            explanation: "<b>Shareware</b> biasanya gratis untuk dicoba (trial), namun harus membayar jika masa percobaan habis."
        },
        {
            id: "q63",
            question: "Thermal Printer yang sering ada di kasir minimarket mencetak struk dengan cara?",
            options: { A: "Menggunakan tinta cair", B: "Menggunakan pita", C: "Menggunakan pemanas", D: "Menggunakan laser", E: "Menggunakan ukiran" },
            correctAnswer: "C",
            explanation: "Thermal Printer menggunakan <b>panas</b> untuk menghitamkan kertas khusus (output device)."
        },
        {
            id: "q64",
            question: "ROM (Read Only Memory) berbeda dengan RAM karena sifatnya?",
            options: { A: "Data hilang saat listrik mati", B: "Data permanen (Non-Volatile)", C: "Kapasitasnya sangat besar", D: "Bisa diedit sesuka hati", E: "Termasuk Input Device" },
            correctAnswer: "B",
            explanation: "ROM menyimpan data firmware secara permanen (<b>Non-Volatile</b>), sedangkan RAM sementara."
        },
        {
            id: "q65",
            question: "Seorang Database Administrator (DBA) bertanggung jawab atas?",
            options: { A: "Desain grafis", B: "Pemasangan kabel", C: "Pengelolaan dan keamanan data", D: "Perbaikan monitor", E: "Penjualan software" },
            correctAnswer: "C",
            explanation: "DBA adalah <b>Brainware</b> spesialis yang mengelola basis data (database)."
        },
        {
            id: "q66",
            question: "Kabel VGA (Video Graphics Array) yang berwarna biru biasanya menghubungkan?",
            options: { A: "Mouse ke CPU", B: "CPU ke Monitor", C: "Keyboard ke Monitor", D: "Printer ke Listrik", E: "Speaker ke CPU" },
            correctAnswer: "B",
            explanation: "VGA adalah standar lama untuk mentransfer visual dari <b>CPU ke Monitor</b>."
        },
        {
            id: "q67",
            question: "Software 'Driver' berfungsi untuk?",
            options: { A: "Menyopiri komputer", B: "Menghubungkan Hardware dengan Sistem Operasi", C: "Membuat desain", D: "Bermain game", E: "Mengetik dokumen" },
            correctAnswer: "B",
            explanation: "<b>Driver</b> adalah software penerjemah agar Sistem Operasi mengenali Hardware yang dipasang."
        },
        {
            id: "q68",
            question: "Cache Memory yang berada di dalam Processor berfungsi untuk?",
            options: { A: "Menyimpan foto", B: "Mempercepat akses data prosesor", C: "Mendinginkan prosesor", D: "Mencetak data", E: "Menghapus virus" },
            correctAnswer: "B",
            explanation: "Cache adalah memori super cepat untuk membantu <b>Proses Device</b> bekerja lebih efisien."
        },
        {
            id: "q69",
            question: "Format file '.exe' biasanya menunjukkan bahwa file tersebut adalah?",
            options: { A: "Gambar", B: "Video", C: "Dokumen Teks", D: "Program Aplikasi (Executable)", E: "Lagu" },
            correctAnswer: "D",
            explanation: "Ekstensi .exe (executable) adalah ciri khas file <b>program/aplikasi</b> di Windows."
        },
        {
            id: "q70",
            question: "Perangkat Smartwatch (Jam Pintar) yang bisa mengukur detak jantung termasuk contoh?",
            options: { A: "Hanya Software", B: "Komputer Wearable (IoT)", C: "Hanya Output", D: "Mesin Ketik", E: "Alat Tulis" },
            correctAnswer: "B",
            explanation: "Smartwatch adalah contoh perangkat <b>IoT (Internet of Things)</b> yang dipakai di tubuh."
        },
        {
            id: "q71",
            question: "Manakah di bawah ini yang BUKAN termasuk Sistem Operasi?",
            options: { A: "Windows 11", B: "Ubuntu Linux", C: "Android", D: "Microsoft PowerPoint", E: "macOS" },
            correctAnswer: "D",
            explanation: "PowerPoint adalah <b>Software Aplikasi</b> presentasi, bukan Sistem Operasi."
        },
        {
            id: "q72",
            question: "Casing Komputer (Box CPU) berfungsi utama sebagai?",
            options: { A: "Otak komputer", B: "Pelindung komponen hardware", C: "Penyimpan data", D: "Alat input", E: "Software" },
            correctAnswer: "B",
            explanation: "Casing adalah <b>Hardware</b> pelindung tempat meletakkan motherboard dan komponen lain."
        },
        {
            id: "q73",
            question: "Video Editor adalah sebutan untuk Brainware yang ahli dalam?",
            options: { A: "Mengedit naskah", B: "Mengedit potongan film/video", C: "Mengedit kode program", D: "Memperbaiki kabel", E: "Mengelola server" },
            correctAnswer: "B",
            explanation: "Video Editor menggunakan software seperti Premiere Pro, termasuk kategori <b>Brainware</b>."
        },
        {
            id: "q74",
            question: "UPS (Uninterruptible Power Supply) berguna saat?",
            options: { A: "Internet mati", B: "Listrik padam (mati lampu)", C: "Monitor rusak", D: "Keyboard macet", E: "Printer habis tinta" },
            correctAnswer: "B",
            explanation: "UPS adalah hardware baterai cadangan yang memberi daya sementara saat <b>listrik padam</b>."
        },
        {
            id: "q75",
            question: "Light Pen digunakan oleh desainer untuk menggambar di layar. Light Pen termasuk?",
            options: { A: "Output Device", B: "Storage Device", C: "Input Device", D: "Process Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Light Pen memasukkan koordinat gambar ke komputer, jadi merupakan <b>Input Device</b>."
        },
        {
            id: "q76",
            question: "Istilah 'Open Source' pada software berarti?",
            options: { A: "Kode programnya tertutup", B: "Kode programnya terbuka dan boleh dimodifikasi", C: "Software sangat mahal", D: "Software buatan Microsoft", E: "Hardware terbuka" },
            correctAnswer: "B",
            explanation: "<b>Open Source</b> berarti kode sumbernya (source code) boleh dilihat dan dikembangkan orang lain."
        },
        {
            id: "q77",
            question: "Perangkat Bluetooth Adapter (Dongle) berfungsi untuk?",
            options: { A: "Mendinginkan CPU", B: "Koneksi nirkabel jarak dekat", C: "Menambah RAM", D: "Menyimpan file", E: "Mencetak foto" },
            correctAnswer: "B",
            explanation: "Bluetooth adapter adalah hardware komunikasi untuk transfer data <b>nirkabel</b> (tanpa kabel)."
        },
        {
            id: "q78",
            question: "Seorang 'Blogger' atau 'Content Creator' termasuk kategori?",
            options: { A: "Hardware", B: "Software", C: "Brainware", D: "Sistem Operasi", E: "Jaringan" },
            correctAnswer: "C",
            explanation: "Mereka adalah manusia yang memanfaatkan komputer untuk berkarya, jadi termasuk <b>Brainware</b>."
        },
        {
            id: "q79",
            question: "Port USB (Universal Serial Bus) adalah colokan standar untuk menghubungkan?",
            options: { A: "Hanya Mouse", B: "Hanya Keyboard", C: "Berbagai perangkat eksternal", D: "Hanya Printer", E: "Listrik tegangan tinggi" },
            correctAnswer: "C",
            explanation: "USB didesain universal untuk menghubungkan <b>banyak jenis</b> input/output/storage device."
        },
        {
            id: "q80",
            question: "Kegiatan 'Debugging' yang dilakukan programmer adalah?",
            options: { A: "Menambah virus", B: "Mencari dan memperbaiki kesalahan kode (bug)", C: "Merusak monitor", D: "Menjual aplikasi", E: "Mematikan komputer" },
            correctAnswer: "B",
            explanation: "Debugging adalah proses <b>Brainware</b> mencari error dalam software."
        },
        {
            id: "q81",
            question: "Kartu Suara (Sound Card) onboard biasanya sudah menempel pada?",
            options: { A: "Monitor", B: "Harddisk", C: "Motherboard", D: "Keyboard", E: "Mouse" },
            correctAnswer: "C",
            explanation: "Komponen onboard berarti sudah terintegrasi/menempel langsung di <b>Motherboard</b>."
        },
        {
            id: "q82",
            question: "Manakah yang merupakan kapasitas penyimpanan paling besar?",
            options: { A: "10 MB", B: "10 GB", C: "1 TB (Terabyte)", D: "1 KB", E: "100 MB" },
            correctAnswer: "C",
            explanation: "Urutannya: KB < MB < GB < <b>TB</b>. 1 TB setara dengan 1000 GB."
        },
        {
            id: "q83",
            question: "Aplikasi 'Notepad' bawaan Windows termasuk jenis?",
            options: { A: "Text Editor Sederhana", B: "Video Editor", C: "Game Engine", D: "Antivirus", E: "Sistem Operasi" },
            correctAnswer: "A",
            explanation: "Notepad adalah <b>Software Aplikasi</b> pengolah teks dasar (Text Editor)."
        },
        {
            id: "q84",
            question: "Scanner QR Code sering kita pakai untuk pembayaran digital. Scanner ini adalah?",
            options: { A: "Output Device", B: "Process Device", C: "Storage Device", D: "Input Device", E: "Software" },
            correctAnswer: "D",
            explanation: "Scanner mengambil data visual kode QR dan memasukkannya ke sistem (<b>Input</b>)."
        },
        {
            id: "q85",
            question: "GUI adalah singkatan dari Graphical User Interface. GUI memudahkan Brainware karena?",
            options: { A: "Hanya berupa teks hitam putih", B: "Menggunakan tampilan grafis dan ikon", C: "Tidak butuh monitor", D: "Sangat sulit digunakan", E: "Hanya untuk programmer" },
            correctAnswer: "B",
            explanation: "GUI adalah antarmuka <b>Software</b> yang visual (ada gambar/ikon) sehingga mudah dipakai."
        },
        {
            id: "q86",
            question: "Drone yang dikendalikan dengan remote control memiliki kamera. Kamera drone berfungsi sebagai?",
            options: { A: "Input Device", B: "Output Device", C: "Process Device", D: "Storage Device", E: "Software" },
            correctAnswer: "A",
            explanation: "Kamera pada drone menangkap gambar lingkungan (input) untuk dikirim ke layar pengguna."
        },
        {
            id: "q87",
            question: "Komponen yang bertugas menghubungkan semua komponen komputer agar bisa saling berkomunikasi adalah?",
            options: { A: "Harddisk", B: "Motherboard (Mainboard)", C: "Casing", D: "Keyboard", E: "Mouse" },
            correctAnswer: "B",
            explanation: "<b>Motherboard</b> adalah papan sirkuit utama tempat lalu lintas data antar komponen (Process)."
        },
        {
            id: "q88",
            question: "Software Browser seperti Chrome menyimpan riwayat penelusuran (History). History disimpan di?",
            options: { A: "Processor", B: "Storage (Harddisk/SSD)", C: "Monitor", D: "Mouse", E: "Printer" },
            correctAnswer: "B",
            explanation: "Data riwayat adalah file yang disimpan di media <b>Storage</b>."
        },
        {
            id: "q89",
            question: "Seorang 'Hacker' dalam arti positif (White Hat) adalah Brainware yang?",
            options: { A: "Mencuri data bank", B: "Merusak sistem orang lain", C: "Menguji keamanan sistem untuk memperbaikinya", D: "Menjual komputer curian", E: "Membuat virus jahat" },
            correctAnswer: "C",
            explanation: "White Hat Hacker menggunakan keahliannya untuk <b>keamanan</b> dan perbaikan sistem."
        },
        {
            id: "q90",
            question: "LED Monitor lebih hemat daya dibanding monitor tabung (CRT). Monitor adalah?",
            options: { A: "Input Device", B: "Process Device", C: "Output Device", D: "Storage Device", E: "Software" },
            correctAnswer: "C",
            explanation: "Fungsi monitor tetap sama, yaitu menampilkan visual (<b>Output Device</b>)."
        },
        {
            id: "q91",
            question: "Penyimpanan Cloud seperti Google Photos membutuhkan syarat utama yaitu?",
            options: { A: "Koneksi Internet", B: "Printer berwarna", C: "Speaker aktif", D: "CD-ROM", E: "Flashdisk" },
            correctAnswer: "A",
            explanation: "Cloud Storage berada di server internet, jadi wajib ada <b>Koneksi Internet</b>."
        },
        {
            id: "q92",
            question: "Tombol 'Ctrl + P' adalah perintah cepat (shortcut) untuk?",
            options: { A: "Menyimpan (Save)", B: "Mencetak (Print)", C: "Menyalin (Copy)", D: "Menempel (Paste)", E: "Memotong (Cut)" },
            correctAnswer: "B",
            explanation: "Shortcut ini memerintahkan komputer mengirim data ke <b>Output Device</b> (Printer)."
        },
        {
            id: "q93",
            question: "Jika komputer melambat, komponen hardware yang sering di-upgrade untuk menambah kecepatan multitasking adalah?",
            options: { A: "Mouse", B: "Keyboard", C: "RAM (Memory)", D: "Speaker", E: "Casing" },
            correctAnswer: "C",
            explanation: "Menambah kapasitas <b>RAM</b> memungkinkan komputer menjalankan lebih banyak aplikasi sekaligus."
        },
        {
            id: "q94",
            question: "Extension file '.jpg' atau '.png' menandakan file tersebut adalah?",
            options: { A: "Musik", B: "Video", C: "Gambar/Foto", D: "Aplikasi", E: "Virus" },
            correctAnswer: "C",
            explanation: "Format ini adalah standar penyimpanan data visual (<b>Gambar</b>)."
        },
        {
            id: "q95",
            question: "Alat yang mengubah dokumen kertas menjadi file PDF di komputer adalah?",
            options: { A: "Printer", B: "Scanner", C: "Speaker", D: "Plotter", E: "Proyektor" },
            correctAnswer: "B",
            explanation: "<b>Scanner</b> berfungsi memindai fisik ke digital (Input)."
        },
        {
            id: "q96",
            question: "CMOS Battery adalah baterai kecil di motherboard yang berfungsi untuk?",
            options: { A: "Menghidupkan layar", B: "Menyimpan pengaturan waktu/jam saat komputer mati", C: "Memutar kipas", D: "Mengirim email", E: "Menghapus data" },
            correctAnswer: "B",
            explanation: "Baterai CMOS menjaga chip BIOS tetap aktif untuk menyimpan jam dan tanggal (Hardware)."
        },
        {
            id: "q97",
            question: "Aplikasi 'Spotify' digunakan untuk streaming musik. Spotify termasuk?",
            options: { A: "Hardware Audio", B: "Software Aplikasi", C: "Sistem Operasi", D: "Brainware", E: "Storage" },
            correctAnswer: "B",
            explanation: "Spotify adalah <b>Software Aplikasi</b> hiburan (entertainment)."
        },
        {
            id: "q98",
            question: "Siswa SMK DKV sedang menggambar di tablet. Tablet tersebut menerima sentuhan jari. Fungsi layar tablet adalah?",
            options: { A: "Input dan Output", B: "Hanya Process", C: "Hanya Storage", D: "Brainware", E: "Software" },
            correctAnswer: "A",
            explanation: "Layar sentuh (touchscreen) adalah perangkat hibrida: <b>Input</b> (sentuhan) dan <b>Output</b> (tampilan)."
        },
        {
            id: "q99",
            question: "Perangkat keras yang sering disebut sebagai 'jantung' komputer karena menyuplai daya adalah?",
            options: { A: "CPU", B: "PSU (Power Supply)", C: "RAM", D: "VGA", E: "HDD" },
            correctAnswer: "B",
            explanation: "Tanpa <b>PSU</b>, aliran 'darah' (listrik) tidak akan mengalir ke komponen lain."
        },
        {
            id: "q100",
            question: "Istilah 'User Interface' (UI) merujuk pada?",
            options: { A: "Bagian dalam kabel", B: "Tampilan visual yang dilihat pengguna", C: "Mesin pencetak", D: "Kecepatan internet", E: "Harga komputer" },
            correctAnswer: "B",
            explanation: "UI adalah tampilan <b>Software</b> yang menjembatani interaksi antara Brainware dan komputer."
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
