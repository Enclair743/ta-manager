"use client";
import { useState, useEffect } from "react";
import app from "../firebase";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
const checklistData = [
	"Judul",
	"Bab 1 - Pendahuluan",
	"Bab 2 - Tinjauan Pustaka",
	"Bab 3 - Metodologi",
	"Bab 4 - Hasil & Pembahasan",
	"Bab 5 - Kesimpulan",
];

export default function PenulisanPage() {
	const db = getFirestore(app);
	const checklistDoc = doc(db, "penulisan", "checklist");
	const [checked, setChecked] = useState(Array(checklistData.length).fill(false));
	const [onedrive, setOnedrive] = useState("");
	const [theme, setTheme] = useState<"dark" | "light">("dark");

	useEffect(() => {
		async function fetchChecklist() {
			const snap = await getDoc(checklistDoc);
			if (snap.exists()) {
				const data = snap.data();
				if (Array.isArray(data.checked)) setChecked(data.checked);
				if (typeof data.onedrive === "string") setOnedrive(data.onedrive);
			}
		}
		fetchChecklist();

		if (typeof window !== "undefined") {
			setTheme(document.body.getAttribute("data-theme") === "light" ? "light" : "dark");
		}
	}, []);

	async function handleChecklistChange(idx: number) {
		const newChecked = [...checked];
		newChecked[idx] = !newChecked[idx];
		setChecked(newChecked);
		await setDoc(checklistDoc, { checked: newChecked, onedrive }, { merge: true });
	}

	async function handleOnedriveChange(val: string) {
		setOnedrive(val);
		await setDoc(checklistDoc, { checked, onedrive: val }, { merge: true });
	}

	return (
		<div>
			<h1 style={{
				fontSize: "1.5rem",
				marginBottom: "1em",
				color: theme === "dark" ? "#f3f4f6" : "#222"
			}}>
				Penulisan Tugas Akhir
			</h1>
			<h2 style={{
				marginBottom: "0.5em",
				color: theme === "dark" ? "#f3f4f6" : "#222"
			}}>Checklist Penulisan</h2>
			<ul
				style={{
					listStyle: "none",
					padding: 0,
					marginBottom: "2em",
					display: "grid",
					gridTemplateColumns: "1fr 1fr",
					gap: "1.3em",
				}}
			>
				{checklistData.map((item, i) => (
					<li
						key={i}
						style={{
							marginBottom: "0.7em",
							background: checked[i]
								? (theme === "dark" ? "linear-gradient(90deg,#353a47,#23272f)" : "#e0e7ff")
								: (theme === "dark" ? "#23272f" : "#fff"),
							borderRadius: "18px",
							padding: "1.3em 1.7em",
							display: "flex",
							alignItems: "center",
							boxShadow: checked[i]
								? "0 8px 32px rgba(99,102,241,0.18)"
								: "0 4px 16px rgba(99,102,241,0.10)",
							border: checked[i]
								? "1.5px solid #6366f1"
								: "1px solid #353a47",
							color: theme === "dark" ? "#f3f4f6" : "#222",
							transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
						}}
					>
						<input
							type="checkbox"
							checked={checked[i]}
							onChange={() => handleChecklistChange(i)}
							style={{
								marginRight: "1em",
								accentColor: "#6366f1",
								width: "1.2em",
								height: "1.2em",
							}}
						/>
						<span style={{ flex: 1, fontWeight: 500 }}>{item}</span>
					</li>
				))}
			</ul>
			<h2 style={{
				marginBottom: "0.5em",
				color: theme === "dark" ? "#f3f4f6" : "#222"
			}}>Link OneDrive Dokumen TA</h2>
			<input
				type="text"
				placeholder="Paste link OneDrive TA"
				value={onedrive}
				onChange={(e) => handleOnedriveChange(e.target.value)}
				style={{
					width: "100%",
					marginBottom: "8px",
					padding: "1em",
					borderRadius: "14px",
					border: "1.5px solid #6366f1",
					fontSize: "1em",
					background: theme === "dark" ? "#23272f" : "#fff",
					color: theme === "dark" ? "#f3f4f6" : "#222",
					boxShadow: theme === "dark"
						? "0 4px 16px rgba(99,102,241,0.18)"
						: "0 4px 16px rgba(99,102,241,0.10)",
					transition: "box-shadow 0.2s, background 0.2s, transform 0.2s"
				}}
			/>
			{onedrive && (
				<p>
					<a
						href={onedrive}
						target="_blank"
						rel="noopener noreferrer"
						style={{
							color: "#0070f3",
							textDecoration: "underline",
							fontWeight: 500,
						}}
					>
						Buka dokumen OneDrive
					</a>
				</p>
			)}
		</div>
	);
}
