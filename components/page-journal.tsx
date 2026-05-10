"use client"
import React, { useState } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal } from "@/components/ui-atoms"
import { FileText, Plus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, BookOpen, CalendarDays, List, Heart } from "lucide-react"
import type { Seance, Preparation, Cycle } from "@/lib/types"

type ViewMode = "month" | "week" | "day" | "year"

function SeanceForm({ formData, onChange, preps, onSave, onCancel, btnLabel, isPrepLiked }: {
  formData: any; onChange: (k: string) => (e: any) => void; preps: Preparation[];
  onSave: () => void; onCancel: () => void; btnLabel: string; isPrepLiked?: (id: string | number) => boolean
}) {
  const [showLikedOnly, setShowLikedOnly] = React.useState(false)
  const linked = formData.prepLieeId ? preps.find(p => String(p.id) === String(formData.prepLieeId)) : null

  const filteredPreps = showLikedOnly && isPrepLiked ? preps.filter(p => isPrepLiked(p.id)) : preps
  const sortedPreps = isPrepLiked
    ? [...filteredPreps].sort((a, b) => (isPrepLiked(a.id) ? 0 : 1) - (isPrepLiked(b.id) ? 0 : 1))
    : filteredPreps

  return (
    <>
      <FormField label="Titre de la seance" req>
        <Inp placeholder="ex: Course de vitesse" value={formData.titre} onChange={onChange("titre")} />
      </FormField>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Classe"><Inp placeholder="3eme secondaire" value={formData.classe} onChange={onChange("classe")} /></FormField>
        <FormField label="Date"><Inp type="date" value={formData.date} onChange={onChange("date")} /></FormField>
        <FormField label="Heure"><Inp type="time" value={formData.heure} onChange={onChange("heure")} /></FormField>
        <FormField label="Duree (min)"><Inp type="number" placeholder="60" value={formData.duree} onChange={onChange("duree")} /></FormField>
      </div>
      <FormField label="Lier une preparation" hint="optionnel">
        {isPrepLiked && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            <button onClick={() => setShowLikedOnly(false)} style={{
              padding: "4px 12px", borderRadius: 7, border: !showLikedOnly ? `1.5px solid ${C.blue}` : "1.5px solid #e5e7eb",
              background: !showLikedOnly ? C.blueLight : "white", color: !showLikedOnly ? C.blue : C.gray,
              fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>Toutes</button>
            <button onClick={() => setShowLikedOnly(true)} style={{
              padding: "4px 12px", borderRadius: 7, border: showLikedOnly ? `1.5px solid #ef4444` : "1.5px solid #e5e7eb",
              background: showLikedOnly ? "#fef2f2" : "white", color: showLikedOnly ? "#ef4444" : C.gray,
              fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}><Heart size={11} fill={showLikedOnly ? "#ef4444" : "none"} /> Likees</button>
          </div>
        )}
        <Sel value={formData.prepLieeId} onChange={onChange("prepLieeId")}
          options={sortedPreps.map(p => ({ v: String(p.id), l: `${isPrepLiked && isPrepLiked(p.id) ? "\u2764\uFE0F " : ""}${p.titre} (${p.discipline}${p.classe ? ` - ${p.classe}` : ""})` }))}
          placeholder="-- Aucune preparation liee --" />
        {linked && (
          <div style={{ marginTop: 8, padding: "10px 12px", background: "#f0fdf4", borderRadius: 9, border: "1px solid #d1fae5", fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
            <BookOpen size={13} color={C.green} />
            <span>{"Liee a : "}<strong>{linked.titre}</strong></span>
            {isPrepLiked && isPrepLiked(linked.id) && <Heart size={12} color="#ef4444" fill="#ef4444" />}
          </div>
        )}
      </FormField>
      <FormField label="Objectifs"><TA value={formData.objectifs} onChange={onChange("objectifs")} /></FormField>
      <FormField label="Observations"><TA value={formData.observations} onChange={onChange("observations")} /></FormField>
      <FormField label="Notes"><TA value={formData.notes} onChange={onChange("notes")} /></FormField>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn outline color={C.gray} onClick={onCancel}>Annuler</Btn>
        <Btn color={C.blue} onClick={onSave} disabled={!formData.titre}>{btnLabel}</Btn>
      </div>
    </>
  )
}

/* Helpers */
function pad2(n: number) { return String(n).padStart(2, "0") }
function toDateStr(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function getMondayOfWeek(d: Date) {
  const copy = new Date(d)
  const dow = copy.getDay() === 0 ? 6 : copy.getDay() - 1
  copy.setDate(copy.getDate() - dow)
  return copy
}
const MONTH_NAMES_FR = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"]
const DAY_NAMES_FR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"]
const DAY_FULL_FR = ["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"]

function SeanceCard({ s, onView, compact = false }: { s: Seance; onView: () => void; compact?: boolean }) {
  const hasPL = !!s.prepLiee
  return (
    <div onClick={onView} style={{
      padding: compact ? "6px 8px" : "10px 12px",
      background: hasPL ? "#f0fdf4" : "#f8fafc",
      border: `1px solid ${hasPL ? "#d1fae5" : "#e5e7eb"}`,
      borderLeft: `3px solid ${hasPL ? C.green : C.blue}`,
      borderRadius: 8, cursor: "pointer", marginBottom: compact ? 3 : 6,
      transition: "background .1s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: compact ? 11.5 : 13.5, color: C.dark }}>{s.titre}</span>
        {s.heure && <span style={{ fontSize: compact ? 10 : 12, background: C.blueLight, color: C.blue, padding: "1px 7px", borderRadius: 20, fontWeight: 600 }}>{s.heure}</span>}
        {hasPL && !compact && <Tag color={C.green} bg="#d1fae5">{s.prepLiee!.titre}</Tag>}
      </div>
      {!compact && <div style={{ fontSize: 12, color: C.gray, marginTop: 3 }}>{s.classe && `${s.classe} - `}{s.duree}min{s.observations ? ` - Obs.` : ""}</div>}
    </div>
  )
}

export function PageJournal({ seances, setSeances, preps, cycles, toast, addPoints, isPrepLiked, saveSeance, deleteSeance }: {
  seances: Seance[]; setSeances: React.Dispatch<React.SetStateAction<Seance[]>>;
  preps: Preparation[]; cycles: Cycle[]; toast: (m: string) => void; addPoints: (p: number, r: string) => void; isPrepLiked?: (id: string | number) => boolean;
  saveSeance?: (seance: Seance) => Promise<boolean>;
  deleteSeance?: (id: string | number) => Promise<void>;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [cur, setCur] = useState(new Date())
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState<Seance | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [viewModal, setViewModal] = useState<Seance | null>(null)
  const [dayModal, setDayModal] = useState<string | null>(null)
  const blank = { titre: "", classe: "", date: "", heure: "", duree: "60", objectifs: "", observations: "", notes: "", prepLieeId: "" }
  const [form, setForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)
  const f = (k: string) => (e: any) => setForm(v => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm(v => ({ ...v, [k]: e.target.value }))

  const y = cur.getFullYear(), m = cur.getMonth()

  const save = async () => {
    if (!form.titre) return
    const prepLiee = preps.find(p => String(p.id) === String(form.prepLieeId)) || null
    const newSeance: Seance = { id: `new_${Date.now()}`, ...form, prepLiee } as any
    if (saveSeance) {
      const success = await saveSeance(newSeance)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setSeances(s => [...s, newSeance])
    }
    setForm(blank); setModal(false); toast("Seance ajoutee !"); addPoints(5, "seance")
  }
  const saveEdit = async () => {
    const prepLiee = preps.find(p => String(p.id) === String(editForm.prepLieeId)) || null
    const updatedSeance: Seance = { ...editModal!, ...editForm, prepLiee } as any
    if (saveSeance) {
      const success = await saveSeance(updatedSeance)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setSeances(ss => ss.map(x => x.id === editModal!.id ? updatedSeance : x))
    }
    setEditModal(null); toast("Seance modifiee !")
  }
  const del = async (id: number | string) => {
    if (deleteSeance) {
      await deleteSeance(id)
    } else {
      setSeances(ss => ss.filter(x => x.id !== id))
    }
    toast("Seance supprimee.")
  }
  const openModal = (date = "") => { setForm({ ...blank, date }); setModal(true) }

  /* Index seances by date */
  const byDate: Record<string, Seance[]> = {}
  seances.forEach(s => { if (s.date) { if (!byDate[s.date]) byDate[s.date] = []; byDate[s.date].push(s) } })
  const getForDate = (d: string) => (byDate[d] || []).sort((a, b) => (a.heure || "99").localeCompare(b.heure || "99"))

  // Active cycles bar
  const cycleColors = [C.green, C.blue, "#7c3aed", C.orange, C.teal, "#d97706"]
  const activeCycles = (cycles || []).filter(c => {
    if (!c.dateDebut && !c.dateFin) return false
    const start = c.dateDebut ? new Date(c.dateDebut) : null
    const end = c.dateFin ? new Date(c.dateFin) : null
    const monthStart = new Date(y, m, 1)
    const monthEnd = new Date(y, m + 1, 0)
    if (start && end) return start <= monthEnd && end >= monthStart
    if (start) return start <= monthEnd && start >= new Date(y, m - 3, 1)
    if (end) return end >= monthStart
    return false
  })

  /* Navigation */
  const navigate = (dir: -1 | 1) => {
    const d = new Date(cur)
    if (viewMode === "day") d.setDate(d.getDate() + dir)
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7)
    else if (viewMode === "month") d.setMonth(d.getMonth() + dir)
    else d.setFullYear(d.getFullYear() + dir)
    setCur(d)
  }

  const goToday = () => setCur(new Date())

  const periodLabel = () => {
    if (viewMode === "day") return cur.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    if (viewMode === "week") {
      const mon = getMondayOfWeek(cur)
      const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
      return `${mon.getDate()} ${MONTH_NAMES_FR[mon.getMonth()]} - ${sun.getDate()} ${MONTH_NAMES_FR[sun.getMonth()]} ${sun.getFullYear()}`
    }
    if (viewMode === "month") return `${MONTH_NAMES_FR[m]} ${y}`
    return String(y)
  }

  const daySeances = dayModal ? getForDate(dayModal) : []

  /* ─── VIEW: DAY ─── */
  const renderDay = () => {
    const dateStr = toDateStr(cur)
    const ds = getForDate(dateStr)
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, textTransform: "capitalize" }}>
            {cur.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </h3>
          <Btn sm color={C.blue} onClick={() => openModal(dateStr)}><Plus size={13} color="white" /> Ajouter</Btn>
        </div>
        {ds.length === 0
          ? <div style={{ padding: 40, textAlign: "center", color: C.gray, fontSize: 14 }}>Aucune seance ce jour</div>
          : ds.map(s => (
            <div key={s.id} style={{ padding: "14px 16px", background: "#f9fafb", borderRadius: 10, marginBottom: 8, border: `1px solid #e5e7eb`, borderLeft: `3px solid ${s.prepLiee ? C.green : C.blue}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: C.dark }}>{s.titre}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {s.heure && <span style={{ fontSize: 13, background: C.blueLight, color: C.blue, padding: "2px 10px", borderRadius: 20, fontWeight: 600 }}>{s.heure}</span>}
                  <button onClick={() => setViewModal(s)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={13} color={C.gray} /></button>
                  <button onClick={() => { setEditForm({ ...s, prepLieeId: s.prepLiee ? String(s.prepLiee.id) : "" } as any); setEditModal(s) }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={13} color={C.blue} /></button>
                  <button onClick={() => setConfirmDel(s.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} color={C.red} /></button>
                </div>
              </div>
              <div style={{ fontSize: 13, color: C.gray }}>{s.classe && `${s.classe} - `}{s.duree}min</div>
              {s.prepLiee && <div style={{ marginTop: 6, fontSize: 12, background: "#d1fae5", color: "#065f46", display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s.prepLiee.titre}</div>}
              {s.objectifs && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginTop: 8, background: "white", borderRadius: 8, padding: "8px 12px", border: "1px solid #e5e7eb" }}><span style={{ fontWeight: 700, color: C.gray, fontSize: 11, textTransform: "uppercase" }}>Objectifs: </span>{s.objectifs}</div>}
              {s.observations && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginTop: 4, background: "white", borderRadius: 8, padding: "8px 12px", border: "1px solid #e5e7eb" }}><span style={{ fontWeight: 700, color: C.gray, fontSize: 11, textTransform: "uppercase" }}>Observations: </span>{s.observations}</div>}
            </div>
          ))}
      </Card>
    )
  }

  /* ─── VIEW: WEEK ─── */
  const renderWeek = () => {
    const mon = getMondayOfWeek(cur)
    const days: { date: Date; str: string }[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(mon); d.setDate(mon.getDate() + i)
      days.push({ date: d, str: toDateStr(d) })
    }
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {days.map(wd => {
            const isToday = wd.date.toDateString() === new Date().toDateString()
            const ds = getForDate(wd.str)
            return (
              <div key={wd.str} style={{
                borderRadius: 12, padding: "10px 8px",
                background: isToday ? "#eff6ff" : "#f9fafb",
                border: isToday ? `2px solid ${C.blue}` : "1px solid #e5e7eb",
                minHeight: 160,
              }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? C.blue : C.gray, textTransform: "uppercase" }}>{DAY_NAMES_FR[wd.date.getDay()]}</div>
                  <div style={{ fontSize: 20, fontWeight: isToday ? 900 : 600, color: isToday ? C.blue : C.dark, marginTop: 2 }}>{wd.date.getDate()}</div>
                </div>
                {ds.length === 0
                  ? <div style={{ fontSize: 10.5, color: "#d1d5db", textAlign: "center", padding: "8px 0" }}>--</div>
                  : ds.map(s => <SeanceCard key={s.id} s={s} onView={() => setViewModal(s)} compact />)}
                <button onClick={() => openModal(wd.str)} style={{
                  width: "100%", marginTop: 4, padding: "3px 0", borderRadius: 6,
                  border: "1px dashed #d1d5db", background: "transparent",
                  cursor: "pointer", fontSize: 11, color: C.gray, fontFamily: "inherit"
                }}>+</button>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  /* ─── VIEW: MONTH (original calendar) ─── */
  const renderMonth = () => {
    const firstDow = new Date(y, m, 1).getDay()
    const daysInM = new Date(y, m + 1, 0).getDate()
    return (
      <Card style={{ padding: 22 }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", background: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
            {["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"].map(d => (
              <div key={d} style={{ padding: "10px 0", textAlign: "center", fontSize: 12.5, fontWeight: 700, color: C.gray }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
            {Array(firstDow).fill(null).map((_, i) => (
              <div key={`e${i}`} style={{ minHeight: 90, background: "#fafafa", borderRight: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" }} />
            ))}
            {Array(daysInM).fill(null).map((_, i) => {
              const day = i + 1
              const dateStr = `${y}-${pad2(m + 1)}-${pad2(day)}`
              const todayDate = new Date()
              const isToday = day === todayDate.getDate() && m === todayDate.getMonth() && y === todayDate.getFullYear()
              const ds = getForDate(dateStr)
              return (
                <div key={day} onClick={() => setDayModal(dateStr)}
                  style={{ minHeight: 90, padding: "6px 7px", cursor: "pointer", background: isToday ? "#eff6ff" : "white", borderTop: isToday ? `2px solid ${C.blue}` : "1px solid #f1f5f9", borderRight: "1px solid #f1f5f9", transition: "background .1s" }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = "#f8fafc" }}
                  onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = "white" }}>
                  <span style={{ fontSize: 13, fontWeight: isToday ? 800 : 500, color: isToday ? C.blue : "#374151" }}>{day}</span>
                  {ds.slice(0, 3).map(s => (
                    <div key={s.id} onClick={e => { e.stopPropagation(); setViewModal(s) }}
                      style={{ background: s.prepLiee ? "#d1fae5" : C.blueLight, borderRadius: 5, padding: "3px 6px", fontSize: 10.5, marginTop: 3, color: s.prepLiee ? "#065f46" : "#1d4ed8", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", border: s.prepLiee ? "1px solid #6ee7b7" : "none" }}>
                      {s.prepLiee ? "\uD83D\uDCCB " : ""}{s.titre}
                    </div>
                  ))}
                  {ds.length > 3 && <div style={{ fontSize: 10, color: C.gray, textAlign: "center", marginTop: 2 }}>+{ds.length - 3}</div>}
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    )
  }

  /* ─── VIEW: YEAR ─── */
  const renderYear = () => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {Array.from({ length: 12 }, (_, mi) => {
          const firstDow = new Date(y, mi, 1).getDay()
          const daysInM = new Date(y, mi + 1, 0).getDate()
          const todayDate = new Date()
          /* Count seances this month */
          let monthCount = 0
          for (let d = 1; d <= daysInM; d++) {
            const ds = `${y}-${pad2(mi + 1)}-${pad2(d)}`
            monthCount += (byDate[ds] || []).length
          }
          return (
            <Card key={mi} style={{ padding: "14px 16px", cursor: "pointer" }} hover onClick={() => { setCur(new Date(y, mi, 1)); setViewMode("month") }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{MONTH_NAMES_FR[mi]}</span>
                {monthCount > 0 && <Tag color={C.blue}>{monthCount} seance{monthCount > 1 ? "s" : ""}</Tag>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, textAlign: "center" }}>
                {["L","M","M","J","V","S","D"].map((d, i) => (
                  <div key={i} style={{ fontSize: 9, fontWeight: 700, color: C.gray }}>{d}</div>
                ))}
                {(() => {
                  const offset = firstDow === 0 ? 6 : firstDow - 1
                  const cells: React.ReactNode[] = []
                  for (let i = 0; i < offset; i++) cells.push(<div key={`e${i}`} />)
                  for (let d = 1; d <= daysInM; d++) {
                    const ds = `${y}-${pad2(mi + 1)}-${pad2(d)}`
                    const has = (byDate[ds] || []).length > 0
                    const isT = d === todayDate.getDate() && mi === todayDate.getMonth() && y === todayDate.getFullYear()
                    cells.push(
                      <div key={d} style={{
                        fontSize: 10, padding: "2px 0", borderRadius: 4,
                        fontWeight: isT ? 800 : 400,
                        background: isT ? C.blue : has ? C.blueLight : "transparent",
                        color: isT ? "white" : has ? C.blue : "#6b7280",
                      }}>{d}</div>
                    )
                  }
                  return cells
                })()}
              </div>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
            <FileText size={24} color={C.blue} /> Journal de classe
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Suivez vos seances et liez vos preparations</p>
        </div>
        <Btn color={C.blue} onClick={() => openModal()}><Plus size={14} color="white" /> Ajouter une seance</Btn>
      </div>

      {/* View mode toggle + navigation */}
      <Card style={{ padding: "12px 18px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4, background: "#f1f5f9", borderRadius: 10, padding: 3 }}>
          {([["day", "Jour"], ["week", "Semaine"], ["month", "Mois"], ["year", "Annee"]] as [ViewMode, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setViewMode(id)} style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              background: viewMode === id ? "white" : "transparent",
              color: viewMode === id ? C.dark : C.gray,
              fontWeight: viewMode === id ? 700 : 500, fontSize: 13, fontFamily: "inherit",
              boxShadow: viewMode === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              transition: "all .15s",
            }}>{label}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={goToday} style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: C.dark, fontFamily: "inherit" }}>{"Aujourd'hui"}</button>
          <button onClick={() => navigate(-1)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 15, color: C.dark, minWidth: 200, textAlign: "center", textTransform: "capitalize" }}>{periodLabel()}</span>
          <button onClick={() => navigate(1)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ChevronRight size={15} />
          </button>
        </div>
        <div style={{ fontSize: 13, color: C.gray, fontWeight: 600 }}>{seances.length} seance{seances.length !== 1 ? "s" : ""} au total</div>
      </Card>

      {/* Active cycles */}
      {viewMode === "month" && activeCycles.length > 0 && (
        <Card style={{ padding: "14px 20px", marginBottom: 14, background: "#f8fafc" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.gray, marginBottom: 10 }}>Cycles en cours ce mois</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {activeCycles.map((c, ci) => {
              const col = cycleColors[ci % cycleColors.length]
              const start = c.dateDebut ? new Date(c.dateDebut) : null
              const end = c.dateFin ? new Date(c.dateFin) : null
              const monthStart = new Date(y, m, 1)
              const monthEnd = new Date(y, m + 1, 0)
              const barStart = start && start > monthStart ? start : monthStart
              const barEnd = end && end < monthEnd ? end : monthEnd
              const totalDays = monthEnd.getDate()
              const startPct = ((barStart.getDate() - 1) / totalDays) * 100
              const widthPct = Math.max(5, ((barEnd.getDate() - barStart.getDate() + 1) / totalDays) * 100)
              return (
                <div key={c.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.dark }}>{c.titre}</span>
                      <span style={{ fontSize: 12, color: C.gray }}>{c.classe}{c.discipline ? ` - ${c.discipline}` : ""}</span>
                    </div>
                    <span style={{ fontSize: 12, color: C.gray }}>
                      {start ? start.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "?"} {" -> "}
                      {end ? end.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "?"} {" - "}{c.nbSeances} seances
                    </span>
                  </div>
                  <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", left: `${startPct}%`, width: `${widthPct}%`, height: "100%", background: col, borderRadius: 4, opacity: 0.85 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Calendar view */}
      {viewMode === "day" && renderDay()}
      {viewMode === "week" && renderWeek()}
      {viewMode === "month" && renderMonth()}
      {viewMode === "year" && renderYear()}

      {/* All seances list */}
      {viewMode !== "year" && seances.length > 0 && (
        <Card style={{ padding: 20, marginTop: 16 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Toutes les seances ({seances.length})</h3>
          {seances.map((s, idx) => (
            <div key={s.id} style={{ padding: "12px 0", borderBottom: idx < seances.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>{s.titre}</div>
                  {s.prepLiee && <Tag color={C.green} bg="#d1fae5">{s.prepLiee.titre}</Tag>}
                </div>
                <div style={{ fontSize: 12.5, color: C.gray }}>{s.classe && `${s.classe} - `}{s.date}{s.heure && ` a ${s.heure}`} - {s.duree}min</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setViewModal(s)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={14} color={C.gray} /></button>
                <button onClick={() => { setEditForm({ ...s, prepLieeId: s.prepLiee ? String(s.prepLiee.id) : "" } as any); setEditModal(s) }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} color={C.blue} /></button>
                <button onClick={() => setConfirmDel(s.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} color={C.red} /></button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Modals */}
      <Modal open={modal} onClose={() => setModal(false)} title="Ajouter une seance" width={520}>
        <SeanceForm formData={form} onChange={f} preps={preps} onSave={save} onCancel={() => setModal(false)} btnLabel="Ajouter" isPrepLiked={isPrepLiked} />
      </Modal>
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier la seance" width={520}>
        <SeanceForm formData={editForm} onChange={ef} preps={preps} onSave={saveEdit} onCancel={() => setEditModal(null)} btnLabel="Sauvegarder" isPrepLiked={isPrepLiked} />
      </Modal>
      {viewModal && (
        <Modal open={true} onClose={() => setViewModal(null)} title={viewModal.titre} subtitle={`${viewModal.classe || ""}${viewModal.date ? ` - ${viewModal.date}` : ""}${viewModal.heure ? ` a ${viewModal.heure}` : ""} - ${viewModal.duree}min`} width={480}>
          {viewModal.prepLiee && (
            <div style={{ background: "#f0fdf4", border: "1px solid #d1fae5", borderRadius: 10, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={16} color={C.green} />
              <div>
                <div style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Preparation liee</div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{viewModal.prepLiee.titre}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{viewModal.prepLiee.discipline} - {viewModal.prepLiee.duree}min</div>
              </div>
            </div>
          )}
          {[["Objectifs", viewModal.objectifs], ["Observations", viewModal.observations], ["Notes", viewModal.notes]].map(([l, v]) =>
            v ? <div key={l} style={{ marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{l}</div><div style={{ fontSize: 14, lineHeight: 1.7, background: "#f9fafb", borderRadius: 9, padding: "10px 14px" }}>{v}</div></div> : null
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setViewModal(null)}>Fermer</Btn>
            <Btn color={C.blue} onClick={() => { setEditForm({ ...viewModal, prepLieeId: viewModal.prepLiee ? String(viewModal.prepLiee.id) : "" } as any); setEditModal(viewModal); setViewModal(null) }}>
              <Pencil size={13} color="white" /> Modifier
            </Btn>
          </div>
        </Modal>
      )}
      {dayModal && (
        <Modal open={true} onClose={() => setDayModal(null)} title={new Date(dayModal + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} width={480}>
          <span style={{ fontSize: 13, color: C.gray }}>{daySeances.length === 0 ? "Aucune seance prevue" : `${daySeances.length} seance(s) planifiee(s)`}</span>
          <div style={{ marginTop: 12, marginBottom: 16 }}>
            {daySeances.length === 0
              ? <div style={{ padding: 24, textAlign: "center" }}><Btn color={C.blue} onClick={() => { setDayModal(null); openModal(dayModal) }}>Ajouter une seance ce jour</Btn></div>
              : daySeances.map(s => (
                <div key={s.id} style={{ padding: "12px 14px", background: "#f9fafb", borderRadius: 10, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: C.dark }}>{s.titre}</div>
                    {s.heure && <span style={{ fontSize: 12, background: C.blueLight, color: C.blue, padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s.heure}</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: C.gray }}>{s.classe && `${s.classe} - `}{s.duree}min</div>
                  {s.prepLiee && <div style={{ marginTop: 6, fontSize: 12, background: "#d1fae5", color: "#065f46", display: "inline-flex", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>{s.prepLiee.titre}</div>}
                  {s.objectifs && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, background: "white", borderRadius: 8, padding: "8px 12px", border: "1px solid #e5e7eb", marginTop: 8 }}><span style={{ fontWeight: 700, color: C.gray, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{"Objectifs -- "}</span>{s.objectifs}</div>}
                </div>
              ))}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setDayModal(null)}>Fermer</Btn>
          </div>
        </Modal>
      )}
      <ConfirmModal open={!!confirmDel} title="Supprimer la seance" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
