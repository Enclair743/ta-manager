"use client";
import React, { useState, useEffect } from "react";

const accentBlue = "#6366f1";
const accentOrange = "#f59e42";

// Helper untuk judul biru dan subjudul oranye
function Title({ children }) {
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

const menuList = [
	{
		key: "umum",
		title: <Title>1. Ketentuan Umum TA</Title>,
		notionUrl: "https://www.notion.so/2623ab4213458056856dce8a9887fc32?v=2623ab42134580e0ae1c000ce19ada38&p=2793ab42134580fc8743ce15c8c6334b&pm=c",
	},
	{
		key: "proposal",
		title: <Title>2. Struktur Proposal TA</Title>,
		notionUrl: "https://www.notion.so/Struktur-Proposal-TA-2793ab42134580568f4bccde447a73bb?source=copy_link",
	},
	{
		key: "laporan",
		title: <Title>3. Struktur Laporan TA</Title>,
		notionUrl: "https://www.notion.so/Struktur-Laporan-TA-2793ab42134580a9aff5cbc63661015f?source=copy_link",
	},
	{
		key: "artikel",
		title: <Title>4. Artikel Ilmiah (Publikasi dari TA)</Title>,
		notionUrl: "https://www.notion.so/Artikel-Ilmiah-Publikasi-dari-TA-2793ab42134580ffa1adc60392e868f8?source=copy_link",
	},
	{
		key: "penulisan",
		title: <Title>5. Tata Cara Penulisan Proposal & Laporan TA</Title>,
		notionUrl: "https://www.notion.so/Tata-Cara-Penulisan-Proposal-Laporan-TA-2793ab42134580d09329fad1a6fd2730?source=copy_link",
	},
	{
		key: "administrasi",
		title: <Title>6. Proses Administrasi TA</Title>,
		notionUrl: "https://www.notion.so/Proses-Administrasi-TA-2793ab421345800e8ffcd87617641695?source=copy_link",
	},
];

export default function PanduanPage() {
	const [theme, setTheme] = useState("dark");

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
	const colorSectionBg =
		theme === "dark" ? "rgba(36,41,54,0.82)" : "rgba(255,255,255,0.96)";
	const colorBorder = theme === "dark" ? "#353a47" : "#e0e7ff";
	const colorText = theme === "dark" ? "#f3f4f6" : "#22223b";
	const colorTitle = theme === "dark" ? colorAccentSoft : colorAccent;
	const colorShadow = theme === "dark"
		? "0 8px 32px rgba(99,102,241,0.18)"
		: "0 8px 32px rgba(99,102,241,0.10)";

	   const [selectedPdf, setSelectedPdf] = useState("ta");

	   const pdfOptions = [
		   {
			   key: "ta",
			   label: "Panduan TA",
			   src: "/panduan/panduan-ta.pdf",
			   title: "Panduan TA ITK",
		   },
		   {
			   key: "ta2",
			   label: "Panduan TA Kedua",
			   src: "/panduan/panduan-ta2.pdf",
			   title: "Panduan TA ITK Kedua",
		   },
	   ];

	   const selectedPdfObj = pdfOptions.find(opt => opt.key === selectedPdf);

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
					   fontSize: "0.97em",
					   position: "relative",
					   transition: "background 0.2s",
				   }}
			   >
				   <header>
					   <h2
						   style={{
							   fontWeight: 900,
							   fontSize: "2em",
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
					{/* Card Link Template TA & Administrasi Fakultas - Atas */}
					<section>
						{menuList.map((item) => (
							<div
								key={item.key}
								className="panduan-accordion"
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
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "1.3em 1.7em",
								}}
							>
								<span style={{ color: colorTitle, fontWeight: 800 }}>
									{item.title}
								</span>
								{item.notionUrl && (
									<a
										href={item.notionUrl}
										target="_blank"
										rel="noopener noreferrer"
										style={{
											color: accentBlue,
											fontWeight: 700,
											fontSize: '0.98em',
											textDecoration: 'underline',
											marginLeft: 24,
										}}
									>
										Link Notion
									</a>
								)}
							</div>
						))}
					</section>
								{/* Card Link Template TA & Administrasi Fakultas - Setelah List Menu (UI/UX lebih gelap dan modern) */}
								<div style={{
									width: "100%",
									maxWidth: 680,
									margin: "36px auto 0 auto",
									background: theme === "dark" ? "#151528" : "#e3e7fa",
									borderRadius: 22,
									boxShadow: theme === "dark" ? "0 0 0 2px #6366f1, 0 8px 32px rgba(99,102,241,0.22)" : "0 0 0 2px #6366f1, 0 8px 32px rgba(99,102,241,0.10)",
									border: `2px solid #6366f1`,
									padding: "2.2em 1.7em 1.7em 1.7em",
									color: colorText,
									display: "flex",
									flexDirection: "column",
									gap: 12,
									fontSize: "1.07em",
									position: "relative",
								}}>
									<div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12 }}>
										<span style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#232347", borderRadius: 12, width: 48, height: 48 }}>
											<svg width="32" height="32" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#6366f1"/><path d="M7 7.5V16.5C7 17.0523 7.44772 17.5 8 17.5H16C16.5523 17.5 17 17.0523 17 16.5V9.5C17 8.94772 16.5523 8.5 16 8.5H9.5L7 7.5Z" fill="#fff"/><rect x="9" y="11" width="6" height="1.5" rx="0.75" fill="#6366f1"/><rect x="9" y="14" width="4" height="1.5" rx="0.75" fill="#6366f1"/></svg>
										</span>
										<span style={{ fontWeight: 900, fontSize: "1.32em", color: colorAccent, letterSpacing: "0.01em" }}>Link Template Tugas Akhir ITK</span>
									</div>
									<ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
										<li style={{ marginBottom: 10 }}><b>Template Cover</b> &rarr; <a href="https://s.itk.ac.id/cover_ta" target="_blank" rel="noopener noreferrer" style={{ color: accentBlue, textDecoration: "underline", fontWeight: 600 }}>s.itk.ac.id/cover_ta</a></li>
										<li style={{ marginBottom: 10 }}><b>Template Skripsi</b> &rarr; <a href="https://s.itk.ac.id/templateskripsi" target="_blank" rel="noopener noreferrer" style={{ color: accentBlue, textDecoration: "underline", fontWeight: 600 }}>s.itk.ac.id/templateskripsi</a></li>
										<li style={{ marginBottom: 10 }}><b>Template Proyek</b> &rarr; <a href="https://s.itk.ac.id/templateproyek" target="_blank" rel="noopener noreferrer" style={{ color: accentBlue, textDecoration: "underline", fontWeight: 600 }}>s.itk.ac.id/templateproyek</a></li>
										<li style={{ marginBottom: 10 }}><b>Template Prototipe</b> &rarr; <a href="https://s.itk.ac.id/templateprototipe" target="_blank" rel="noopener noreferrer" style={{ color: accentBlue, textDecoration: "underline", fontWeight: 600 }}>s.itk.ac.id/templateprototipe</a></li>
										<li style={{ marginBottom: 10 }}><b>Lampiran TA & KP (2025)</b> &rarr; <a href="https://s.itk.ac.id/lampirantakp2025" target="_blank" rel="noopener noreferrer" style={{ color: accentBlue, textDecoration: "underline", fontWeight: 600 }}>s.itk.ac.id/lampirantakp2025</a></li>
									</ul>
									<div style={{ fontWeight: 700, color: accentOrange, marginTop: 22, marginBottom: 8, fontSize: "1.13em" }}>Link Administrasi Fakultas:</div>
									<div style={{ background: "rgba(245,158,66,0.08)", borderRadius: 8, padding: "0.7em 1em", marginBottom: 2 }}>
										<a href="https://layanan-fsti.myst-tech.com/layanan-administrasi" target="_blank" rel="noopener noreferrer" style={{ color: accentOrange, textDecoration: "underline", fontWeight: 700, fontSize: "1.13em" }}>
											https://layanan-fsti.myst-tech.com/layanan-administrasi
										</a>
									</div>
								</div>
				   {/* PDF Selector */}
				   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "48px 0 0 0" }}>
					   <div style={{ width: "100%", maxWidth: 600, marginTop: 18 }}>
						   <div style={{ marginBottom: 8, color: colorAccent, fontWeight: 700 }}>Pilih Panduan TA (PDF):</div>
						   <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
							   {pdfOptions.map(opt => (
								   <button
									   key={opt.key}
									   onClick={() => setSelectedPdf(opt.key)}
									   style={{
										   padding: "0.6em 1.2em",
										   borderRadius: 8,
										   border: selectedPdf === opt.key ? `2px solid ${colorAccent}` : `1.5px solid ${colorBorder}`,
										   background: selectedPdf === opt.key ? colorAccentSoft : colorSectionBg,
										   color: selectedPdf === opt.key ? colorAccent : colorText,
										   fontWeight: 700,
										   fontSize: "1em",
										   cursor: "pointer",
										   transition: "background 0.2s, border 0.2s, color 0.2s",
									   }}
								   >
									   {opt.label}
								   </button>
							   ))}
						   </div>
						   {selectedPdfObj && (
							   <iframe
								   src={selectedPdfObj.src}
								   title={selectedPdfObj.title}
								   width="100%"
								   height="500px"
								   style={{
									   border: `2px solid ${colorAccent}`,
									   borderRadius: 12,
									   background: "#18181b",
								   }}
							   />
						   )}
					   </div>
				   </div>
				   <style>{`
					   @media (max-width: 600px) {
						   main {
							   padding: 10px !important;
							   font-size: 0.93em !important;
						   }
						   .panduan-accordion {
							   padding: 1em 1em !important;
							   font-size: 1em !important;
						   }
						   .pdf-selector-btn {
							   font-size: 0.95em !important;
							   padding: 0.5em 0.8em !important;
						   }
					   }
				   `}</style>
			   </main>
		   </>
	   );
}