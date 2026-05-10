"use client"
import React, { useState, useRef, useMemo } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Modal, Inp, TA, Sel, FormField, EmptyState, ConfirmModal } from "@/components/ui-atoms"
import { BookOpen, Plus, Upload, Eye, Pencil, Check, Trash2, FileText, File, X, ThumbsUp, Filter, Image, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import type { Preparation, User } from "@/lib/types"
import { DISCIPLINES, CATEGORIES, LOCATIONS, VISIBILITIES } from "@/lib/types"
import { correctText } from "@/lib/spell-correction"

/* Convert file to base64 data URL for persistence */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function PrepForm({ formData, onChange, onSave, onCancel, btnLabel, isEdit = false }: { 
  formData: any; onChange: (k: string) => (e: any) => void; onSave: () => void; onCancel: () => void; btnLabel: string; isEdit?: boolean 
}) {
  const planRef = useRef<HTMLInputElement>(null)
  const [planPreview, setPlanPreview] = useState<string | null>(formData.fileUrl || null)

  const handlePlanUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToDataUrl(file)
      setPlanPreview(dataUrl)
      onChange("fileUrl")({ target: { value: dataUrl } })
      onChange("fileName")({ target: { value: file.name } })
      onChange("fileType")({ target: { value: file.type.includes("pdf") ? "pdf" : "image" } })
    } catch {
      console.error("Erreur upload")
    }
    e.target.value = ""
  }

  // Auto-correct text on blur
  const handleBlur = (field: string) => () => {
    const value = formData[field]
    if (value && typeof value === 'string') {
      const corrected = correctText(value)
      if (corrected !== value) {
        onChange(field)({ target: { value: corrected } })
      }
    }
  }

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <FormField label="Titre" req>
          <Inp value={formData.titre} onChange={onChange("titre")} onBlur={handleBlur("titre")} placeholder="Ex: Course de vitesse" />
        </FormField>
        <FormField label="Discipline" req>
          <Sel value={formData.discipline} onChange={onChange("discipline")} options={DISCIPLINES} />
        </FormField>
        <FormField label="Categorie">
          <Sel value={formData.category || ""} onChange={onChange("category")} options={["", ...CATEGORIES]} />
        </FormField>
        <FormField label="Lieu">
          <Sel value={formData.location || ""} onChange={onChange("location")} options={[{ value: "", label: "Choisir..." }, ...LOCATIONS]} />
        </FormField>
        <FormField label="Classe">
          <Inp placeholder="3eme secondaire" value={formData.classe} onChange={onChange("classe")} />
        </FormField>
        <FormField label="Duree (min)">
          <Inp type="number" placeholder="60" value={formData.duree} onChange={onChange("duree")} />
        </FormField>
      </div>
      
      {/* Plan import */}
      <FormField label="Plan / Schema (image ou PDF)">
        <input ref={planRef} type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={handlePlanUpload} />
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Btn outline color={C.blue} onClick={() => planRef.current?.click()} type="button">
            <Image size={14} color={C.blue} /> Importer un plan
          </Btn>
          {planPreview && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Tag color={C.green}>Plan importe</Tag>
              <button onClick={() => { setPlanPreview(null); onChange("fileUrl")({ target: { value: "" } }) }} 
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <X size={14} color={C.red} />
              </button>
            </div>
          )}
        </div>
        {planPreview && formData.fileType === "image" && (
          <img src={planPreview} alt="Plan" style={{ marginTop: 10, maxWidth: "100%", maxHeight: 200, borderRadius: 8, border: "1px solid #e5e7eb" }} />
        )}
      </FormField>
      
      {[
        ["objectifs","Objectifs"],
        ["competences","Competences visees"],
        ["materiel","Materiel necessaire"],
        ["organisation","Organisation"],
        ["deroulement","Deroulement detaille"],
        ["differenciation","Differenciation"]
      ].map(([k,l]) => (
        <FormField key={k} label={l}>
          <TA value={formData[k]} onChange={onChange(k)} onBlur={handleBlur(k)} />
        </FormField>
      ))}
      
      <FormField label="Reglement / Consignes de securite">
        <TA value={formData.reglement || ""} onChange={onChange("reglement")} onBlur={handleBlur("reglement")} placeholder="Regles du jeu, consignes de securite..." />
      </FormField>
      
      {isEdit && formData.published && (
        <FormField label="Visibilite de la publication">
          <Sel value={formData.visibility || "commun"} onChange={onChange("visibility")} 
            options={VISIBILITIES.map(v => ({ value: v.value, label: v.label }))} />
        </FormField>
      )}
      
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 6 }}>
        <Btn outline color={C.gray} onClick={onCancel}>Annuler</Btn>
        <Btn color={C.blue} onClick={onSave} disabled={!formData.titre || !formData.discipline}>{btnLabel}</Btn>
      </div>
    </>
  )
}

export function PagePreparations({ preps, setPreps, communityPreps = [], toast, user, addPoints, toggleLikePrep, isPrepLiked, savePreparation, deletePreparation }: {
  preps: Preparation[]; setPreps: React.Dispatch<React.SetStateAction<Preparation[]>>;
  communityPreps?: Preparation[];
  toast: (m: string) => void; user: User; addPoints: (p: number, r: string) => void;
  toggleLikePrep: (id: string | number) => void; isPrepLiked: (id: string | number) => boolean;
  savePreparation?: (prep: Preparation) => Promise<boolean>;
  deletePreparation?: (id: string | number) => Promise<void>;
}) {
  const [tab, setTab] = useState("mes")
  const [modal, setModal] = useState(false)
  const [editModal, setEditModal] = useState<Preparation | null>(null)
  const [viewModal, setViewModal] = useState<Preparation | null>(null)
  const [confirmDel, setConfirmDel] = useState<number | string | null>(null)
  const [docPreview, setDocPreview] = useState<{ url: string; name: string; type: string } | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [publishModal, setPublishModal] = useState<Preparation | null>(null)
  const importRef = useRef<HTMLInputElement>(null)
  
  // Filters
  const [filterDiscipline, setFilterDiscipline] = useState("")
  const [filterCategory, setFilterCategory] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [filterSort, setFilterSort] = useState("recent")
  
  const blank = { 
    titre: "", discipline: "", classe: "", duree: "60", objectifs: "", competences: "", 
    materiel: "", organisation: "", deroulement: "", differenciation: "", 
    category: "", location: "", reglement: "", visibility: "commun", fileUrl: "", fileName: "", fileType: ""
  }
  const [form, setForm] = useState(blank)
  const [editForm, setEditForm] = useState(blank)
  const [publishVisibility, setPublishVisibility] = useState("commun")
  const f = (k: string) => (e: any) => setForm(v => ({ ...v, [k]: e.target.value }))
  const ef = (k: string) => (e: any) => setEditForm(v => ({ ...v, [k]: e.target.value }))

  // Toggle like handler (simplified - uses original system)
  const handleLike = (prepId: string | number) => {
    toggleLikePrep(prepId)
    const isNowLiked = !isPrepLiked(prepId)
    toast(isNowLiked ? "Ajoute aux favoris" : "Retire des favoris")
  }

  const save = async () => {
    const correctedForm = {
      ...form,
      titre: correctText(form.titre),
      objectifs: correctText(form.objectifs),
      deroulement: correctText(form.deroulement),
      reglement: correctText(form.reglement || ""),
    }
    
    const newPrep: Preparation = {
      id: `new_${Date.now()}`,
      ...correctedForm,
      competences: "", organisation: "", differenciation: "",
      published: false, liked: false, date: new Date().toLocaleDateString("fr-FR"),
      auteur: user.name, auteurId: user.id, isTeacher: user.isTeacher, visibility: "commun", score: 0, fileUrl: form.fileUrl, fileType: form.fileType
    } as any;
    
    // Save to Supabase
    if (savePreparation) {
      const success = await savePreparation(newPrep)
      if (!success) {
        toast("Erreur lors de la sauvegarde. Reessayez.")
        return
      }
    } else {
      setPreps(p => [...p, newPrep]);
    }
    
    addPoints(20, "creation");
    setModal(false);
    toast("Preparation enregistree !");
    setForm({ titre: "", discipline: "", classe: "", duree: "", objectifs: "", materiel: "", deroulement: "", category: "", location: "", reglement: "", fileUrl: "", fileType: "" })
  }
  
  const saveEdit = async () => { 
    const correctedForm = {
      ...editForm,
      titre: correctText(editForm.titre),
      objectifs: correctText(editForm.objectifs),
      deroulement: correctText(editForm.deroulement),
      reglement: correctText(editForm.reglement || ""),
    }
    const updatedPrep = { ...editModal!, ...correctedForm } as Preparation
    if (savePreparation) {
      const success = await savePreparation(updatedPrep)
      if (!success) {
        toast("Erreur lors de la modification. Reessayez.")
        return
      }
    } else {
      setPreps(ps => ps.map(x => x.id === editModal!.id ? updatedPrep : x))
    }
    setEditModal(null); 
    toast("Preparation modifiee !") 
  }
  
  const handlePublish = async (id: number | string) => {
    const p = preps.find(x => x.id === id)
    if (!p) return
    if (!p.published) {
      setPublishModal(p)
    } else {
      const updatedPrep = { ...p, published: false }
      if (savePreparation) {
        await savePreparation(updatedPrep)
      } else {
        setPreps(ps => ps.map(x => x.id === id ? updatedPrep : x))
      }
      toast("Preparation depubliee")
    }
  }
  
  const confirmPublish = async () => {
    if (!publishModal) return
    addPoints(25, "publish")
    const updatedPrep = { ...publishModal, published: true, visibility: publishVisibility as any }
    if (savePreparation) {
      await savePreparation(updatedPrep)
    } else {
      setPreps(ps => ps.map(x => x.id === publishModal.id ? updatedPrep : x))
    }
    setPublishModal(null)
    setPublishVisibility("commun")
    toast("Preparation publiee !")
  }
  
  const del = async (id: number | string) => { 
    if (deletePreparation) {
      await deletePreparation(id)
    } else {
      setPreps(ps => ps.filter(x => x.id !== id))
    }
    toast("Supprime.") 
  }

  // Check if user can edit/delete (author only)
  const canEdit = (p: Preparation): boolean => {
    return p.auteurId === user.id || p.auteur === user.name || !String(p.id).startsWith("cp")
  }


    const tabs = [
    { id: "mes", l: "Mes preparations" }, 
    { id: "pub", l: "Publiees" }, 
    { id: "likes", l: "Mes favoris" }
  ]
  
  // Filter preps based on user role for visibility
  const filterByVisibility = (p: Preparation): boolean => {
    if (!p.published) return true
    if (!p.visibility || p.visibility === "commun") return true
    if (p.visibility === "prof" && user.isTeacher) return true
    if (p.visibility === "eleve" && !user.isTeacher) return true
    return p.auteur === user.name || p.auteurId === user.id
  }
  
  const mesList = preps.filter(filterByVisibility)
  const pubList = [...preps.filter(p => p.published && filterByVisibility(p)), ...communityPreps.filter(filterByVisibility)]
  const likesList = [...preps.filter(p => isPrepLiked(p.id)), ...communityPreps.filter(cp => isPrepLiked(cp.id))]
  
  // Apply filters
  const applyFilters = (list: Preparation[]): Preparation[] => {
    let filtered = list
    if (filterDiscipline) filtered = filtered.filter(p => p.discipline === filterDiscipline)
    if (filterCategory) filtered = filtered.filter(p => p.category === filterCategory)
    if (filterLocation) filtered = filtered.filter(p => p.location === filterLocation)
    
    // Sort
    if (filterSort === "recent") {
      filtered = [...filtered].sort((a, b) => new Date(b.date.split("/").reverse().join("-")).getTime() - new Date(a.date.split("/").reverse().join("-")).getTime())
    } else if (filterSort === "alpha") {
      filtered = [...filtered].sort((a, b) => a.titre.localeCompare(b.titre))
    }
    
    return filtered
  }
  
  const list = applyFilters(tab === "mes" ? mesList : tab === "pub" ? pubList : likesList)

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
            <BookOpen size={24} color={C.blue} /> Preparations
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 14, color: C.gray }}>Creez, importez et partagez vos preparations</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input ref={importRef} type="file" accept=".json,.txt,.pdf,.doc,.docx,image/*" style={{ display: "none" }} onChange={handleImport} />
          <Btn outline color={C.blue} onClick={() => importRef.current?.click()}>
            <Upload size={14} color={C.blue} /> Importer
          </Btn>
          <Btn color={C.blue} onClick={() => setModal(true)}>
            <Plus size={14} color="white" /> Nouvelle preparation
          </Btn>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", background: "#f1f5f9", borderRadius: 12, padding: 4, marginBottom: 16, gap: 3 }}>
        {tabs.map(t => {
          const cnt = t.id === "mes" ? mesList.length : t.id === "pub" ? pubList.length : likesList.length
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer", background: tab === t.id ? "white" : "transparent", color: tab === t.id ? C.dark : C.gray, fontWeight: tab === t.id ? 700 : 500, fontSize: 14, fontFamily: "inherit", transition: "all .15s" }}>
              {t.l} <span style={{ background: tab === t.id ? C.blue : "#e5e7eb", color: tab === t.id ? "white" : C.gray, borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <Card style={{ padding: "12px 16px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14, color: C.dark, fontFamily: "inherit" }}>
            <Filter size={16} color={C.blue} /> Filtres {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {(filterDiscipline || filterCategory || filterLocation) && (
            <button onClick={() => { setFilterDiscipline(""); setFilterCategory(""); setFilterLocation("") }} 
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.red, fontFamily: "inherit" }}>
              Effacer les filtres
            </button>
          )}
        </div>
        {showFilters && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4, display: "block" }}>Discipline</label>
              <select value={filterDiscipline} onChange={e => setFilterDiscipline(e.target.value)} 
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
                <option value="">Toutes</option>
                {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4, display: "block" }}>Categorie</label>
              <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} 
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
                <option value="">Toutes</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4, display: "block" }}>Lieu</label>
              <select value={filterLocation} onChange={e => setFilterLocation(e.target.value)} 
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
                <option value="">Tous</option>
                {LOCATIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.gray, marginBottom: 4, display: "block" }}>Trier par</label>
              <select value={filterSort} onChange={e => setFilterSort(e.target.value)} 
                style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, fontFamily: "inherit" }}>
                <option value="recent">Plus recents</option>
                <option value="score">Meilleur score</option>
                <option value="alpha">Alphabetique</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      <Card>
        {list.length === 0
          ? <EmptyState icon="book" title={tab === "likes" ? "Aucun vote" : "Aucune preparation"} subtitle={tab === "mes" ? "Creez ou importez votre premiere preparation" : "Aucune preparation trouvee"} cta={tab === "mes" ? <Btn color={C.blue} onClick={() => setModal(true)}><Plus size={14} color="white" /> Creer</Btn> : undefined} />
          : list.map((p, idx) => {
              const isCommunity = String(p.id).startsWith("cp")
              const liked = isPrepLiked(p.id)
              const hasFile = !!(p as any).fileUrl
              const locationLabel = LOCATIONS.find(l => l.value === p.location)?.label
              const isAuthor = canEdit(p)
              
              return (
                <div key={`${p.id}-${idx}`} style={{ padding: "14px 20px", borderBottom: idx < list.length - 1 ? "1px solid #f3f4f6" : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                  <div style={{ flex: 1, cursor: "pointer" }} onClick={() => setViewModal(p)}>
                    {(tab === "pub" || p.published) && (
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <div style={{ width: 22, height: 22, borderRadius: "50%", background: p.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 10, fontWeight: 800 }}>{(p.auteur || "?")[0]?.toUpperCase()}</div>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.dark }}>{p.auteur}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "1px 8px", borderRadius: 20, background: p.isTeacher ? C.tealLight : C.blueLight, color: p.isTeacher ? C.teal : C.blue }}>{p.isTeacher ? "Enseignant" : "Etudiant"}</span>
                        {p.visibility && p.visibility !== "commun" && (
                          <Tag color={p.visibility === "prof" ? C.teal : C.blue}>
                            {p.visibility === "prof" ? "Enseignants" : "Etudiants"}
                          </Tag>
                        )}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700, fontSize: 14.5, color: C.dark }}>{p.titre}</div>
                      <Tag color={p.published ? C.green : "#9ca3af"}>{p.published ? "Publie" : p.imported ? "Importe" : "Brouillon"}</Tag>
                      {p.category && <Tag color={C.orange}>{p.category}</Tag>}
                      {locationLabel && <Tag color="#64748b">{locationLabel}</Tag>}
                      {hasFile && <Tag color={C.orange} bg={C.orangeLight}><File size={10} /> {(p as any).fileType === "pdf" ? "PDF" : (p as any).fileType === "image" ? "Image" : "Word"}</Tag>}
                    </div>
                    <div style={{ fontSize: 12.5, color: C.gray, marginTop: 4 }}>{p.discipline}{p.classe && ` - ${p.classe}`} - {p.duree}min - {p.date}</div>
                  </div>
                  
                  {/* Like button */}
                  <button onClick={(e) => { e.stopPropagation(); handleLike(p.id) }}
                    style={{ width: 32, height: 32, borderRadius: 8, border: liked ? `2px solid ${C.red}` : "1px solid #e5e7eb", background: liked ? "#fef2f2" : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 8 }} title={liked ? "Retirer des favoris" : "Ajouter aux favoris"}>
                    <ThumbsUp size={14} color={liked ? C.red : C.gray} fill={liked ? C.red : "none"} />
                  </button>
                  
                  <div style={{ display: "flex", gap: 6 }}>
                    {hasFile && (
                      <button onClick={() => setDocPreview({ url: (p as any).fileUrl, name: (p as any).fileName, type: (p as any).fileType })} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: C.orangeLight, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Visualiser le document">
                        <FileText size={14} color={C.orange} />
                      </button>
                    )}
                    <button onClick={() => setViewModal(p)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Eye size={14} color={C.gray} />
                    </button>
                    {isAuthor && !isCommunity && (
                      <>
                        <button onClick={() => { setEditForm({ ...p } as any); setEditModal(p) }} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Pencil size={14} color={C.blue} /></button>
                        <button onClick={() => handlePublish(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e5e7eb", background: p.published ? C.greenLight : "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title={p.published ? "Depublier" : "Publier"}><Check size={14} color={p.published ? C.green : C.gray} strokeWidth={2.5} /></button>
                        <button onClick={() => setConfirmDel(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #fee2e2", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={14} color={C.red} /></button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
      </Card>

      {/* Create modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nouvelle preparation" width={620}>
        <PrepForm formData={form} onChange={f} onSave={save} onCancel={() => setModal(false)} btnLabel="Creer la preparation" />
      </Modal>
      
      {/* Edit modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Modifier la preparation" width={620}>
        <PrepForm formData={editForm} onChange={ef} onSave={saveEdit} onCancel={() => setEditModal(null)} btnLabel="Sauvegarder" isEdit />
      </Modal>
      
      {/* Publish modal */}
      <Modal open={!!publishModal} onClose={() => setPublishModal(null)} title="Publier la preparation" width={420}>
        <p style={{ fontSize: 14, color: C.gray, marginBottom: 16 }}>Choisissez qui peut voir cette preparation :</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {VISIBILITIES.map(v => (
            <label key={v.value} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, border: `2px solid ${publishVisibility === v.value ? C.blue : "#e5e7eb"}`, cursor: "pointer", background: publishVisibility === v.value ? C.blueLight : "white" }}>
              <input type="radio" name="visibility" value={v.value} checked={publishVisibility === v.value} onChange={e => setPublishVisibility(e.target.value)} style={{ accentColor: C.blue }} />
              <span style={{ fontWeight: 600, color: C.dark }}>{v.label}</span>
            </label>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <Btn outline color={C.gray} onClick={() => setPublishModal(null)}>Annuler</Btn>
          <Btn color={C.green} onClick={confirmPublish}><Check size={14} color="white" /> Publier</Btn>
        </div>
      </Modal>
      
      {/* View modal */}
      {viewModal && (
        <Modal open={true} onClose={() => setViewModal(null)} title={viewModal.titre} subtitle={[viewModal.discipline, viewModal.classe, viewModal.duree ? viewModal.duree + "min" : null].filter(Boolean).join(" - ")} width={650}>
          {viewModal.auteur && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "10px 14px", background: viewModal.isTeacher ? C.tealLight : C.blueLight, borderRadius: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: viewModal.isTeacher ? C.teal : C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 11, fontWeight: 800 }}>{(viewModal.auteur)[0]?.toUpperCase()}</div>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{viewModal.auteur}</span>
              <Tag color={viewModal.isTeacher ? C.teal : C.blue}>{viewModal.isTeacher ? "Enseignant" : "Etudiant"}</Tag>
              {viewModal.category && <Tag color={C.orange}>{viewModal.category}</Tag>}
              {viewModal.location && <Tag color="#64748b">{LOCATIONS.find(l => l.value === viewModal.location)?.label}</Tag>}
            </div>
          )}
          
          {/* Plan preview */}
          {(viewModal as any).fileUrl && (viewModal as any).fileType === "image" && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Plan / Schema</div>
              <img src={(viewModal as any).fileUrl} alt="Plan" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 10, border: "1px solid #e5e7eb" }} />
            </div>
          )}
          {(viewModal as any).fileUrl && (viewModal as any).fileType === "pdf" && (
            <div style={{ marginBottom: 16, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FileText size={16} color={C.orange} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{(viewModal as any).fileName}</span>
                </div>
                <a href={(viewModal as any).fileUrl} download={(viewModal as any).fileName} style={{ fontSize: 12, color: C.blue, fontWeight: 600, textDecoration: "none" }}>Telecharger</a>
              </div>
              <iframe src={(viewModal as any).fileUrl} style={{ width: "100%", height: 300, border: "none" }} title="Document preview" />
            </div>
          )}
          
          {[["Objectifs", viewModal.objectifs], ["Competences", viewModal.competences], ["Materiel", viewModal.materiel], ["Organisation", viewModal.organisation], ["Deroulement", viewModal.deroulement], ["Differenciation", viewModal.differenciation]].map(([l, v]) =>
            v ? <div key={l} style={{ marginBottom: 14 }}><div style={{ fontSize: 13, fontWeight: 700, marginBottom: 5 }}>{l}</div><div style={{ fontSize: 14, lineHeight: 1.7, background: "#f9fafb", borderRadius: 9, padding: "10px 14px", whiteSpace: "pre-wrap" }}>{v}</div></div> : null
          )}
          
          {/* Reglement */}
          {viewModal.reglement && (
            <div style={{ marginBottom: 14, padding: "12px 16px", background: "#fef3c7", borderRadius: 10, border: "1px solid #fcd34d" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <AlertCircle size={16} color="#d97706" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>Reglement / Securite</span>
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: "#78350f", whiteSpace: "pre-wrap" }}>{viewModal.reglement}</div>
            </div>
          )}
          
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn outline color={C.gray} onClick={() => setViewModal(null)}>Fermer</Btn>
          </div>
        </Modal>
      )}

      {/* Document preview modal */}
      {docPreview && (
        <div onClick={() => setDocPreview(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 400, backdropFilter: "blur(3px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "white", borderRadius: 16, width: "90%", maxWidth: 900, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={20} color={C.orange} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>{docPreview.name}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <a href={docPreview.url} download={docPreview.name} style={{ padding: "6px 14px", background: C.blue, color: "white", borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>Telecharger</a>
                <button onClick={() => setDocPreview(null)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.gray} /></button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
              {docPreview.type === "pdf" && <iframe src={docPreview.url} style={{ width: "100%", height: 600, border: "none" }} title="PDF preview" />}
              {docPreview.type === "image" && <img src={docPreview.url} alt="Preview" style={{ maxWidth: "100%", margin: "0 auto", display: "block" }} />}
              {docPreview.type === "word" && (
                <div style={{ padding: 40, textAlign: "center", color: C.gray }}>
                  <File size={60} color="#d1d5db" />
                  <p style={{ marginTop: 16, fontSize: 14 }}>Telechargez le fichier pour le visualiser.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal open={!!confirmDel} title="Supprimer la preparation" msg="Cette action est irreversible." onConfirm={() => del(confirmDel!)} onClose={() => setConfirmDel(null)} />
    </div>
  )
}
