"use client";
import React, { useState, useEffect } from "react";

const accentBlue = "#6366f1";
const accentOrange = "#f59e42";

// Helper untuk judul biru dan subjudul oranye
function Title({ children }: { children: React.ReactNode }) {
	return (
		<span style={{
			color: accentBlue,
			fontWeight: 800,
			fontSize: "1.13em",
			letterSpacing: "0.01em"
		}}>
			{children}
		</span>
	);
}
function SubTitle({ children }: { children: React.ReactNode }) {
	return (
		<span style={{
			color: accentOrange,
			fontWeight: 700,
			fontSize: "1em",
			letterSpacing: "0.01em"
		}}>
			{children}
		</span>
	);
}

const menuList = [
	{
		key: "umum",
		title: <Title>1. Ketentuan Umum TA</Title>,
		content: (
			<>
				<ul className="panduan-list">
					<li><b>Syarat ambil TA:</b> Minimal sudah menempuh <b>120 SKS</b> lulus.</li>
					<li><b>Bobot TA:</b> 6–8 SKS.</li>
					<li><b>Tujuan TA:</b> Menghasilkan karya ilmiah penelitian yang sistematis, mandiri, dan orisinal.</li>
					<li>
						<b>Etika akademik:</b>
						<ul>
							<li>Wajib jujur, tidak boleh ada fabrikasi data.</li>
							<li>
								Bebas plagiarisme:
								<ul>
									<li>Laporan TA ≤ <b>30%</b> (Turnitin).</li>
									<li>Artikel ilmiah ≤ <b>20%</b>.</li>
								</ul>
							</li>
							<li>Jika melebihi → sidang/unggah ditunda.</li>
						</ul>
					</li>
					<li>
						<b>Proses TA:</b> Seminar Proposal → Penelitian + Bimbingan → Sidang TA → Revisi → Unggah TA & Artikel.
					</li>
				</ul>
			</>
		),
	},
	{
		key: "proposal",
		title: <Title>2. Struktur Proposal TA</Title>,
		content: (
			<>
				<div style={{ marginBottom: 8, fontWeight: 500 }}><SubTitle>Proposal terdiri atas:</SubTitle></div>
				<div style={{ marginBottom: 6, fontWeight: 600 }}><SubTitle>Bagian Awal</SubTitle></div>
				<ul className="panduan-list">
					<li>Cover</li>
					<li>Lembar Persetujuan</li>
					<li>Kata Pengantar</li>
					<li>Abstrak</li>
					<li>Daftar Isi</li>
					<li>Daftar Gambar</li>
					<li>Daftar Tabel</li>
					<li>Daftar Notasi (jika ada)</li>
				</ul>
				<div style={{ margin: "14px 0 6px 0", fontWeight: 600 }}><SubTitle>Bagian Isi</SubTitle></div>
				<ul className="panduan-list">
					<li>
						<b>BAB I Pendahuluan</b>
						<ul>
							<li>Latar Belakang</li>
							<li>Rumusan Masalah</li>
							<li>Tujuan</li>
							<li>Batasan Masalah</li>
							<li>Manfaat Penelitian</li>
							<li>Kerangka Penelitian</li>
						</ul>
					</li>
					<li><b>BAB II Tinjauan Pustaka</b> (teori dan penelitian terdahulu)</li>
					<li>
						<b>BAB III Metodologi Penelitian</b>
						<ul>
							<li>Prosedur penelitian</li>
							<li>Variabel</li>
							<li>Flowchart/diagram alir</li>
							<li>Rencana jadwal penelitian</li>
						</ul>
					</li>
				</ul>
				<div style={{ margin: "14px 0 6px 0", fontWeight: 600 }}><SubTitle>Bagian Akhir</SubTitle></div>
				<ul className="panduan-list">
					<li>Daftar Pustaka (≥70% dari jurnal terbaru ≤10 tahun)</li>
					<li>Lampiran</li>
				</ul>
			</>
		),
	},
	{
		key: "laporan",
		title: <Title>3. Struktur Laporan TA</Title>,
		content: (
			<>
				<div style={{ marginBottom: 6, fontWeight: 600 }}><SubTitle>Bagian Awal</SubTitle></div>
				<ul className="panduan-list">
					<li>Cover (softcover luar & dalam)</li>
					<li>Pernyataan Keaslian</li>
					<li>Pernyataan Publikasi</li>
					<li>Lembar Pengesahan</li>
					<li>Kata Pengantar</li>
					<li>Abstrak (Bahasa Indonesia & Inggris)</li>
					<li>Daftar Isi</li>
					<li>Daftar Gambar</li>
					<li>Daftar Tabel</li>
					<li>Daftar Notasi (jika ada)</li>
				</ul>
				<div style={{ margin: "14px 0 6px 0", fontWeight: 600 }}><SubTitle>Bagian Isi</SubTitle></div>
				<ul className="panduan-list">
					<li>BAB I Pendahuluan</li>
					<li>BAB II Tinjauan Pustaka</li>
					<li>BAB III Metodologi Penelitian</li>
					<li>BAB IV Hasil dan Pembahasan</li>
					<li>BAB V Penutup (Kesimpulan & Saran)</li>
				</ul>
				<div style={{ margin: "14px 0 6px 0", fontWeight: 600 }}><SubTitle>Bagian Akhir</SubTitle></div>
				<ul className="panduan-list">
					<li>Daftar Pustaka (HARVARD style, menggunakan Mendeley/Zotero/Endnote)</li>
					<li>Lampiran</li>
				</ul>
			</>
		),
	},
	{
		key: "artikel",
		title: <Title>4. Artikel Ilmiah (Publikasi dari TA)</Title>,
		content: (
			<>
				<ul className="panduan-list">
					<li>Wajib dibuat dari hasil TA.</li>
					<li>Panjang: 6–8 halaman.</li>
					<li>Disetujui oleh pembimbing sebelum dipublikasikan.</li>
					<li>
						<SubTitle>Struktur Artikel:</SubTitle>
						<ol style={{ marginTop: 8, marginBottom: 0, paddingLeft: 22 }}>
							<li>Judul (10–15 kata)</li>
							<li>Identitas Penulis</li>
							<li>Abstrak</li>
							<li>Pendahuluan</li>
							<li>Tinjauan Pustaka</li>
							<li>Metodologi</li>
							<li>Hasil & Pembahasan</li>
							<li>Kesimpulan & Saran</li>
							<li>Ucapan Terima Kasih</li>
							<li>Daftar Pustaka</li>
						</ol>
					</li>
				</ul>
			</>
		),
	},
	{
		key: "penulisan",
		title: <Title>5. Tata Cara Penulisan Proposal & Laporan TA</Title>,
		content: (
			<>
				<ul className="panduan-list">
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 1. Aturan Penulisan</span>
						<ul>
							<li>
								<b>Software & media:</b>
								<ul>
									<li>Diketik dengan Microsoft Word.</li>
									<li>Dicetak di kertas HVS A4, 80 gr, putih polos.</li>
									<li>Bolak-balik (dua muka) → menggunakan margin mirror.</li>
								</ul>
							</li>
							<li>
								<b>Spasi:</b>
								<ul>
									<li>Jarak antarbaris: 1,5 spasi.</li>
									<li>Abstrak: 1 spasi.</li>
								</ul>
							</li>
							<li>
								<b>Margin (mirror):</b>
								<ul>
									<li>Inside (dalam): 4 cm.</li>
									<li>Top, Outside, Bottom: 3 cm.</li>
								</ul>
							</li>
							<li>
								<b>Paragraf:</b>
								<ul>
									<li>Teks rata kiri–kanan (justify alignment).</li>
									<li>Baris pertama paragraf menjorok 1 cm (first line indent).</li>
								</ul>
							</li>
							<li>
								<b>Huruf (font):</b> Times New Roman, ukuran 12 pt.
							</li>
							<li>
								<b>Header & Footer hanya untuk:</b>
								<ul>
									<li>Header: "Tugas Akhir Program Studi …".</li>
									<li>Footer: Nomor halaman.</li>
								</ul>
							</li>
							<li>
								<b>Awal Bab:</b>
								<ul>
									<li>Harus dimulai di halaman ganjil.</li>
									<li>Jika ada halaman kosong → ditulis: “Halaman ini sengaja dikosongkan”.</li>
								</ul>
							</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 2. Bahasa</span>
						<ul>
							<li>Menggunakan Bahasa Indonesia baku, sesuai EYD/PUEBI.</li>
							<li>
								<b>Istilah asing:</b>
								<ul>
									<li>Jika ada padanan dalam Bahasa Indonesia → gunakan padanan.</li>
									<li>Jika tidak ada → tulis miring (italic).</li>
								</ul>
							</li>
							<li>Konsistensi istilah harus dijaga. Jika banyak istilah asing → buat Daftar Istilah di lampiran.</li>
							<li>
								<b>Tidak boleh:</b>
								<ul>
									<li>Kata ganti orang pertama (saya, kita, kami, penulis).</li>
									<li>Kalimat perintah.</li>
									<li>Gunakan kalimat pasif dan formal.</li>
								</ul>
							</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 3. Penulisan Abstrak</span>
						<ul>
							<li>
								<b>Proposal TA (Bahasa Indonesia):</b>
								<ul>
									<li>Berisi: latar belakang, rumusan masalah, tujuan, prosedur singkat penelitian, variabel.</li>
								</ul>
							</li>
							<li>
								<b>Laporan TA (Bahasa Indonesia & Inggris):</b>
								<ul>
									<li>Berisi: latar belakang, masalah, tujuan, metode, variabel, hasil penelitian, kesimpulan.</li>
								</ul>
							</li>
							<li>Panjang: 200–350 kata, sebisa mungkin 1 halaman.</li>
							<li>Spasi: 1 spasi.</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 4. Penulisan Bab, Sub-Bab, Sub-Sub Bab</span>
						<ul>
							<li>Setiap Bab dimulai di halaman baru.</li>
							<li>
								<b>Nomor Bab:</b> Angka Romawi kapital (BAB I, BAB II, …).
								<ul>
									<li>Judul bab → huruf kapital semua, rata tengah, font 16 pt bold.</li>
								</ul>
							</li>
							<li>
								<b>Sub Bab:</b> angka Arab (1.1, 1.2 …).
								<ul>
									<li>Judul → Title Case, bold, 14 pt.</li>
									<li>Rata kiri.</li>
								</ul>
							</li>
							<li>Sub-Sub Bab: angka kombinasi (1.1.1, dst).</li>
							<li>Maksimal 3 level (bab / sub-bab / sub-sub bab).</li>
							<li>
								<span style={{ fontWeight: 600, color: "#f59e42" }}>📌 Contoh format struktur:</span>
								<div
									className="panduan-contoh-bg"
									style={{
										background: undefined, // background akan diatur via CSS
										color: "#f3f4f6",
										fontFamily: "monospace",
										padding: "1em",
										borderRadius: 12,
										margin: "0.5em 0 1.5em 0",
										overflowX: "auto",
										fontSize: "1em",
									}}
								>
									BAB I<br />
									PENDAHULUAN<br /><br />
									1.1 Latar Belakang<br />
									1.1.1 Kondisi Umum<br />
									A. Bagian<br />
									A.1 Sub Bagian
								</div>
							</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 5. Penomoran Halaman</span>
						<ul>
							<li>Bagian Awal (dari Pernyataan Keaslian TA hingga Daftar Notasi) → angka Romawi kecil (i, ii, iii …).</li>
							<li>Bagian Isi (Bab I – Bab V) → angka Arab (1, 2, 3 …).</li>
							<li>Daftar Pustaka → tidak memakai nomor halaman.</li>
							<li>
								<b>Lampiran:</b> pakai format khusus sesuai jenis:
								<ul>
									<li>Lampiran data penelitian: A-1, A-2 …</li>
									<li>Lampiran metode perhitungan: B-1, B-2 …</li>
								</ul>
							</li>
							<li>
								<span style={{ fontWeight: 600, color: "#f59e42" }}>📌 Posisi nomor halaman:</span>
								<ul>
									<li>Bagian awal: bawah kanan.</li>
									<li>
										Bagian isi:
										<ul>
											<li>Halaman pertama tiap Bab → tengah bawah.</li>
											<li>Halaman selanjutnya → kanan bawah.</li>
										</ul>
									</li>
								</ul>
							</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 6. Penulisan Tabel & Gambar</span>
						<ul>
							<li>Wajib diberi nomor & judul.</li>
							<li>
								<b>Tabel:</b>
								<ul>
									<li>Judul di atas tabel.</li>
									<li>Nomor tabel mengikuti bab → misal: Tabel 2.1.</li>
									<li>Letak rata tengah.</li>
									<li>Jika panjang → boleh dilanjutkan ke halaman berikut (dengan kepala tabel diulang).</li>
								</ul>
							</li>
							<li>
								<b>Gambar:</b>
								<ul>
									<li>Judul di bawah gambar.</li>
									<li>Nomor gambar mengikuti bab → misal: Gambar 3.2.</li>
									<li>Letak rata tengah.</li>
								</ul>
							</li>
							<li>
								<b>Sumber:</b>
								<ul>
									<li>Jika kutipan → tulis sumber di bawah tabel/gambar.</li>
									<li>Format: Nama Belakang, Tahun.</li>
								</ul>
							</li>
							<li>
								<span style={{ fontWeight: 600, color: "#f59e42" }}>📌 Contoh:</span>
								<ul>
									<li>
										<span style={{ fontWeight: 500 }}>Tabel:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Tabel 1. Perbandingan Yield dan Kemurnian Kristal<br />
											(Gotama, 2014)
										</div>
									</li>
									<li>
										<span style={{ fontWeight: 500 }}>Gambar:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Gambar 2. Hubungan supersaturasi dengan laju nukleasi<br />
											(O’Sullivan dkk, 2012)
										</div>
									</li>
								</ul>
							</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 7. Penulisan Persamaan</span>
						<ul>
							<li>
								Diberi nomor persamaan sesuai bab, ditulis rata kanan.
								<ul>
									<li>
										<span style={{ fontWeight: 500 }}>Contoh:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
												textAlign: "right",
											}}
										>
											P = F/A &nbsp;&nbsp;&nbsp;(2.1)
										</div>
									</li>
								</ul>
							</li>
							<li>Notasi dari persamaan → wajib dijelaskan di Daftar Notasi.</li>
						</ul>
					</li>
					<li>
						<span style={{ fontWeight: 600, color: accentBlue }}>🔹 8. Penulisan Daftar Pustaka</span>
						<ul>
							<li>Wajib pakai reference manager: Mendeley, Zotero, Endnote.</li>
							<li>Format: HARVARD style.</li>
							<li>
								<b>Ketentuan:</b>
								<ul>
									<li>Daftar pustaka diurutkan alfabetis, tanpa nomor.</li>
									<li>Baris pertama rata kiri, baris berikutnya menjorok 1,27 cm (hanging indent).</li>
									<li>Gelar akademik tidak ditulis.</li>
									<li>Minimal 70% referensi dari jurnal terbaru ≤10 tahun.</li>
								</ul>
							</li>
							<li>
								<span style={{ fontWeight: 600, color: "#f59e42" }}>📌 Contoh penulisan:</span>
								<ul>
									<li>
										<span style={{ fontWeight: 500 }}>Jurnal:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Harunsyah. (2011), “Peningkatan Mutu Minyak Nilam Rakyat melalui Proses Pemurnian”, Jurnal Teknologi Politeknik Negeri Lhokseumawe, Vol. 11, No. 1, hal. 1-7.
										</div>
									</li>
									<li>
										<span style={{ fontWeight: 500 }}>Buku:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Jones, A.G. (2002), Crystallization Process System, Butterworth-Heinemann, Oxford.
										</div>
									</li>
									<li>
										<span style={{ fontWeight: 500 }}>Prosiding:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Silviana. (2006), “Studi Awal Deterpenisasi Minyak Nilam melalui Ekstraksi dengan Pelarut Etanol”, Prosiding Konferensi Nasional Minyak Atsiri, IPB Bogor, hal. 143-149.
										</div>
									</li>
									<li>
										<span style={{ fontWeight: 500 }}>Internet:</span>
										<div
											className="panduan-contoh-bg"
											style={{
												background: undefined,
												color: "#f3f4f6",
												fontFamily: "monospace",
												padding: "1em",
												borderRadius: 12,
												margin: "0.5em 0",
												overflowX: "auto",
												fontSize: "1em",
											}}
										>
											Malya Optima Indonesia. (2013). Patchouli Oil Light. [online] tersedia di: http://malya.co.id/products/patchouli-oil-light [diakses 21 Desember 2013].
										</div>
									</li>
								</ul>
							</li>
						</ul>
					</li>
				</ul>
			</>
		),
	},
	{
		key: "administrasi",
		title: <Title>6. Proses Administrasi TA</Title>,
		content: (
			<>
				<p><SubTitle>Silakan isi detail proses administrasi TA di sini.</SubTitle></p>
			</>
		),
	},
];

export default function PanduanPage() {
	const [openIdx, setOpenIdx] = useState<number | null>(null);
	const [theme, setTheme] = useState<"dark" | "light">("dark");

	useEffect(() => {
		if (typeof window !== "undefined") {
			const t =
				document.body.getAttribute("data-theme") ||
				localStorage.getItem("theme") ||
				"dark";
			setTheme(t === "light" ? "light" : "dark");
		}
	}, []);

	const colorAccent = "#6366f1";
	const colorAccentSoft = "#a5b4fc";
	const colorCardBg = theme === "dark" ? "#23272f" : "#fff";
	const colorSectionBg =
		theme === "dark" ? "rgba(36,41,54,0.82)" : "rgba(255,255,255,0.96)";
	const colorBorder = theme === "dark" ? "#353a47" : "#e0e7ff";
	const colorText = theme === "dark" ? "#f3f4f6" : "#22223b";
	const colorTitle = theme === "dark" ? colorAccentSoft : colorAccent;
	const colorShadow = theme === "dark"
		? "0 8px 32px rgba(99,102,241,0.18)"
		: "0 8px 32px rgba(99,102,241,0.10)";

	return (
		<>
			<main
				style={{
					maxWidth: 700,
					margin: "0 auto",
					padding: 24,
					background: colorSectionBg,
					borderRadius: 18,
					boxShadow: colorShadow,
					color: colorText,
					border: `1.5px solid ${colorBorder}`,
					fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
					fontSize: "0.97em", // lebih kecil dan modern
					position: "relative",
					transition: "background 0.2s",
				}}
			>
				<header>
					<h2
						style={{
							fontWeight: 900,
							fontSize: "2em", // sedikit diperkecil
							marginBottom: 24,
							color: colorTitle,
							background:
								theme === "dark"
									? "linear-gradient(90deg,#a5b4fc,#6366f1)"
									: "linear-gradient(90deg,#6366f1,#a5b4fc)",
							backgroundClip: "text",
							WebkitBackgroundClip: "text",
							WebkitTextFillColor: "transparent",
							letterSpacing: "0.02em",
							fontFamily: "'Montserrat', 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
							textAlign: "center",
						}}
					>
						Panduan Tugas Akhir ITK
					</h2>
				</header>
				<section>
					{menuList.map((item, idx) => (
						<div
							key={item.key}
							className={`panduan-accordion${openIdx === idx ? " open" : ""}`}
							style={{
								marginBottom: 18,
								borderRadius: 14,
								border: `1.5px solid ${colorBorder}`,
								background: "#18181b",
								boxShadow: colorShadow,
								overflow: "hidden",
								transition: "box-shadow 0.2s, background 0.2s",
								fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
								fontSize: "0.97em",
							}}
						>
							<button
								onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
								className="panduan-accordion-btn"
								style={{
									width: "100%",
									textAlign: "left",
									border: "none",
									padding: "1.3em 1.7em",
									fontSize: "1.08em", // judul accordion lebih kecil
									fontWeight: 800,
									cursor: "pointer",
									display: "flex",
									alignItems: "center",
									gap: 12,
									color: colorTitle,
									letterSpacing: "0.02em",
									transition: "color 0.2s, background 0.2s",
									fontFamily: "'Montserrat', 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif",
									borderBottom: openIdx === idx ? `1px solid ${colorBorder}` : "none",
									background: openIdx === idx ? (theme === "dark" ? "#23272f" : "#e0e7ff") : "none",
								}}
							>
								{item.title}
								<span
									style={{
										marginLeft: "auto",
										fontSize: "1.3em",
										color: colorAccent,
										transition: "transform 0.2s",
										transform: openIdx === idx ? "rotate(180deg)" : "none",
									}}
								>
									▼
								</span>
							</button>
							<div
								style={{
									maxHeight: openIdx === idx ? 400 : 0,
									opacity: openIdx === idx ? 1 : 0,
									overflow: openIdx === idx ? "auto" : "hidden",
									overflowY: openIdx === idx ? "auto" : "unset",
									transition: "max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.25s",
									background: "#18181b",
									borderTop: openIdx === idx ? `1px solid ${colorBorder}` : "none",
									color: colorText,
									fontSize: "0.97em",
									lineHeight: "1.65",
									letterSpacing: "0.01em",
									fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif",
									padding: openIdx === idx ? "1.3em 2em" : "0 2em",
								}}
								aria-hidden={openIdx !== idx}
							>
								{openIdx === idx && item.content}
							</div>
						</div>
					))}
				</section>
				{/* Tampilkan PDF statis dari app/panduan/panduan-ta.pdf */}
				<div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "48px 0 0 0" }}>
					<div style={{ width: "100%", maxWidth: 600, marginTop: 18 }}>
						<div style={{ marginBottom: 8, color: colorAccent, fontWeight: 700 }}>Preview Panduan TA (PDF):</div>
						<iframe
							src="/panduan/panduan-ta.pdf"
							title="Panduan TA ITK"
							width="100%"
							height="500px"
							style={{
								border: "2px solid #6366f1",
								borderRadius: 12,
								background: "#18181b",
							}}
						/>
					</div>
				</div>
				<style>{`
					.panduan-list {
						margin: 0 0 0 1.2em;
						padding: 0;
						font-size: 0.97em;
						font-family: 'Montserrat', 'Poppins', 'Segoe UI', Arial, sans-serif;
						line-height: 1.65;
						letter-spacing: 0.01em;
					}
					.panduan-list li {
						margin-bottom: 0.45em;
						line-height: 1.65;
						font-size: 1em;
					}
					.panduan-list ul, .panduan-list ol {
						margin-top: 0.2em;
						margin-bottom: 0.2em;
						margin-left: 1.2em;
						padding-left: 1.2em;
						font-size: 0.96em;
					}
					.panduan-list b {
						font-weight: 700;
						font-size: 1em;
					}
					.panduan-accordion-btn {
						font-size: 1.08em !important;
						letter-spacing: 0.02em;
					}
					.panduan-accordion.open > div {
						scrollbar-width: thin;
						scrollbar-color: #6366f1 #23272f;
					}
					.panduan-accordion.open > div::-webkit-scrollbar {
						width: 8px;
					}
					.panduan-accordion.open > div::-webkit-scrollbar-thumb {
						background: #6366f1;
						border-radius: 8px;
					}
					.panduan-accordion.open > div::-webkit-scrollbar-track {
						background: #23272f;
						border-radius: 8px;
					}
					.panduan-accordion.open > div .panduan-contoh-bg {
						background: #18181b !important;
						color: #f3f4f6 !important;
					}
					@media (max-width: 600px) {
						main {
							padding: 10px !important;
							font-size: 0.93em !important;
						}
						.panduan-accordion-btn {
							padding: 1em 1em !important;
							font-size: 1em !important;
						}
						.panduan-list {
							font-size: 0.93em !important;
						}
						.panduan-accordion.open > div {
							max-height: 260px !important;
						}
					}
				`}</style>
			</main>
		</>
	);
}
