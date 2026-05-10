"use client"
import React, { useState } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal } from "@/components/ui-atoms"
import { Lightbulb, Plus, Pencil, Trash2, ThumbsUp, ThumbsDown } from "lucide-react"
import type { Innovation, User, Vote } from "@/lib/types"
import { correctText } from "@/lib/spell-correction"

export function PageInnovations({ innovations, setInnovations, toast, user, votes, setVotes, saveInnovation, deleteInnovation }: {
  innovations: Innovation[]; setInnovations: React.Dispatch<React.SetStateAction<Innovation[]>>;
  toast: (m: string) => void; user: User;
  votes: Vote[]; setVotes: React.Dispatch<React.SetStateAction<Vote[]>>;
  saveInnovation?: (innovation: Innovation) => Promise<boolean>;
  deleteInnovation?: (id: string | number) => Promise<void>;
}) {
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState<Innovation | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [catFilter, setCatFilter] = useState("Toutes")
  const [sortBy, setSortBy] = useState("recent")
  const cats = ["Technologie", "Pedagogie", "Inclusion", "Evaluation", "Bien-etre", "Environnement"]
  const catColor: Record<string, string> = { "Technologie": C.blue, "Pedagogie": C.green, "Inclusion": "#7c3aed", "Evaluation": C.orange, "Bien-etre": C.teal, "Environnement": "#16a34a" }
  const blank = { titre: "", categorie: "", description: "" }
  const [form, setForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)
  const f = (k: string) => (e: any) => setForm(v => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm(v => ({ ...v, [k]: e.target.value }))

  const demoInnovations: Innovation[] = [
    { id: "i1", titre: "Capteurs de mouvement pour l'analyse biomecanique", categorie: "Technologie", description: "Utilisation de capteurs portables pour analyser la course et les sauts des eleves en temps reel.", date: "20/02/2026", likes: 12, auteur: "Prof. Martin", auteurId: "demo1", isTeacher: true },
    { id: "i2", titre: "Parcours adaptatifs par QR code", categorie: "Pedagogie", description: "Chaque eleve scanne un QR code pour obtenir un parcours personnalise adapte a son niveau.", date: "15/02/2026", likes: 8, auteur: "Sophie D.", auteurId: "demo2", isTeacher: false },
    { id: "i3", titre: "EPS en plein air : jardin sportif", categorie: "Environnement", description: "Creer un jardin sportif dans la cour pour combiner activite physique et sensibilisation ecologique.", date: "10/02/2026", likes: 15, auteur: "Dr. Lambert", auteurId: "demo3", isTeacher: true },
  ]

  // Get user's vote on an innovation
  const getUserVote = (innovId: string | number): 'up' | 'down' | null => {
    const vote = votes.find(v => v.targetId === String(innovId) && v.targetType === 'innovation' && v.userId === (user.id || user.name))
    return vote ? vote.voteType : null
  }

  // Calculate score for an innovation
  const getScore = (innovId: string | number): number => {
    const innovVotes = votes.filter(v => v.targetId === String(innovId) && v.targetType === 'innovation')
    return innovVotes.reduce((acc, v) => acc + (v.voteType === 'up' ? 1 : -1), 0)
  }

  // Vote handler - prevents double vote
  const handleVote = (innovId: string | number, voteType: 'up' | 'down') => {
    const existingVote = votes.find(v => v.targetId === String(innovId) && v.targetType === 'innovation' && v.userId === (user.id || user.name))
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (clicking same button again)
        setVotes(vs => vs.filter(v => v.id !== existingVote.id))
        toast("Vote retire")
      } else {
        // Change vote (switching from up to down or vice versa)
        setVotes(vs => vs.map(v => v.id === existingVote.id ? { ...v, voteType } : v))
        toast(voteType === 'up' ? "Vote positif !" : "Vote negatif")
      }
    } else {
      // New vote
      setVotes(vs => [...vs, {
        id: `vote-innov-${Date.now()}`,
        userId: user.id || user.name,
        targetId: String(innovId),
        targetType: 'innovation',
        voteType
      }])
      toast(voteType === 'up' ? "Vote positif !" : "Vote negatif")
    }
  }

  // Check if user can edit/delete (author only)
  const canEdit = (innov: Innovation): boolean => {
    return innov.auteurId === user.id || innov.auteur === user.name || (!String(innov.id).startsWith("i"))
  }

  const allInnovations = [...innovations, ...demoInnovations]
  
  // Filter and sort
  let list = catFilter === "Toutes" ? allInnovations : allInnovations.filter(i => i.categorie === catFilter)
  
  if (sortBy === "score") {
    list = [...list].sort((a, b) => getScore(b.id) - getScore(a.id))
  } else if (sortBy === "recent") {
    list = [...list].sort((a, b) => {
      const dateA = a.date.split("/").reverse().join("-")
      const dateB = b.date.split("/").reverse().join("-")
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  }

  const save = async () => {
    if (!form.titre) return
    const correctedForm = {
      titre: correctText(form.titre),
      categorie: form.categorie,
      description: correctText(form.description)
    }
    const newInnovation: Innovation = { 
      id: `new_${Date.now()}`, 
      ...correctedForm, 
      date: new Date().toLocaleDateString("fr-FR"), 
      likes: 0,
      auteur: user.name,
      auteurId: user.id,
      isTeacher: user.isTeacher,
      score: 0
    } as any
    if (saveInnovation) {
      const success = await saveInnovation(newInnovation)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setInnovations(p => [...p, newInnovation])
    }
    setForm(blank); setModal(false); toast("Innovation ajoutee !")
  }
  
  const saveEdit = async () => {
    const correctedForm = {
      titre: correctText(editForm.titre),
      categorie: editForm.categorie,
      description: correctText(editForm.description)
    }
    const updatedInnovation: Innovation = { ...editModal!, ...correctedForm } as any
    if (saveInnovation) {
      const success = await saveInnovation(updatedInnovation)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setInnovations(is => is.map(x => x.id === editModal!.id ? updatedInnovation : x))
    }
    setEditModal(null); toast("Innovation modifiee !")
  }
  
  const del = async (id: number | string) => { 
    if (deleteInnovation) {
      await deleteInnovation(id)
    } else {
      setInnovations(is => is.filter(x => x.id !== id))
    }
    setVotes(vs => vs.filter(v => !(v.targetId === String(id) && v.targetType === 'innovation')))
    toast("Innovation supprimee.") 
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
            <Lightbulb size={24} color={"#d97706"} /> Innovations
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Decouvrez et partagez des idees innovantes en EPS</p>
        </div>
        <Btn color={"#d97706"} onClick={() => setModal(true)}><Plus size={14} color="white" /> Proposer une innovation</Btn>
      </div>

      {/* Filters */}
      <Card style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {["Toutes", ...cats].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                padding: "5px 13px", borderRadius: 20, border: `1.5px solid ${catFilter === c ? catColor[c] || "#d97706" : "#e5e7eb"}`,
                background: catFilter === c ? (catColor[c] || "#d97706") + "18" : "white",
                color: catFilter === c ? catColor[c] || "#d97706" : C.gray,
                fontSize: 13, fontWeight: catFilter === c ? 700 : 500, cursor: "pointer", fontFamily: "inherit"
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: C.gray }}>Trier par :</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} 
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
              <option value="recent">Plus recents</option>
              <option value="score">Meilleur score</option>
            </select>
          </div>
        </div>
      </Card>

      {list.length === 0
        ? <Card><EmptyState icon="lightbulb" title="Aucune innovation" subtitle="Proposez votre premiere idee innovante !" cta={<Btn color={"#d97706"} onClick={() => setModal(true)}>Proposer</Btn>} /></Card>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
          {list.map(it => {
            const isDemo = String(it.id).startsWith("i")
            const userVote = getUserVote(it.id)
            const score = getScore(it.id)
            const isAuthor = canEdit(it)
            
            return (
              <Card key={it.id} style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    {/* Author info */}
                    {it.auteur && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: it.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800 }}>{(it.auteur)[0]?.toUpperCase()}</div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.dark }}>{it.auteur}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: it.isTeacher ? C.tealLight : C.blueLight, color: it.isTeacher ? C.teal : C.blue }}>{it.isTeacher ? "Prof" : "Etudiant"}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>{it.titre}</div>
                    </div>
                    {it.categorie && <Tag color={catColor[it.categorie] || "#d97706"}>{it.categorie}</Tag>}
                  </div>
                  {isAuthor && !isDemo && (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditForm({ ...it } as any); setEditModal(it) }} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={13} color={C.blue} /></button>
                      <button onClick={() => setConfirmDel(it.id)} style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} color={C.red} /></button>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: "#374151", marginBottom: 12 }}>{it.description}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: C.gray }}>{it.date}</span>
                  
                  {/* Vote buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", background: "#f8fafc", borderRadius: 20, border: "1px solid #e5e7eb" }}>
                    <button onClick={() => handleVote(it.id, 'up')}
                      style={{ background: userVote === 'up' ? C.greenLight : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <ThumbsUp size={14} color={userVote === 'up' ? C.green : C.gray} fill={userVote === 'up' ? C.green : "none"} />
                    </button>
                    <span style={{ fontWeight: 700, fontSize: 14, color: score > 0 ? C.green : score < 0 ? C.red : C.gray, minWidth: 24, textAlign: "center" }}>{score}</span>
                    <button onClick={() => handleVote(it.id, 'down')}
                      style={{ background: userVote === 'down' ? "#fef2f2" : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <ThumbsDown size={14} color={userVote === 'down' ? C.red : C.gray} fill={userVote === 'down' ? C.red : "none"} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>}

      <Modal open={modal} onClose={() => setModal(false)} title="Proposer une innovation" width={520}>
        <FormField label="Titre" req><Inp value={form.titre} onChange={f("titre")} placeholder="Votre idee innovante" /></FormField>
        <FormField label="Categorie"><Sel value={form.categorie} onChange={f("categorie")} options={cats} /></FormField>
        <FormField label="Description" req><TA value={form.description} onChange={f("description")} rows={5} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn outline color={C.gray} onClick={() => setModal(false)}>Annuler</Btn>
          <Btn color={"#d97706"} onClick={save} disabled={!form.titre}>Proposer</Btn>
        </div>
      </Modal>
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier l'innovation" width={520}>
        <FormField label="Titre" req><Inp value={editForm.titre} onChange={ef("titre")} /></FormField>
        <FormField label="Categorie"><Sel value={editForm.categorie} onChange={ef("categorie")} options={cats} /></FormField>
        <FormField label="Description" req><TA value={editForm.description} onChange={ef("description")} rows={5} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn outline color={C.gray} onClick={() => setEditModal(null)}>Annuler</Btn>
          <Btn color={"#d97706"} onClick={saveEdit}>Sauvegarder</Btn>
        </div>
      </Modal>
      <ConfirmModal open={!!confirmDel} title="Supprimer l'innovation" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
