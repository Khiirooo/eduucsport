"use client"
import React, { useState } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal } from "@/components/ui-atoms"
import { MessageCircle, Plus, Eye, Pencil, Trash2, Send, ThumbsUp, ThumbsDown, AlertCircle, BookOpen, X } from "lucide-react"
import type { ForumPost, ForumReply, User, Vote } from "@/lib/types"
import { correctText } from "@/lib/spell-correction"

// Forum rules - visible to all users
const FORUM_RULES = [
  "Restez respectueux et courtois envers tous les membres",
  "Pas de contenu offensant, discriminatoire ou inapproprie",
  "Evitez le spam et les messages hors-sujet",
  "Citez vos sources lorsque vous partagez des informations",
  "Les contenus promotionnels non autorises seront supprimes",
  "Les moderateurs peuvent supprimer tout contenu inapproprie"
]

export function PageForum({ posts, setPosts, toast, user, addPoints, votes, setVotes, saveForumPost, deleteForumPost }: {
  posts: ForumPost[]; setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>;
  toast: (m: string) => void; user: User; addPoints: (p: number, r: string) => void;
  votes: Vote[]; setVotes: React.Dispatch<React.SetStateAction<Vote[]>>;
  saveForumPost?: (post: ForumPost) => Promise<boolean>;
  deleteForumPost?: (id: string | number) => Promise<void>;
}) {
  const [cat, setCat] = useState("Toutes")
  const [modal, setModal] = useState(false)
  const [viewModal, setViewModal] = useState<ForumPost | null>(null)
  const [editModal, setEditModal] = useState<ForumPost | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [replyText, setReplyText] = useState("")
  const [showRules, setShowRules] = useState(false)
  const [sortBy, setSortBy] = useState("recent")
  const cats = ["Toutes", "Gestion de classe", "Ecoles", "Inclusion", "Motivation", "Idees de jeux", "Materiel", "Evaluation", "Collaboration", "Autre"]
  const catColor: Record<string, string> = { "Gestion de classe": C.orange, "Ecoles": C.blue, "Inclusion": C.green, "Motivation": "#d97706", "Idees de jeux": "#7c3aed", "Materiel": "#64748b", "Evaluation": C.red, "Collaboration": C.teal }
  const blank = { titre: "", categorie: "", contenu: "" }
  const [form, setForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)
  const f = (k: string) => (e: any) => setForm(v => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm(v => ({ ...v, [k]: e.target.value }))

  const demoData: ForumPost[] = [
    { id: "d1", titre: "Comment gerer une classe agitee en EPS ?", categorie: "Gestion de classe", contenu: "J'ai une classe de 2eme secondaire tres difficile a gerer. Des conseils ?", auteur: "Julie Martin", auteurId: "demo1", isTeacher: false, date: "15/02/2026", likes: 5, likedBy: [], replies: 2, replyList: [
      { id: "r1", auteur: "Prof. Dumont", isTeacher: true, contenu: "Essayez de mettre en place un systeme de points avec des privileges. Ca marche bien !", date: "16/02/2026" },
      { id: "r2", auteur: "Marie L.", isTeacher: false, contenu: "Je vous recommande aussi de varier les activites pour garder leur attention.", date: "17/02/2026" }
    ]},
    { id: "d2", titre: "Materiel pour le badminton : marques recommandees ?", categorie: "Materiel", contenu: "Je cherche des raquettes durables pour 30 eleves, budget limite.", auteur: "Prof. Dumont", auteurId: "demo2", isTeacher: true, date: "12/02/2026", likes: 8, likedBy: [], replies: 1, replyList: [
      { id: "r3", auteur: "Sport Expert", isTeacher: true, contenu: "Les raquettes Yonex GR-020 sont excellentes pour un usage scolaire. Rapport qualite-prix imbattable !", date: "13/02/2026" }
    ]},
  ]

  // Get user's vote on a post
  const getUserVote = (postId: string | number): 'up' | 'down' | null => {
    const vote = votes.find(v => v.targetId === String(postId) && v.targetType === 'forum' && v.userId === (user.id || user.name))
    return vote ? vote.voteType : null
  }

  // Calculate score for a post
  const getScore = (postId: string | number): number => {
    const postVotes = votes.filter(v => v.targetId === String(postId) && v.targetType === 'forum')
    return postVotes.reduce((acc, v) => acc + (v.voteType === 'up' ? 1 : -1), 0)
  }

  // Vote handler - prevents double vote
  const handleVote = (postId: string | number, voteType: 'up' | 'down') => {
    const existingVote = votes.find(v => v.targetId === String(postId) && v.targetType === 'forum' && v.userId === (user.id || user.name))
    
    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        setVotes(vs => vs.filter(v => v.id !== existingVote.id))
        toast("Vote retire")
      } else {
        // Change vote
        setVotes(vs => vs.map(v => v.id === existingVote.id ? { ...v, voteType } : v))
        toast(voteType === 'up' ? "Vote positif !" : "Vote negatif")
      }
    } else {
      // New vote
      setVotes(vs => [...vs, {
        id: `vote-forum-${Date.now()}`,
        userId: user.id || user.name,
        targetId: String(postId),
        targetType: 'forum',
        voteType
      }])
      toast(voteType === 'up' ? "Vote positif !" : "Vote negatif")
    }
  }

  // Check if user can edit/delete (author only)
  const canEdit = (post: ForumPost): boolean => {
    return post.auteurId === user.id || post.auteur === user.name
  }

  const allPosts = [...posts, ...demoData]
  
  // Filter and sort
  let list = cat === "Toutes" ? allPosts : allPosts.filter(p => p.categorie === cat)
  
  if (sortBy === "score") {
    list = [...list].sort((a, b) => getScore(b.id) - getScore(a.id))
  } else if (sortBy === "recent") {
    list = [...list].sort((a, b) => {
      const dateA = a.date.split("/").reverse().join("-")
      const dateB = b.date.split("/").reverse().join("-")
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  } else if (sortBy === "replies") {
    list = [...list].sort((a, b) => (b.replyList?.length || 0) - (a.replyList?.length || 0))
  }

  const save = async () => {
    if (!form.titre || !form.contenu) return
    const correctedForm = {
      titre: correctText(form.titre),
      categorie: form.categorie,
      contenu: correctText(form.contenu)
    }
    const newPost: ForumPost = { 
      id: Date.now(), 
      ...correctedForm, 
      auteur: user.name, 
      auteurId: user.id,
      isTeacher: user.isTeacher, 
      date: new Date().toLocaleDateString("fr-FR"), 
      likes: 0, 
      likedBy: [], 
      replies: 0, 
      replyList: [],
      score: 0
    }
    if (saveForumPost) {
      const success = await saveForumPost(newPost)
      if (!success) { toast("Erreur lors de la publication. Reessayez."); return }
    } else {
      setPosts(p => [...p, newPost])
    }
    setForm(blank); setModal(false); toast("Post publie !"); addPoints(10, "post")
  }
  
  const saveEdit = async () => {
    const correctedForm = {
      titre: correctText(editForm.titre),
      categorie: editForm.categorie,
      contenu: correctText(editForm.contenu)
    }
    const updatedPost: ForumPost = { ...editModal!, ...correctedForm } as any
    if (saveForumPost) {
      const success = await saveForumPost(updatedPost)
      if (!success) { toast("Erreur lors de la sauvegarde. Reessayez."); return }
    } else {
      setPosts(ps => ps.map(x => x.id === editModal!.id ? updatedPost : x))
    }
    setEditModal(null); toast("Post modifie !")
  }
  
  const del = async (id: number | string) => { 
    if (deleteForumPost) {
      await deleteForumPost(id)
    } else {
      setPosts(ps => ps.filter(x => x.id !== id))
    }
    setVotes(vs => vs.filter(v => !(v.targetId === String(id) && v.targetType === 'forum')))
    toast("Post supprime.") 
  }

  const addReply = (postId: number | string) => {
    if (!replyText.trim()) return
    const isDemo = String(postId).startsWith("d")
    if (isDemo) { toast("Reponse ajoutee !"); setReplyText(""); return }
    setPosts(ps => ps.map(p => {
      if (p.id !== postId) return p
      return { 
        ...p, 
        replies: p.replies + 1, 
        replyList: [...(p.replyList || []), { 
          id: Date.now(), 
          auteur: user.name, 
          isTeacher: user.isTeacher, 
          contenu: correctText(replyText), 
          date: new Date().toLocaleDateString("fr-FR") 
        }] 
      }
    }))
    setReplyText(""); toast("Reponse ajoutee !"); addPoints(5, "reply")
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
            <MessageCircle size={24} color={"#7c3aed"} /> Forum
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Echangez avec la communaute EPS</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn outline color="#7c3aed" onClick={() => setShowRules(true)}>
            <BookOpen size={14} color="#7c3aed" /> Reglement
          </Btn>
          <Btn color={"#7c3aed"} onClick={() => setModal(true)}>
            <Plus size={14} color="white" /> Nouveau sujet
          </Btn>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "5px 13px", borderRadius: 20, border: `1.5px solid ${cat === c ? catColor[c] || "#7c3aed" : "#e5e7eb"}`,
                background: cat === c ? (catColor[c] || "#7c3aed") + "18" : "white",
                color: cat === c ? catColor[c] || "#7c3aed" : C.gray,
                fontSize: 13, fontWeight: cat === c ? 700 : 500, cursor: "pointer", fontFamily: "inherit"
              }}>{c}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: C.gray }}>Trier par :</span>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} 
              style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
              <option value="recent">Plus recents</option>
              <option value="score">Meilleur score</option>
              <option value="replies">Plus de reponses</option>
            </select>
          </div>
        </div>
      </Card>

      <Card>
        {list.length === 0
          ? <EmptyState icon="chat" title="Aucun sujet" subtitle="Soyez le premier a ouvrir une discussion !" cta={<Btn color={"#7c3aed"} onClick={() => setModal(true)}>Creer un sujet</Btn>} />
          : list.map((p, idx) => {
            const isDemo = String(p.id).startsWith("d")
            const userVote = getUserVote(p.id)
            const score = getScore(p.id)
            const isAuthor = canEdit(p) && !isDemo
            
            return (
              <div key={p.id} style={{ padding: "14px 20px", borderBottom: idx < list.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setViewModal(p)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: p.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 800 }}>{(p.auteur || "?")[0]?.toUpperCase()}</div>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.dark }}>{p.auteur}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20, background: p.isTeacher ? C.tealLight : C.blueLight, color: p.isTeacher ? C.teal : C.blue }}>{p.isTeacher ? "Enseignant" : "Etudiant"}</span>
                    {p.categorie && <Tag color={catColor[p.categorie] || C.gray}>{p.categorie}</Tag>}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: C.dark, marginBottom: 3 }}>{p.titre}</div>
                  <div style={{ fontSize: 12.5, color: C.gray }}>{p.date} - {p.replies || (p.replyList || []).length} reponse(s)</div>
                </div>
                
                {/* Vote buttons */}
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 12, padding: "4px 10px", background: "#f8fafc", borderRadius: 20, border: "1px solid #e5e7eb" }}>
                  <button onClick={(e) => { e.stopPropagation(); handleVote(p.id, 'up') }}
                    style={{ background: userVote === 'up' ? C.greenLight : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <ThumbsUp size={14} color={userVote === 'up' ? C.green : C.gray} fill={userVote === 'up' ? C.green : "none"} />
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 13, color: score > 0 ? C.green : score < 0 ? C.red : C.gray, minWidth: 24, textAlign: "center" }}>{score}</span>
                  <button onClick={(e) => { e.stopPropagation(); handleVote(p.id, 'down') }}
                    style={{ background: userVote === 'down' ? "#fef2f2" : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <ThumbsDown size={14} color={userVote === 'down' ? C.red : C.gray} fill={userVote === 'down' ? C.red : "none"} />
                  </button>
                </div>
                
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setViewModal(p)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Eye size={14} color={C.gray} /></button>
                  {isAuthor && (
                    <>
                      <button onClick={() => { setEditForm({ ...p } as any); setEditModal(p) }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} color={C.blue} /></button>
                      <button onClick={() => setConfirmDel(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} color={C.red} /></button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
      </Card>

      {/* Rules modal */}
      <Modal open={showRules} onClose={() => setShowRules(false)} title="Reglement du Forum" width={520}>
        <div style={{ padding: "16px 20px", background: "#fef3c7", borderRadius: 12, marginBottom: 16, border: "1px solid #fcd34d" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <AlertCircle size={18} color="#d97706" />
            <span style={{ fontWeight: 700, color: "#92400e" }}>Important</span>
          </div>
          <p style={{ fontSize: 14, color: "#78350f", margin: 0, lineHeight: 1.6 }}>
            Le non-respect de ces regles peut entrainer la suppression de vos messages et/ou la suspension de votre compte.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FORUM_RULES.map((rule, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#7c3aed", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
              <span style={{ fontSize: 14, color: C.dark, lineHeight: 1.5 }}>{rule}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Btn color="#7c3aed" onClick={() => setShowRules(false)}>J'ai compris</Btn>
        </div>
      </Modal>

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nouveau sujet" width={520}>
        <div style={{ padding: "10px 14px", background: "#f0f9ff", borderRadius: 10, marginBottom: 16, fontSize: 13, color: C.blue, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={16} />
          En publiant, vous acceptez le reglement du forum.
        </div>
        <FormField label="Titre" req><Inp value={form.titre} onChange={f("titre")} placeholder="Votre question ou sujet" /></FormField>
        <FormField label="Categorie"><Sel value={form.categorie} onChange={f("categorie")} options={cats.slice(1)} /></FormField>
        <FormField label="Contenu" req><TA value={form.contenu} onChange={f("contenu")} rows={5} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn outline color={C.gray} onClick={() => setModal(false)}>Annuler</Btn>
          <Btn color={"#7c3aed"} onClick={save} disabled={!form.titre || !form.contenu}>Publier</Btn>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier le sujet" width={520}>
        <FormField label="Titre" req><Inp value={editForm.titre} onChange={ef("titre")} /></FormField>
        <FormField label="Categorie"><Sel value={editForm.categorie} onChange={ef("categorie")} options={cats.slice(1)} /></FormField>
        <FormField label="Contenu" req><TA value={editForm.contenu} onChange={ef("contenu")} rows={5} /></FormField>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
          <Btn outline color={C.gray} onClick={() => setEditModal(null)}>Annuler</Btn>
          <Btn color={"#7c3aed"} onClick={saveEdit}>Sauvegarder</Btn>
        </div>
      </Modal>

      {/* View modal with replies */}
      {viewModal && (
        <Modal open={true} onClose={() => setViewModal(null)} title={viewModal.titre} width={600}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", background: viewModal.isTeacher ? C.tealLight : C.blueLight, borderRadius: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: viewModal.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 800 }}>{(viewModal.auteur)[0]?.toUpperCase()}</div>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{viewModal.auteur}</span>
            <Tag color={viewModal.isTeacher ? C.teal : C.blue}>{viewModal.isTeacher ? "Enseignant" : "Etudiant"}</Tag>
            {viewModal.categorie && <Tag color={catColor[viewModal.categorie] || C.gray}>{viewModal.categorie}</Tag>}
            <span style={{ fontSize: 12, color: C.gray, marginLeft: "auto" }}>{viewModal.date}</span>
          </div>
          
          {/* Score in view modal */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 12px", background: "#f8fafc", borderRadius: 20, border: "1px solid #e5e7eb" }}>
              <button onClick={() => handleVote(viewModal.id, 'up')}
                style={{ background: getUserVote(viewModal.id) === 'up' ? C.greenLight : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ThumbsUp size={16} color={getUserVote(viewModal.id) === 'up' ? C.green : C.gray} fill={getUserVote(viewModal.id) === 'up' ? C.green : "none"} />
              </button>
              <span style={{ fontWeight: 700, fontSize: 15, color: getScore(viewModal.id) > 0 ? C.green : getScore(viewModal.id) < 0 ? C.red : C.gray, minWidth: 28, textAlign: "center" }}>{getScore(viewModal.id)}</span>
              <button onClick={() => handleVote(viewModal.id, 'down')}
                style={{ background: getUserVote(viewModal.id) === 'down' ? "#fef2f2" : "transparent", border: "none", borderRadius: 6, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <ThumbsDown size={16} color={getUserVote(viewModal.id) === 'down' ? C.red : C.gray} fill={getUserVote(viewModal.id) === 'down' ? C.red : "none"} />
              </button>
            </div>
            <span style={{ fontSize: 13, color: C.gray }}>Votez pour ce sujet</span>
          </div>
          
          <div style={{ fontSize: 14.5, lineHeight: 1.7, marginBottom: 20, padding: "12px 16px", background: "#f9fafb", borderRadius: 10, whiteSpace: "pre-wrap" }}>{viewModal.contenu}</div>

          {/* Replies */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Reponses ({(viewModal.replyList || []).length})</div>
            {(viewModal.replyList || []).length === 0
              ? <div style={{ padding: 16, textAlign: "center", color: C.gray, fontSize: 13, background: "#f9fafb", borderRadius: 10 }}>Aucune reponse pour le moment</div>
              : (viewModal.replyList || []).map(r => (
                <div key={r.id} style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, marginBottom: 8, border: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: r.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 9, fontWeight: 800 }}>{(r.auteur || "?")[0]?.toUpperCase()}</div>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.auteur}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: r.isTeacher ? C.teal : C.blue }}>{r.isTeacher ? "Enseignant" : "Etudiant"}</span>
                    <span style={{ fontSize: 11, color: C.gray }}>{r.date}</span>
                  </div>
                  <div style={{ fontSize: 14, lineHeight: 1.6 }}>{r.contenu}</div>
                </div>
              ))}
          </div>

          {/* Reply form */}
          <div style={{ display: "flex", gap: 8 }}>
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { addReply(viewModal.id); } }}
              placeholder="Votre reponse..."
              style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none", fontFamily: "inherit" }} />
            <Btn color={"#7c3aed"} sm onClick={() => addReply(viewModal.id)}><Send size={13} color="white" /> Repondre</Btn>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <Btn outline color={C.gray} onClick={() => setViewModal(null)}>Fermer</Btn>
          </div>
        </Modal>
      )}

      <ConfirmModal open={!!confirmDel} title="Supprimer le sujet" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
