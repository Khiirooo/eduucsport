"use client"
import React, { useState } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal } from "@/components/ui-atoms"
import { Calendar, Plus, Eye, Pencil, Trash2, Link2, BookOpen, Heart } from "lucide-react"
import type { Cycle, Preparation, Seance, User } from "@/lib/types"
import { DISCIPLINES } from "@/lib/types"

export function PageCycles({ cycles, setCycles, preps, seances, toast, setPage, addPoints, user, isPrepLiked, saveCycle, deleteCycle }: { cycles: Cycle[]; setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>; preps: Preparation[]; seances: Seance[]; toast: (m: string) => void; setPage: (p: string) => void; addPoints: (p: number, r: string) => void; user: User; isPrepLiked?: (id: string | number) => boolean; saveCycle?: (cycle: Cycle) => Promise<boolean>; deleteCycle?: (id: string | number) => Promise<void> }) {
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState<Cycle | null>(null)
  const [viewModal, setViewModal] = useState<Cycle | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [addPrepModal, setAddPrepModal] = useState<number | string | null>(null)
  const [showLikedOnly, setShowLikedOnly] = useState(false)
  const blank = { titre: "", discipline: "", classe: "", annee: "2025-2026", nbSeances: "8", dateDebut: "", dateFin: "", objectifs: "" }
  const [form, setForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)
  const f = (k: string) => (e: any) => setForm(v => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm(v => ({ ...v, [k]: e.target.value }))

  const save = async () => {
    if (!form.titre || !form.discipline) return
    // Use a temp marker so the API knows it's new (store will replace with real UUID)
    const newCycle: Cycle = { id: `new_${Date.now()}`, ...form, prepsLiees: [] } as any
    if (saveCycle) {
      const success = await saveCycle(newCycle)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setCycles(c => [...c, newCycle])
    }
    setForm(blank); setModal(false); toast("Cycle cree !"); addPoints(15, "cycle")
  }
  const saveEdit = async () => {
    const updatedCycle: Cycle = { ...editModal!, ...editForm } as any
    if (saveCycle) {
      const success = await saveCycle(updatedCycle)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setCycles(cs => cs.map(x => x.id === editModal!.id ? updatedCycle : x))
    }
    setEditModal(null); toast("Cycle modifie !")
  }
  const del = async (id: number | string) => {
    if (deleteCycle) {
      await deleteCycle(id)
    } else {
      setCycles(cs => cs.filter(x => x.id !== id))
    }
    toast("Cycle supprime.")
  }
  const togglePrepLink = async (cycleId: number | string, prep: Preparation) => {
    const updatedCycles = cycles.map(c => {
      if (c.id !== cycleId) return c
      const linked = (c.prepsLiees || []).find(p => p.id === prep.id)
      return { ...c, prepsLiees: linked ? (c.prepsLiees || []).filter(p => p.id !== prep.id) : [...(c.prepsLiees || []), prep] }
    })
    const updatedCycle = updatedCycles.find(c => c.id === cycleId)
    if (updatedCycle && saveCycle) {
      await saveCycle(updatedCycle)
    } else {
      setCycles(updatedCycles)
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}><Calendar size={24} color={C.green} /> Cycles</h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Planifiez vos cycles d'apprentissage</p>
        </div>
        <Btn color={C.green} onClick={() => setModal(true)}><Plus size={14} color="white" /> Nouveau cycle</Btn>
      </div>

      {cycles.length === 0
        ? <Card><EmptyState icon="calendar" title="Aucun cycle" subtitle="Creez votre premier cycle" cta={<Btn color={C.green} onClick={() => setModal(true)}>Creer un cycle</Btn>} /></Card>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
            {cycles.map(c => (
              <Card key={c.id} style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: C.dark, marginBottom: 4 }}>{c.titre}</div>
                    <div style={{ fontSize: 13, color: C.gray }}>{c.discipline} {"•"} {c.classe} {"•"} {c.nbSeances} seances</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setViewModal(c)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={13} color={C.gray} /></button>
                    <button onClick={() => { setEditForm({ ...c } as any); setEditModal(c) }} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={13} color={C.blue} /></button>
                    <button onClick={() => setConfirmDel(c.id)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} color={C.red} /></button>
                  </div>
                </div>
                {c.dateDebut && <div style={{ fontSize: 12, color: C.gray, marginBottom: 8 }}>{c.dateDebut} → {c.dateFin || "..."}</div>}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Tag color={C.green}>{c.annee}</Tag>
                  {(c.prepsLiees || []).length > 0 && <Tag color={C.blue}>{(c.prepsLiees || []).length} prepa(s)</Tag>}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <Btn sm outline color={C.blue} onClick={() => setAddPrepModal(c.id)}><Link2 size={13} color={C.blue} /> Lier prepas</Btn>
                </div>
              </Card>
            ))}
          </div>}

      {/* Create/Edit modals */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau cycle" width={560}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Titre" req><Inp value={form.titre} onChange={f("titre")} placeholder="Ex: Athletisme 3eme" /></FormField>
          <FormField label="Discipline" req><Sel value={form.discipline} onChange={f("discipline")} options={DISCIPLINES} /></FormField>
          <FormField label="Classe"><Inp value={form.classe} onChange={f("classe")} placeholder="3eme secondaire" /></FormField>
          <FormField label="Annee"><Inp value={form.annee} onChange={f("annee")} placeholder="2025-2026" /></FormField>
          <FormField label="Nb seances"><Inp type="number" value={form.nbSeances} onChange={f("nbSeances")} /></FormField>
          <FormField label="Date debut"><Inp type="date" value={form.dateDebut} onChange={f("dateDebut")} /></FormField>
          <FormField label="Date fin"><Inp type="date" value={form.dateFin} onChange={f("dateFin")} /></FormField>
        </div>
        <FormField label="Objectifs"><TA value={form.objectifs} onChange={f("objectifs")} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn outline color={C.gray} onClick={() => setModal(false)}>Annuler</Btn>
          <Btn color={C.green} onClick={save} disabled={!form.titre || !form.discipline}>Creer</Btn>
        </div>
      </Modal>
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier le cycle" width={560}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Titre" req><Inp value={editForm.titre} onChange={ef("titre")} /></FormField>
          <FormField label="Discipline" req><Sel value={editForm.discipline} onChange={ef("discipline")} options={DISCIPLINES} /></FormField>
          <FormField label="Classe"><Inp value={editForm.classe} onChange={ef("classe")} /></FormField>
          <FormField label="Annee"><Inp value={editForm.annee} onChange={ef("annee")} /></FormField>
          <FormField label="Nb seances"><Inp type="number" value={editForm.nbSeances} onChange={ef("nbSeances")} /></FormField>
          <FormField label="Date debut"><Inp type="date" value={editForm.dateDebut} onChange={ef("dateDebut")} /></FormField>
          <FormField label="Date fin"><Inp type="date" value={editForm.dateFin} onChange={ef("dateFin")} /></FormField>
        </div>
        <FormField label="Objectifs"><TA value={editForm.objectifs} onChange={ef("objectifs")} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn outline color={C.gray} onClick={() => setEditModal(null)}>Annuler</Btn>
          <Btn color={C.green} onClick={saveEdit}>Sauvegarder</Btn>
        </div>
      </Modal>

      {/* View modal */}
      {viewModal && (
        <Modal open={true} onClose={() => setViewModal(null)} title={viewModal.titre} subtitle={`${viewModal.classe} • ${viewModal.annee}`} width={560}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["Discipline", viewModal.discipline], ["Seances", viewModal.nbSeances], ["Debut", viewModal.dateDebut || "—"], ["Fin", viewModal.dateFin || "—"]].map(([l, v]) => (
              <div key={l} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600, marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: C.dark }}>{v || "—"}</div>
              </div>
            ))}
          </div>
          {viewModal.objectifs && <div style={{ marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>Objectifs</div><div style={{ fontSize: 14, lineHeight: 1.7, background: "#f9fafb", borderRadius: 9, padding: "10px 14px" }}>{viewModal.objectifs}</div></div>}
          {(viewModal.prepsLiees || []).length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Preparations liees ({(viewModal.prepsLiees || []).length})</div>
              {(viewModal.prepsLiees || []).map(p => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#f0fdf4", borderRadius: 9, marginBottom: 6, border: "1px solid #d1fae5" }}>
                  <BookOpen size={14} color={C.green} />
                  <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: 14 }}>{p.titre}</div><div style={{ fontSize: 12, color: C.gray }}>{p.discipline} {"•"} {p.duree}min</div></div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setViewModal(null)}>Fermer</Btn>
            <Btn outline color={C.blue} onClick={() => { setAddPrepModal(viewModal.id); setViewModal(null) }}><Link2 size={13} color={C.blue} /> Lier prepas</Btn>
            <Btn color={C.green} onClick={() => { setEditForm({ ...viewModal } as any); setEditModal(viewModal); setViewModal(null) }}><Pencil size={13} color="white" /> Modifier</Btn>
          </div>
        </Modal>
      )}

      {/* Link preps modal */}
      {addPrepModal && (() => {
        const filteredPreps = showLikedOnly && isPrepLiked
          ? preps.filter(p => isPrepLiked(p.id))
          : preps
        const sortedPreps = isPrepLiked
          ? [...filteredPreps].sort((a, b) => {
              const aLiked = isPrepLiked(a.id) ? 0 : 1
              const bLiked = isPrepLiked(b.id) ? 0 : 1
              return aLiked - bLiked
            })
          : filteredPreps
        return (
        <Modal open={true} onClose={() => { setAddPrepModal(null); setShowLikedOnly(false) }} title="Lier des preparations" width={600}>
          {isPrepLiked && (
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              <button onClick={() => setShowLikedOnly(false)} style={{
                padding: "6px 14px", borderRadius: 8, border: !showLikedOnly ? `1.5px solid ${C.blue}` : "1.5px solid #e5e7eb",
                background: !showLikedOnly ? C.blueLight : "white", color: !showLikedOnly ? C.blue : C.gray,
                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>Toutes ({preps.length})</button>
              <button onClick={() => setShowLikedOnly(true)} style={{
                padding: "6px 14px", borderRadius: 8, border: showLikedOnly ? `1.5px solid #ef4444` : "1.5px solid #e5e7eb",
                background: showLikedOnly ? "#fef2f2" : "white", color: showLikedOnly ? "#ef4444" : C.gray,
                fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: 6,
              }}><Heart size={13} fill={showLikedOnly ? "#ef4444" : "none"} /> Likees ({preps.filter(p => isPrepLiked(p.id)).length})</button>
            </div>
          )}
          <div style={{ maxHeight: 340, overflowY: "auto", border: "1px solid #e5e7eb", borderRadius: 12 }}>
            {sortedPreps.length === 0
              ? <div style={{ padding: 32, textAlign: "center", color: C.gray }}>{showLikedOnly ? "Aucune preparation likee" : "Aucune preparation disponible"}</div>
              : sortedPreps.map((p, idx) => {
                  const cycle = cycles.find(c => c.id === addPrepModal)
                  const isLinked = (cycle?.prepsLiees || []).find(lp => lp.id === p.id)
                  const liked = isPrepLiked ? isPrepLiked(p.id) : false
                  return (
                    <div key={p.id} style={{ padding: "12px 16px", borderBottom: idx < sortedPreps.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", background: isLinked ? "#f0fdf4" : liked ? "#fef2f2" : "white" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
                        {liked && <Heart size={14} color="#ef4444" fill="#ef4444" />}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{p.titre}</div>
                          <div style={{ fontSize: 12, color: C.gray }}>{p.discipline} {p.duree && `\u2022 ${p.duree}min`}</div>
                        </div>
                      </div>
                      <button onClick={() => togglePrepLink(addPrepModal!, p)} style={{ padding: "6px 14px", borderRadius: 8, border: isLinked ? `1.5px solid ${C.green}` : "1.5px solid #e5e7eb", background: isLinked ? C.greenLight : "white", color: isLinked ? C.green : C.gray, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                        {isLinked ? "Liee" : "Lier"}
                      </button>
                    </div>
                  )
                })}
          </div>
          <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
            <Btn color={C.green} onClick={() => { setAddPrepModal(null); setShowLikedOnly(false); toast("Preparations liees !") }}>Confirmer</Btn>
          </div>
        </Modal>
        )
      })()}

      <ConfirmModal open={!!confirmDel} title="Supprimer le cycle" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
