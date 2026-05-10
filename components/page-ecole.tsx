"use client"
import React, { useState, useRef } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal, StarRating } from "@/components/ui-atoms"
import { School, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronDown, ChevronRight, MapPin, Camera, Wrench, Users, CheckCircle, FileText, Image, UserPlus, CalendarDays, Palette } from "lucide-react"


/* Convert file to base64 data URL for persistence */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

import type { Ecole, EcoleClasse, Eleve, MaterielItem, ChecklistItem, JournalEntry, User } from "@/lib/types"
import { correctText } from "@/lib/spell-correction"

export function PageEcole({ ecoles, setEcoles, toast, addPoints, user, saveEcole, deleteEcole }: {
  ecoles: Ecole[]; setEcoles: React.Dispatch<React.SetStateAction<Ecole[]>>;
  toast: (m: string) => void; addPoints: (p: number, r: string) => void; user: User;
  saveEcole?: (ecole: Ecole) => Promise<boolean>;
  deleteEcole?: (id: string | number) => Promise<void>;
}) {
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState<Ecole | null>(null)
  const [selectedEcole, setSelectedEcole] = useState<Ecole | null>(null)
  const [ecoleTab, setEcoleTab] = useState("journal")
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [materielModal, setMaterielModal] = useState(false)
  const [materielViewModal, setMaterielViewModal] = useState<MaterielItem | null>(null)
  const [materielEditModal, setMaterielEditModal] = useState<MaterielItem | null>(null)
  const [expandedClasse, setExpandedClasse] = useState<number | string | null>(null)
  const [attendanceDate, setAttendanceDate] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
  })

  const blankEcole = { nom: "", adresse: "", description: "", infrastructure: "", couleur: "#0d9488" }
  const [form, setForm] = useState<any>({ ...blankEcole, materielItems: [], ecolePhotos: [] })
  const SCHOOL_COLORS = ["#0d9488", "#3b82f6", "#ef4444", "#f59e0b", "#22c55e", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#6366f1"]
  const [editForm, setEditForm] = useState<any>(blankEcole)
  const f = (k: string) => (e: any) => setForm((v: any) => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm((v: any) => ({ ...v, [k]: e.target.value }))

  const [classeForm, setClasseForm] = useState({ nom: "", niveau: "", nb: "" })
  const [eleveForm, setEleveForm] = useState({ prenom: "", nom: "" })
  const [journalForm, setJournalForm] = useState({ titre: "", type: "Observation", date: "", observations: "", reflexion: "" })
  const [checkInput, setCheckInput] = useState("")
  const [materielForm, setMaterielForm] = useState<any>({ nom: "", quantite: "", categorie: "Sport", etat: "Bon", note: 0, informations: "", photos: [] })
  const [materielEditForm, setMaterielEditForm] = useState<any>({})
  const ecolePhotoRef = useRef<HTMLInputElement>(null)
  const materielPhotoRef = useRef<HTMLInputElement>(null)
  const materielEditPhotoRef = useRef<HTMLInputElement>(null)

  const updateEcole = async (id: number | string, data: Partial<Ecole>) => {
    const ecole = ecoles.find(e => e.id === id)
    if (ecole) {
      const updatedEcole = { ...ecole, ...data } as Ecole
      if (saveEcole) {
        await saveEcole(updatedEcole)
      } else {
        setEcoles(es => es.map(e => e.id === id ? updatedEcole : e))
      }
      setSelectedEcole(prev => prev && prev.id === id ? updatedEcole : prev)
    }
  }

  const handleEcolePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      const newPhoto = { url: dataUrl, name: file.name }
      if (selectedEcole) {
        const cur = ecoles.find(x => x.id === selectedEcole.id)
        updateEcole(selectedEcole.id, { ecolePhotos: [...(cur?.ecolePhotos || []), newPhoto] })
      }
    } catch { toast("Erreur lors du chargement de la photo.") }
    e.target.value = ""
  }

  const handleMaterielPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      const newPhoto = { url: dataUrl, name: file.name }
      if (isEdit) {
        setMaterielEditForm((v: any) => ({ ...v, photos: [...(v.photos || []), newPhoto] }))
      } else {
        setMaterielForm((v: any) => ({ ...v, photos: [...(v.photos || []), newPhoto] }))
      }
    } catch { toast("Erreur lors du chargement de la photo.") }
    e.target.value = ""
  }

  const save = async () => {
    if (!form.nom) return
    const newEcole = { 
      id: Date.now(), 
      nom: correctText(form.nom), 
      adresse: form.adresse, 
      description: correctText(form.description), 
      infrastructure: form.infrastructure, 
      couleur: form.couleur || "#0d9488",
      ecolePhotos: form.ecolePhotos || [], 
      materielItems: form.materielItems || [], 
      classes: [], 
      journal: [], 
      checklist: [] 
    } as Ecole
    
    if (saveEcole) {
      const success = await saveEcole(newEcole)
      if (!success) {
        toast("Erreur lors de la sauvegarde. Reessayez.")
        return
      }
    } else {
      setEcoles(e => [...e, newEcole])
    }
    setForm({ ...blankEcole, materielItems: [], ecolePhotos: [] })
    setModal(false); toast("Ecole ajoutee !"); addPoints(15, "ecole")
  }
  const saveEditFn = async () => {
    const updatedEcole = { ...editModal!, ...editForm } as Ecole
    if (saveEcole) {
      const success = await saveEcole(updatedEcole)
      if (!success) {
        toast("Erreur lors de la modification. Reessayez.")
        return
      }
    } else {
      setEcoles(es => es.map(x => x.id === editModal!.id ? updatedEcole : x))
    }
    setEditModal(null); toast("Ecole modifiee !")
  }
  const del = async (id: number | string) => {
    if (deleteEcole) {
      await deleteEcole(id)
    } else {
      setEcoles(es => es.filter(x => x.id !== id))
    }
    if (selectedEcole?.id === id) setSelectedEcole(null)
    toast("Ecole supprimee.")
  }

  const addClasse = () => {
    if (!selectedEcole || !classeForm.nom) return
    const newC: EcoleClasse = { id: Date.now(), nom: classeForm.nom, niveau: classeForm.niveau, nb: classeForm.nb, eleves: [] }
    updateEcole(selectedEcole.id, { classes: [...(selectedEcole.classes || []), newC] })
    setClasseForm({ nom: "", niveau: "", nb: "" }); toast("Classe ajoutee !")
  }

  const addEleve = (classeId: number | string) => {
    if (!selectedEcole || !eleveForm.prenom) return
    const newEleve: Eleve = { id: Date.now(), prenom: eleveForm.prenom, nom: eleveForm.nom, presences: {} }
    const updatedClasses = (selectedEcole.classes || []).map(cl =>
      cl.id === classeId ? { ...cl, eleves: [...(cl.eleves || []), newEleve] } : cl
    )
    updateEcole(selectedEcole.id, { classes: updatedClasses })
    setEleveForm({ prenom: "", nom: "" }); toast("Eleve ajoute !")
  }

  const removeEleve = (classeId: number | string, eleveId: number | string) => {
    if (!selectedEcole) return
    const updatedClasses = (selectedEcole.classes || []).map(cl =>
      cl.id === classeId ? { ...cl, eleves: (cl.eleves || []).filter(el => el.id !== eleveId) } : cl
    )
    updateEcole(selectedEcole.id, { classes: updatedClasses })
    toast("Eleve supprime.")
  }

  const togglePresence = (classeId: number | string, eleveId: number | string, date: string, status: string) => {
    if (!selectedEcole) return
    const updatedClasses = (selectedEcole.classes || []).map(cl =>
      cl.id === classeId ? {
        ...cl, eleves: (cl.eleves || []).map(el =>
          el.id === eleveId ? { ...el, presences: { ...el.presences, [date]: el.presences[date] === status ? "" : status } } : el
        )
      } : cl
    )
    updateEcole(selectedEcole.id, { classes: updatedClasses })
  }

  const removeClasse = (classeId: number | string) => {
    if (!selectedEcole) return
    updateEcole(selectedEcole.id, { classes: (selectedEcole.classes || []).filter(cl => cl.id !== classeId) })
    toast("Classe supprimee.")
  }

  const addJournal = () => {
    if (!selectedEcole || !journalForm.titre) return
    const j: JournalEntry = { 
      id: Date.now(), 
      ...journalForm,
      titre: correctText(journalForm.titre),
      observations: correctText(journalForm.observations),
      reflexion: correctText(journalForm.reflexion),
      auteur: user.name,
      auteurId: user.id
    }
    updateEcole(selectedEcole.id, { journal: [...(selectedEcole.journal || []), j] })
    setJournalForm({ titre: "", type: "Observation", date: "", observations: "", reflexion: "" }); toast("Entree ajoutee !")
    addPoints(5, "journal")
  }
  
  const canEditJournal = (entry: JournalEntry): boolean => {
    return entry.auteurId === user.id || entry.auteur === user.name || !entry.auteur
  }
  
  const deleteJournal = (entryId: number | string) => {
    if (!selectedEcole) return
    updateEcole(selectedEcole.id, { journal: (selectedEcole.journal || []).filter(j => j.id !== entryId) })
    toast("Entree supprimee.")
  }
  const addCheck = () => {
    if (!selectedEcole || !checkInput) return
    const item: ChecklistItem = { id: Date.now(), label: checkInput, done: false }
    updateEcole(selectedEcole.id, { checklist: [...(selectedEcole.checklist || []), item] })
    setCheckInput(""); toast("Tache ajoutee !")
  }
  const toggleCheck = (itemId: number | string) => {
    if (!selectedEcole) return
    updateEcole(selectedEcole.id, { checklist: (selectedEcole.checklist || []).map(c => c.id === itemId ? { ...c, done: !c.done } : c) })
  }
  const addMateriel = () => {
    if (!selectedEcole || !materielForm.nom) return
    const m: MaterielItem = { id: Date.now(), ...materielForm }
    updateEcole(selectedEcole.id, { materielItems: [...(selectedEcole.materielItems || []), m] })
    setMaterielForm({ nom: "", quantite: "", categorie: "Sport", etat: "Bon", note: 0, informations: "", photos: [] })
    setMaterielModal(false); toast("Materiel ajoute !")
  }
  const saveMaterielEdit = () => {
    if (!selectedEcole || !materielEditModal) return
    updateEcole(selectedEcole.id, { materielItems: (selectedEcole.materielItems || []).map(m => m.id === materielEditModal.id ? { ...m, ...materielEditForm } as any : m) })
    setMaterielEditModal(null); toast("Materiel modifie !")
  }

  const liveEcole = selectedEcole ? ecoles.find(e => e.id === selectedEcole.id) || selectedEcole : null
  const ecoleTabs = [
    { id: "journal", l: "Journal", icon: <FileText size={14} /> },
    { id: "classes", l: "Classes", icon: <Users size={14} /> },
    { id: "materiel", l: "Materiel", icon: <Wrench size={14} /> },
    { id: "photos", l: "Photos", icon: <Camera size={14} /> },
    { id: "checklist", l: "Checklist", icon: <CheckCircle size={14} /> },
  ]

  // Detail view
  if (liveEcole) {
    return (
      <div>
        <button onClick={() => setSelectedEcole(null)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.gray, fontWeight: 600, fontSize: 14, marginBottom: 14, fontFamily: "inherit" }}>
          <ChevronLeft size={16} /> Retour aux ecoles
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {liveEcole.couleur && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: liveEcole.couleur, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <School size={16} color="white" />
                </div>
              )}
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: liveEcole.couleur || C.dark }}>{liveEcole.nom}</h1>
            </div>
            {liveEcole.adresse && <p style={{ margin: "4px 0 0", fontSize: 14, color: C.gray, display: "flex", alignItems: "center", gap: 6 }}><MapPin size={14} color={C.gray} /> {liveEcole.adresse}</p>}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn sm outline color={C.blue} onClick={() => { setEditForm({ ...liveEcole } as any); setEditModal(liveEcole as any) }}><Pencil size={13} color={C.blue} /> Modifier</Btn>
          </div>
        </div>

        {/* Info card */}
        {(liveEcole.description || liveEcole.infrastructure) && (
          <Card style={{ padding: 18, marginBottom: 14 }}>
            {liveEcole.description && <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: liveEcole.infrastructure ? 10 : 0 }}>{liveEcole.description}</div>}
            {liveEcole.infrastructure && <div style={{ fontSize: 13.5, color: C.gray }}><strong>Infrastructure:</strong> {liveEcole.infrastructure}</div>}
          </Card>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f1f5f9", borderRadius: 12, padding: 4 }}>
          {ecoleTabs.map(t => (
            <button key={t.id} onClick={() => setEcoleTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "none", cursor: "pointer",
              background: ecoleTab === t.id ? "white" : "transparent",
              color: ecoleTab === t.id ? C.dark : C.gray,
              fontWeight: ecoleTab === t.id ? 700 : 500, fontSize: 13.5, fontFamily: "inherit", transition: "all .15s"
            }}>{t.icon} {t.l}</button>
          ))}
        </div>

        {/* Tab content */}
        <Card style={{ padding: 20 }}>
          {ecoleTab === "journal" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Journal de stage</h3>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                <FormField label="Titre" req><Inp value={journalForm.titre} onChange={e => setJournalForm(v => ({ ...v, titre: e.target.value }))} placeholder="Titre de l'entree" /></FormField>
                <FormField label="Type"><Sel value={journalForm.type} onChange={e => setJournalForm(v => ({ ...v, type: e.target.value }))} options={["Observation", "Reflexion", "Feedback", "Autre"]} /></FormField>
                <FormField label="Date"><Inp type="date" value={journalForm.date} onChange={e => setJournalForm(v => ({ ...v, date: e.target.value }))} /></FormField>
              </div>
              <FormField label="Observations"><TA value={journalForm.observations} onChange={e => setJournalForm(v => ({ ...v, observations: e.target.value }))} /></FormField>
              <FormField label="Reflexion"><TA value={journalForm.reflexion} onChange={e => setJournalForm(v => ({ ...v, reflexion: e.target.value }))} /></FormField>
              <Btn color={C.orange} onClick={addJournal} disabled={!journalForm.titre}><Plus size={14} color="white" /> Ajouter</Btn>
              <div style={{ marginTop: 20 }}>
                {(liveEcole.journal || []).length === 0
                  ? <div style={{ padding: 24, textAlign: "center", color: C.gray, fontSize: 13 }}>Aucune entree dans le journal</div>
                  : (liveEcole.journal || []).map(j => (
                    <div key={j.id} style={{ padding: "12px 16px", background: "#f9fafb", borderRadius: 10, marginBottom: 8, border: `1px solid ${liveEcole.couleur ? liveEcole.couleur + "40" : "#e5e7eb"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{j.titre}</div>
                          {j.auteur && (
                            <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>par {j.auteur}</div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                          <Tag color={liveEcole.couleur || C.orange}>{j.type}</Tag>
                          {j.date && <span style={{ fontSize: 12, color: C.gray }}>{j.date}</span>}
                          {canEditJournal(j) && (
                            <button onClick={() => deleteJournal(j.id)} style={{ width: 24, height: 24, borderRadius: 6, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Trash2 size={11} color={C.red} />
                            </button>
                          )}
                        </div>
                      </div>
                      {j.observations && <div style={{ fontSize: 13.5, lineHeight: 1.6, marginTop: 6 }}>{j.observations}</div>}
                      {j.reflexion && <div style={{ fontSize: 13, color: C.gray, fontStyle: "italic", marginTop: 6 }}>{j.reflexion}</div>}
                    </div>
                  ))}
              </div>
            </>
          )}

          {ecoleTab === "classes" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Classes ({(liveEcole.classes || []).length})</h3>
              </div>
              {/* Add class form */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10, marginBottom: 16 }}>
                <Inp value={classeForm.nom} onChange={e => setClasseForm(v => ({ ...v, nom: e.target.value }))} placeholder="Nom de la classe" />
                <Inp value={classeForm.niveau} onChange={e => setClasseForm(v => ({ ...v, niveau: e.target.value }))} placeholder="Niveau" />
                <Inp value={classeForm.nb} onChange={e => setClasseForm(v => ({ ...v, nb: e.target.value }))} placeholder="Nb eleves" />
                <Btn color={C.blue} sm onClick={addClasse} disabled={!classeForm.nom}><Plus size={13} color="white" /> Ajouter</Btn>
              </div>
              {/* Classes list */}
              <div style={{ marginTop: 16 }}>
                {(liveEcole.classes || []).map(cl => {
                  const isExpanded = expandedClasse === cl.id
                  const eleves = cl.eleves || []
                  return (
                    <div key={cl.id} style={{ marginBottom: 12, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
                      {/* Class header */}
                      <div onClick={() => setExpandedClasse(isExpanded ? null : cl.id)} style={{
                        padding: "12px 16px", background: isExpanded ? "#f0f9ff" : "#f9fafb", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          {isExpanded ? <ChevronDown size={16} color={C.blue} /> : <ChevronRight size={16} color={C.gray} />}
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14 }}>{cl.nom}</div>
                            <div style={{ fontSize: 12.5, color: C.gray }}>{cl.niveau}{cl.nb ? ` - ${cl.nb} eleves prevus` : ""}</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Tag color={C.blue}>{eleves.length} eleve(s)</Tag>
                          <button onClick={e => { e.stopPropagation(); removeClasse(cl.id) }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={12} color={C.red} /></button>
                        </div>
                      </div>
                      {/* Expanded: students + attendance */}
                      {isExpanded && (
                        <div style={{ padding: "14px 16px" }}>
                          {/* Add student form */}
                          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                            <Inp value={eleveForm.prenom} onChange={e => setEleveForm(v => ({ ...v, prenom: e.target.value }))} placeholder="Prenom" />
                            <Inp value={eleveForm.nom} onChange={e => setEleveForm(v => ({ ...v, nom: e.target.value }))} placeholder="Nom" />
                            <Btn color={C.green} sm onClick={() => addEleve(cl.id)} disabled={!eleveForm.prenom}><UserPlus size={13} color="white" /> Ajouter</Btn>
                          </div>

                          {eleves.length === 0
                            ? <div style={{ padding: 20, textAlign: "center", color: C.gray, fontSize: 13 }}>Aucun eleve dans cette classe</div>
                            : (
                            <>
                              {/* Attendance date picker */}
                              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, padding: "8px 12px", background: "#f0fdf4", borderRadius: 8, border: "1px solid #d1fae5" }}>
                                <CalendarDays size={15} color={C.green} />
                                <span style={{ fontSize: 13, fontWeight: 600, color: C.dark }}>Presences du :</span>
                                <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 8px", fontSize: 13, fontFamily: "inherit" }} />
                                <div style={{ marginLeft: "auto", display: "flex", gap: 8, fontSize: 11 }}>
                                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.green, display: "inline-block" }} /> Present</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block" }} /> Absent</span>
                                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, display: "inline-block" }} /> Retard</span>
                                </div>
                              </div>
                              {/* Student table */}
                              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", background: "#f8fafc", padding: "8px 14px", borderBottom: "1px solid #e5e7eb" }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray }}>Eleve</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray, textAlign: "center", minWidth: 200 }}>Presence</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gray, textAlign: "center", width: 40 }}></span>
                                </div>
                                {eleves.map((el, idx) => {
                                  const status = el.presences?.[attendanceDate] || ""
                                  return (
                                    <div key={el.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", padding: "8px 14px", borderBottom: idx < eleves.length - 1 ? "1px solid #f3f4f6" : "none", alignItems: "center" }}>
                                      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.dark }}>{el.prenom} {el.nom}</span>
                                      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                                        {(["P", "A", "R"] as const).map(s => {
                                          const full = s === "P" ? "present" : s === "A" ? "absent" : "retard"
                                          const col = s === "P" ? C.green : s === "A" ? C.red : C.orange
                                          const bg = s === "P" ? C.greenLight : s === "A" ? C.redLight : C.orangeLight
                                          const isActive = status === full
                                          return (
                                            <button key={s} onClick={() => togglePresence(cl.id, el.id, attendanceDate, full)} style={{
                                              width: 32, height: 28, borderRadius: 6, border: `1.5px solid ${isActive ? col : "#e5e7eb"}`,
                                              background: isActive ? bg : "white", color: isActive ? col : C.gray,
                                              fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
                                              transition: "all .1s",
                                            }}>{s}</button>
                                          )
                                        })}
                                      </div>
                                      <button onClick={() => removeEleve(cl.id, el.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={11} color={C.red} /></button>
                                    </div>
                                  )
                                })}
                              </div>
                              {/* Attendance summary */}
                              {(() => {
                                const pCount = eleves.filter(el => el.presences?.[attendanceDate] === "present").length
                                const aCount = eleves.filter(el => el.presences?.[attendanceDate] === "absent").length
                                const rCount = eleves.filter(el => el.presences?.[attendanceDate] === "retard").length
                                return (
                                  <div style={{ display: "flex", gap: 12, marginTop: 10, fontSize: 12.5 }}>
                                    <span style={{ color: C.green, fontWeight: 600 }}>Presents: {pCount}</span>
                                    <span style={{ color: C.red, fontWeight: 600 }}>Absents: {aCount}</span>
                                    <span style={{ color: C.orange, fontWeight: 600 }}>Retards: {rCount}</span>
                                    <span style={{ color: C.gray }}>Non marques: {eleves.length - pCount - aCount - rCount}</span>
                                  </div>
                                )
                              })()}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {ecoleTab === "materiel" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Materiel ({(liveEcole.materielItems || []).length})</h3>
                <Btn color={C.orange} sm onClick={() => { setMaterielForm({ nom: "", quantite: "", categorie: "Sport", etat: "Bon", note: 0, informations: "", photos: [] }); setMaterielModal(true) }}>
                  <Plus size={13} color="white" /> Ajouter materiel
                </Btn>
              </div>
              {(liveEcole.materielItems || []).length === 0
                ? <div style={{ padding: 24, textAlign: "center", color: C.gray, fontSize: 13 }}>Aucun materiel enregistre</div>
                : <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {(liveEcole.materielItems || []).map(m => (
                    <div key={m.id} style={{ padding: "14px 16px", background: "#f9fafb", borderRadius: 12, border: "1px solid #e5e7eb", cursor: "pointer" }} onClick={() => setMaterielViewModal(m)}>
                      {(m.photos || []).length > 0 && (
                        <div style={{ marginBottom: 10, borderRadius: 8, overflow: "hidden", height: 120, background: "#f3f4f6" }}>
                          <img src={m.photos[0].url} alt={m.photos[0].name} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{m.nom}</div>
                        <Tag color={m.etat === "Bon" ? C.green : m.etat === "Neuf" ? C.blue : C.orange}>{m.etat}</Tag>
                      </div>
                      <div style={{ fontSize: 12.5, color: C.gray }}>{m.categorie}{m.quantite ? ` - Qte: ${m.quantite}` : ""}</div>
                    </div>
                  ))}
                </div>}
            </>
          )}

          {ecoleTab === "photos" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Photos ({(liveEcole.ecolePhotos || []).length})</h3>
                <input ref={ecolePhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleEcolePhotoUpload} />
                <Btn color={C.teal} sm onClick={() => ecolePhotoRef.current?.click()}><Camera size={13} color="white" /> Ajouter photo</Btn>
              </div>
              {(liveEcole.ecolePhotos || []).length === 0
                ? <div style={{ padding: 24, textAlign: "center", color: C.gray, fontSize: 13 }}>Aucune photo</div>
                : <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
                  {(liveEcole.ecolePhotos || []).map((p, i) => (
                    <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "4/3", position: "relative", background: "#f3f4f6" }}>
                      <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.5)", color: "white", fontSize: 11, padding: "4px 8px" }}>{p.name}</div>
                    </div>
                  ))}
                </div>}
            </>
          )}

          {ecoleTab === "checklist" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Checklist</h3>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <Inp value={checkInput} onChange={e => setCheckInput(e.target.value)} placeholder="Nouvelle tache..." />
                <Btn color={C.green} sm onClick={addCheck} disabled={!checkInput}><Plus size={13} color="white" /></Btn>
              </div>
              {(liveEcole.checklist || []).map(c => (
                <div key={c.id} onClick={() => toggleCheck(c.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: c.done ? "#f0fdf4" : "#f9fafb", borderRadius: 9, marginBottom: 6, cursor: "pointer", border: `1px solid ${c.done ? "#d1fae5" : "#e5e7eb"}` }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${c.done ? C.green : "#d1d5db"}`, display: "flex", alignItems: "center", justifyContent: "center", background: c.done ? C.green : "white", flexShrink: 0 }}>
                    {c.done && <CheckCircle size={13} color="white" />}
                  </div>
                  <span style={{ fontSize: 14, textDecoration: c.done ? "line-through" : "none", color: c.done ? C.gray : C.dark }}>{c.label}</span>
                </div>
              ))}
            </>
          )}
        </Card>

        {/* Materiel modals */}
        <Modal open={materielModal} onClose={() => setMaterielModal(false)} title="Ajouter materiel" width={520}>
          <FormField label="Nom" req><Inp value={materielForm.nom} onChange={e => setMaterielForm((v: any) => ({ ...v, nom: e.target.value }))} placeholder="Nom du materiel" /></FormField>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Quantite"><Inp value={materielForm.quantite} onChange={e => setMaterielForm((v: any) => ({ ...v, quantite: e.target.value }))} placeholder="10" /></FormField>
            <FormField label="Categorie"><Sel value={materielForm.categorie || ""} onChange={e => setMaterielForm((v: any) => ({ ...v, categorie: e.target.value }))} options={["Sport", "Securite", "Infrastructure", "Petit materiel", "Electronique", "Autre"]} /></FormField>
            <FormField label="Etat"><Sel value={materielForm.etat || ""} onChange={e => setMaterielForm((v: any) => ({ ...v, etat: e.target.value }))} options={["Neuf", "Bon", "Correct", "Use", "A remplacer"]} /></FormField>
            <FormField label="Note"><StarRating value={materielForm.note} onChange={n => setMaterielForm((v: any) => ({ ...v, note: n }))} /></FormField>
          </div>
          <FormField label="Informations"><TA value={materielForm.informations} onChange={e => setMaterielForm((v: any) => ({ ...v, informations: e.target.value }))} /></FormField>
          {/* Photo upload for materiel */}
          <FormField label="Photos du materiel">
            <input ref={materielPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleMaterielPhotoUpload(e, false)} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(materielForm.photos || []).map((p: any, i: number) => (
                <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb" }}>
                  <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                </div>
              ))}
              <button onClick={() => materielPhotoRef.current?.click()} style={{
                width: 80, height: 80, borderRadius: 8, border: "2px dashed #d1d5db", background: "#f9fafb",
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4
              }}>
                <Image size={18} color={C.gray} />
                <span style={{ fontSize: 10, color: C.gray }}>Photo</span>
              </button>
            </div>
          </FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setMaterielModal(false)}>Annuler</Btn>
            <Btn color={C.orange} onClick={addMateriel} disabled={!materielForm.nom}>Ajouter</Btn>
          </div>
        </Modal>

        {materielViewModal && (
          <Modal open={true} onClose={() => setMaterielViewModal(null)} title={materielViewModal.nom} subtitle={`${materielViewModal.categorie}${materielViewModal.quantite ? ` - Qte: ${materielViewModal.quantite}` : ""}`} width={560}>
            {(materielViewModal.photos || []).length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(3, (materielViewModal.photos || []).length)},1fr)`, gap: 8, marginBottom: 16 }}>
                {(materielViewModal.photos || []).map((p, i) => (
                  <div key={i} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e5e7eb", aspectRatio: "4/3" }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["Etat", materielViewModal.etat], ["Note", materielViewModal.note ? `${materielViewModal.note}/5` : "\u2014"]].map(([l, v]) => (
                <div key={String(l)} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600, marginBottom: 3 }}>{String(l)}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: C.dark }}>{String(v) || "\u2014"}</div>
                </div>
              ))}
            </div>
            {materielViewModal.informations && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Informations</div><div style={{ fontSize: 14, lineHeight: 1.7, background: "#f9fafb", borderRadius: 9, padding: "10px 14px" }}>{materielViewModal.informations}</div></div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn outline color={C.gray} onClick={() => setMaterielViewModal(null)}>Fermer</Btn>
              <Btn color={C.blue} onClick={() => { setMaterielEditForm({ ...materielViewModal }); setMaterielEditModal(materielViewModal); setMaterielViewModal(null) }}>Modifier</Btn>
            </div>
          </Modal>
        )}

        {materielEditModal && (
          <Modal open={true} onClose={() => setMaterielEditModal(null)} title="Modifier materiel" width={520}>
            <FormField label="Nom" req><Inp value={materielEditForm.nom} onChange={e => setMaterielEditForm((v: any) => ({ ...v, nom: e.target.value }))} /></FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <FormField label="Quantite"><Inp value={materielEditForm.quantite} onChange={e => setMaterielEditForm((v: any) => ({ ...v, quantite: e.target.value }))} /></FormField>
              <FormField label="Categorie"><Sel value={materielEditForm.categorie || ""} onChange={e => setMaterielEditForm((v: any) => ({ ...v, categorie: e.target.value }))} options={["Sport", "Securite", "Infrastructure", "Petit materiel", "Electronique", "Autre"]} /></FormField>
              <FormField label="Etat"><Sel value={materielEditForm.etat || ""} onChange={e => setMaterielEditForm((v: any) => ({ ...v, etat: e.target.value }))} options={["Neuf", "Bon", "Correct", "Use", "A remplacer"]} /></FormField>
              <FormField label="Note"><StarRating value={materielEditForm.note} onChange={n => setMaterielEditForm((v: any) => ({ ...v, note: n }))} /></FormField>
            </div>
            <FormField label="Informations"><TA value={materielEditForm.informations || ""} onChange={e => setMaterielEditForm((v: any) => ({ ...v, informations: e.target.value }))} /></FormField>
            <FormField label="Photos du materiel">
              <input ref={materielEditPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleMaterielPhotoUpload(e, true)} />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {(materielEditForm.photos || []).map((p: any, i: number) => (
                  <div key={i} style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", border: "1px solid #e5e7eb", position: "relative" }}>
                    <img src={p.url} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                  </div>
                ))}
                <button onClick={() => materielEditPhotoRef.current?.click()} style={{
                  width: 80, height: 80, borderRadius: 8, border: "2px dashed #d1d5db", background: "#f9fafb",
                  cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4
                }}>
                  <Image size={18} color={C.gray} />
                  <span style={{ fontSize: 10, color: C.gray }}>Photo</span>
                </button>
              </div>
            </FormField>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn outline color={C.gray} onClick={() => setMaterielEditModal(null)}>Annuler</Btn>
              <Btn color={C.orange} onClick={saveMaterielEdit}>Sauvegarder</Btn>
            </div>
          </Modal>
        )}

        <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier l'ecole" width={560}>
          <FormField label="Nom" req><Inp value={editForm.nom} onChange={ef("nom")} /></FormField>
          <FormField label="Adresse"><Inp value={editForm.adresse} onChange={ef("adresse")} /></FormField>
          <FormField label="Couleur officielle">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {SCHOOL_COLORS.map(color => (
                <button key={color} onClick={() => setEditForm((v: any) => ({ ...v, couleur: color }))} 
                  style={{ 
                    width: 36, height: 36, borderRadius: 10, background: color, border: editForm.couleur === color ? "3px solid #1f2937" : "2px solid #e5e7eb",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
                  }}>
                  {editForm.couleur === color && <CheckCircle size={16} color="white" />}
                </button>
              ))}
            </div>
          </FormField>
          <FormField label="Description"><TA value={editForm.description} onChange={ef("description")} /></FormField>
          <FormField label="Infrastructure"><TA value={editForm.infrastructure} onChange={ef("infrastructure")} /></FormField>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setEditModal(null)}>Annuler</Btn>
            <Btn color={editForm.couleur || C.orange} onClick={saveEditFn}>Sauvegarder</Btn>
          </div>
        </Modal>
      </div>
    )
  }

  // List view
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
            <School size={24} color={C.orange} /> Ecole
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Gerez vos ecoles et lieux de stage</p>
        </div>
        <Btn color={C.orange} onClick={() => setModal(true)}><Plus size={14} color="white" /> Ajouter une ecole</Btn>
      </div>

      {ecoles.length === 0
        ? <Card><EmptyState icon="school" title="Aucune ecole" subtitle="Ajoutez votre premiere ecole de stage" cta={<Btn color={C.orange} onClick={() => setModal(true)}>Ajouter une ecole</Btn>} /></Card>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {ecoles.map(e => (
            <Card key={e.id} hover onClick={() => { setSelectedEcole(e); setEcoleTab("journal") }} style={{ padding: 20, cursor: "pointer", borderTop: e.couleur ? `4px solid ${e.couleur}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {e.couleur && (
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: e.couleur, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <School size={18} color="white" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: e.couleur || C.dark, marginBottom: 4 }}>{e.nom}</div>
                    {e.adresse && <div style={{ fontSize: 13, color: C.gray, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={12} color={C.gray} /> {e.adresse}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={ev => { ev.stopPropagation(); setEditForm({ ...e } as any); setEditModal(e as any) }} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={13} color={C.blue} /></button>
                  <button onClick={ev => { ev.stopPropagation(); setConfirmDel(e.id) }} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} color={C.red} /></button>
                </div>
              </div>
              {e.description && <div style={{ fontSize: 13.5, color: C.gray, marginBottom: 8, lineHeight: 1.5 }}>{e.description.substring(0, 100)}{e.description.length > 100 ? "..." : ""}</div>}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <Tag color={e.couleur || C.blue}>{(e.classes || []).length} classe(s)</Tag>
                <Tag color={C.orange}>{(e.materielItems || []).length} materiel</Tag>
                <Tag color={C.teal}>{(e.ecolePhotos || []).length} photo(s)</Tag>
              </div>
            </Card>
          ))}
        </div>}

      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter une ecole" width={560}>
        <FormField label="Nom de l'ecole" req><Inp value={form.nom} onChange={f("nom")} placeholder="Ecole Communale de..." /></FormField>
        <FormField label="Adresse"><Inp value={form.adresse} onChange={f("adresse")} placeholder="Rue, ville" icon="location" /></FormField>
        <FormField label="Couleur officielle">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SCHOOL_COLORS.map(color => (
              <button key={color} onClick={() => setForm((v: any) => ({ ...v, couleur: color }))} 
                style={{ 
                  width: 36, height: 36, borderRadius: 10, background: color, border: form.couleur === color ? "3px solid #1f2937" : "2px solid #e5e7eb",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .15s"
                }}>
                {form.couleur === color && <CheckCircle size={16} color="white" />}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Description"><TA value={form.description} onChange={f("description")} /></FormField>
        <FormField label="Infrastructure"><TA value={form.infrastructure} onChange={f("infrastructure")} placeholder="Salle de sport, cours exterieure..." /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn outline color={C.gray} onClick={() => setModal(false)}>Annuler</Btn>
          <Btn color={form.couleur || C.orange} onClick={save} disabled={!form.nom}>Ajouter</Btn>
        </div>
      </Modal>
      <ConfirmModal open={!!confirmDel} title="Supprimer l'ecole" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
