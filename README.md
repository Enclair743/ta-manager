# Apa itu aplikasi manajemen TA ini?
Aplikasi ini adalah sebuah web app berbasis Next.js yang dirancang khusus untuk membantu mahasiswa dalam mengelola seluruh proses Tugas Akhir secara digital, terintegrasi, dan mudah diakses dari mana saja.
Semua progress, catatan, referensi, dan jadwal TA tersimpan rapi dalam satu tempat.

## Tujuan aplikasi
- Membantu mahasiswa mengelola dan memantau progress TA secara terstruktur.
- Menyimpan dan mengakses catatan asistensi dan diskusi dengan dosen.
- Mengelola referensi/bibliografi dengan format otomatis.
- Mengatur jadwal, deadline, dan milestones TA menggunakan kalender.
- Mempermudah kolaborasi dan dokumentasi TA.

## Fitur-fitur utama
1. **Dashboard**
	- Ringkasan progress TA.
	- Navigasi ke semua fitur lain.
	- Menampilkan status checklist penulisan, jumlah catatan, jumlah referensi, dan agenda kalender.
2. **Penulisan**
	- Checklist bab TA: Mahasiswa bisa mencentang bab yang sudah ditulis (Judul, Bab 1, Bab 2, dst).
	- Link OneDrive dokumen: Bisa menyimpan & mengakses link dokumen TA (misal file Microsoft Word di OneDrive).
	- Memudahkan tracking progress penulisan TA.
3. **Catatan**
	- Menyimpan catatan asistensi: Hasil diskusi, revisi, masukan dari dosen.
	- Bisa menambah, melihat, dan mengedit catatan dari tiap pertemuan.
	- Semua catatan tersimpan rapi dan mudah dicari.
4. **Referensi**
	- Menyimpan daftar referensi/bibliografi.
	- Bisa menambah referensi (judul & URL).
	- Otomatis membuat format kutipan (misal APA) menggunakan library citation-js.
	- Memudahkan pembuatan daftar pustaka dan menghindari kesalahan format.
5. **Kalender**
	- Integrasi dengan Google Calendar untuk memantau jadwal, deadline, dan agenda TA.
	- Bisa menampilkan kalender langsung di aplikasi.
	- Membantu manajemen waktu dan pengingat deadline penting.

## Keunggulan aplikasi
- Terintegrasi: Semua kebutuhan TA dalam satu aplikasi.
- Mudah digunakan: Interface sederhana, bisa langsung dipakai tanpa setup ribet.
- Akses dari mana saja: Bisa dijalankan di Codespaces, deploy ke Vercel, atau diakses via web.
- Customizable: Bisa dikembangkan sesuai kebutuhan (tambah fitur, ubah tampilan, dst).
- Open source: Kode bisa diubah, diadaptasi, atau dibagikan ke teman.

## Teknologi yang digunakan
- **Next.js**: Framework React untuk web app modern, support server-side & static rendering.
- **React**: Untuk membuat UI interaktif.
- **citation-js**: Library untuk memformat kutipan referensi otomatis.
- **Google Calendar iframe**: Untuk integrasi kalender.
- **OneDrive Link**: Untuk akses dokumen TA dari cloud.

## Alur penggunaan aplikasi
1. Login dan buka aplikasi.
2. Cek progress TA di Dashboard.
3. Update checklist penulisan di fitur Penulisan.
4. Tambah dan baca catatan revisi di fitur Catatan.
5. Tambah referensi dan dapatkan format kutipan otomatis di fitur Referensi.
6. Pantau agenda dan deadline di fitur Kalender.