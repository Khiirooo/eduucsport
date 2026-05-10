"use client"
import React, { useState, useRef } from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Modal, Inp, TA, Sel, FormField, Icon, Tag } from "@/components/ui-atoms"
import { BookOpen, Calendar, FileText, Camera, Pencil, LogOut, User as UserIcon, TrendingUp, Lock, Award, School, Mail, Phone, MapPin, Briefcase } from "lucide-react"
import type { User, Preparation, Cycle, Seance, Ecole } from "@/lib/types"
import { BADGES_ALL, LEVELS } from "@/lib/types"
import { createClient } from "@/lib/supabase/client"

/* Convert file to base64 data URL for avatar persistence */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function PageProfil({ user, setUser, toast, onLogout, preps, cycles, seances, ecoles, isPrepLiked }: {
  user: User; setUser: React.Dispatch<React.SetStateAction<User | null>>;
  toast: (m: string) => void; onLogout: () => void;
  preps: Preparation[]; cycles: Cycle[]; seances: Seance[]; ecoles: Ecole[];
  isPrepLiked?: (id: string | number) => boolean;
}) {
  const [editModal, setEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: user.name, email: user.email, phone: user.phone || "", city: user.city || "",
    bio: user.bio || "", department: user.department || "", experience: user.experience || "",
    specialite: user.specialite || "", anneeEtude: user.anneeEtude || "",
    maitreDuStage: user.maitreDuStage || "", ecoleStage: user.ecoleStage || "",
    isTeacher: user.isTeacher,
  })
  const avatarRef = useRef<HTMLInputElement>(null)

  const currentLevel = LEVELS.find(l => l.level === user.niveau) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === user.niveau + 1)
  const ptsForNextLevel = currentLevel.pts
  const ptsRemaining = ptsForNextLevel - user.points
  const progressPct = Math.min(100, (user.points / ptsForNextLevel) * 100)
  const unlockedCount = (user.unlockedBadges || []).length

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      // Upload via API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        setUser(u => u ? { ...u, avatarUrl: url } : u)
        // Persist to Supabase profile
        if (user.id) {
          const supabase = createClient()
          await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
        }
        toast("Photo de profil mise a jour !")
      } else {
        // Fallback to base64 if upload fails
        const dataUrl = await fileToDataUrl(file)
        setUser(u => u ? { ...u, avatarUrl: dataUrl } : u)
        toast("Photo de profil mise a jour (stockage local).")
      }
    } catch { toast("Erreur lors du chargement de la photo.") }
    e.target.value = ""
  }

  const saveProfile = async () => {
    const roleChanged = editData.isTeacher !== user.isTeacher
    const newStatus = editData.isTeacher ? "Enseignant" : "Etudiant"
    const newStatusFull = editData.isTeacher ? "Enseignant en EPS" : "Etudiant en EPS"
    
    // Persist to Supabase
    if (user.id) {
      try {
        const supabase = createClient()
        await supabase.from('profiles').update({
          first_name: (editData.name || '').split(' ')[0] || '',
          last_name: (editData.name || '').split(' ').slice(1).join(' ') || '',
          phone: editData.phone,
          city: editData.city,
          bio: editData.bio,
          department: editData.department,
          experience: editData.experience,
          specialite: editData.specialite,
          annee_etude: editData.anneeEtude,
          maitre_du_stage: editData.maitreDuStage,
          ecole_stage: editData.ecoleStage,
        }).eq('id', user.id)
      } catch (err) {
        console.error('Error updating profile:', err)
      }
    }

    setUser(u => u ? {
      ...u, ...editData,
      status: newStatus,
      statusFull: newStatusFull,
    } : u)
    setEditModal(false)
    toast(roleChanged ? `Profil mis a jour ! Role change en ${newStatus}.` : "Profil mis a jour !")
  }

  const publishedCount = preps.filter(p => p.published).length
  const linkedCount = cycles.reduce((acc, c) => acc + (c.prepsLiees || []).length, 0)
  const likedCount = isPrepLiked ? preps.filter(p => isPrepLiked(p.id)).length : 0
  const journalNotesCount = ecoles.reduce((acc, e) => acc + (e.journal || []).length, 0)

  // Stats cards
  const stats = [
    { icon: <BookOpen size={20} color={C.blue} />, bg: C.blueLight, value: preps.length, label: "Preparations" },
    { icon: <Calendar size={20} color={C.orange} />, bg: C.orangeLight, value: cycles.length, label: "Cycles" },
    { icon: <FileText size={20} color={C.teal} />, bg: C.tealLight, value: seances.length, label: "Seances" },
    { icon: <School size={20} color={C.red} />, bg: C.redLight, value: ecoles.length, label: "Ecoles" },
  ]

  /* Info fields for display */
  const infoFields = [
    { icon: <Mail size={14} color={C.blue} />, label: "Email", value: user.email },
    { icon: <Phone size={14} color={C.green} />, label: "Telephone", value: user.phone },
    { icon: <MapPin size={14} color={C.orange} />, label: "Ville", value: user.city },
    ...(user.isTeacher ? [
      { icon: <Briefcase size={14} color={C.teal} />, label: "Departement", value: user.department },
      { icon: <Briefcase size={14} color={C.blue} />, label: "Experience", value: user.experience },
    ] : [
      { icon: <BookOpen size={14} color={C.teal} />, label: "Specialite", value: user.specialite },
      { icon: <Calendar size={14} color={C.blue} />, label: "Annee d'etude", value: user.anneeEtude },
      { icon: <UserIcon size={14} color={C.green} />, label: "Maitre de stage", value: user.maitreDuStage },
      { icon: <School size={14} color={C.orange} />, label: "Ecole de stage", value: user.ecoleStage },
    ]),
  ]

  return (
    <div>
      <h1 style={{ margin: "0 0 20px", fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
        <UserIcon size={24} color={C.dark} /> Mon profil
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 20, alignItems: "start" }}>
        {/* Left: Avatar + info + level */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 28, textAlign: "center" }}>
            {/* Avatar */}
            <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
              <div style={{
                width: 110, height: 110, borderRadius: "50%", background: user.avatarUrl ? "transparent" : user.avatarColor || C.green,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 44, fontWeight: 800, color: "white", overflow: "hidden",
                border: "4px solid white", boxShadow: "0 4px 14px rgba(0,0,0,0.1)"
              }}>
                {user.avatarUrl
                  ? <img src={user.avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
                  : user.name[0]?.toUpperCase()}
              </div>
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleAvatarChange} />
              <button onClick={() => avatarRef.current?.click()} style={{
                position: "absolute", bottom: 2, right: 2,
                width: 32, height: 32, borderRadius: "50%", background: "white", border: "2px solid #e5e7eb",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
              }}>
                <Camera size={14} color={C.gray} />
              </button>
            </div>

            {/* Name + status */}
            <div style={{ fontWeight: 800, fontSize: 18, color: C.dark, marginBottom: 2 }}>{user.name}</div>
            <div style={{ fontSize: 14, color: C.gray, marginBottom: 6 }}>{user.statusFull || user.status}</div>
            <Tag color={user.isTeacher ? C.teal : C.blue}>{user.isTeacher ? "Enseignant" : "Etudiant"}</Tag>

            {/* Edit button */}
            <div style={{ marginTop: 14 }}>
              <Btn outline color={C.blue} onClick={() => { setEditData({ name: user.name, email: user.email, phone: user.phone || "", city: user.city || "", bio: user.bio || "", department: user.department || "", experience: user.experience || "", specialite: user.specialite || "", anneeEtude: user.anneeEtude || "", maitreDuStage: user.maitreDuStage || "", ecoleStage: user.ecoleStage || "", isTeacher: user.isTeacher }); setEditModal(true) }} sm>
                <Pencil size={13} color={C.blue} /> Modifier le profil
              </Btn>
            </div>

            {/* Level progress */}
            <div style={{ marginTop: 28, textAlign: "left" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: C.dark }}>Niveau {user.niveau}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.gray }}>{user.points}/{ptsForNextLevel} pts</span>
              </div>
              <div style={{ height: 10, background: "#e5e7eb", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.green})`, borderRadius: 5, transition: "width .4s ease" }} />
              </div>
              <div style={{ fontSize: 12.5, color: C.gray, marginTop: 6 }}>{ptsRemaining > 0 ? `${ptsRemaining} points pour le prochain niveau` : "Niveau maximum atteint !"}</div>
            </div>
          </Card>

          {/* Personal info card */}
          <Card style={{ padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.dark }}>Informations personnelles</h3>
            {infoFields.map((field, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: i < infoFields.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                {field.icon}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600 }}>{field.label}</div>
                  <div style={{ fontSize: 13.5, color: field.value ? C.dark : "#d1d5db", fontWeight: field.value ? 500 : 400 }}>{field.value || "Non renseigne"}</div>
                </div>
              </div>
            ))}
            {user.bio && (
              <div style={{ marginTop: 12, padding: "10px 12px", background: "#f9fafb", borderRadius: 8, fontSize: 13.5, lineHeight: 1.6, color: C.dark }}>
                <div style={{ fontSize: 11.5, color: C.gray, fontWeight: 600, marginBottom: 4 }}>Bio</div>
                {user.bio}
              </div>
            )}
          </Card>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
            {stats.map((s, i) => (
              <Card key={i} style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, color: C.dark, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12.5, color: C.gray, fontWeight: 500 }}>{s.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Badges */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Award size={20} color={C.orange} />
              <span style={{ fontWeight: 800, fontSize: 17, color: C.dark }}>Badges ({unlockedCount}/{BADGES_ALL.length})</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
              {BADGES_ALL.slice(0, 10).map(b => {
                const unlocked = (user.unlockedBadges || []).includes(b.id)
                return (
                  <div key={b.id} style={{
                    padding: "14px 8px", borderRadius: 12, textAlign: "center",
                    border: unlocked ? `2px solid ${C.teal}30` : "1.5px solid #e5e7eb",
                    background: unlocked ? "#f0fdf4" : "#fafafa",
                    opacity: unlocked ? 1 : 0.6
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, margin: "0 auto 8px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: unlocked ? `${C.teal}15` : "#f3f4f6"
                    }}>
                      {unlocked
                        ? <Icon name={b.icon} size={20} color={C.teal} />
                        : <Lock size={18} color="#d1d5db" />}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: unlocked ? C.dark : C.gray, marginBottom: 2 }}>{b.label}</div>
                    <div style={{ fontSize: 10, color: C.gray, lineHeight: 1.3 }}>{b.desc}</div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Activity summary */}
          <Card style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <TrendingUp size={20} color={C.green} />
              <span style={{ fontWeight: 800, fontSize: 17, color: C.dark }}>{"Resume d'activite"}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { value: publishedCount, label: "publiee(s)", desc: "Preparations partagees avec la communaute", color: C.blue, bg: C.blueLight },
                { value: linkedCount, label: "liaison(s)", desc: "Preparations liees a des cycles", color: C.green, bg: C.greenLight },
                { value: likedCount, label: "like(s)", desc: "Preparations en favoris", color: "#7c3aed", bg: "#ede9fe" },
                { value: journalNotesCount, label: "note(s)", desc: "Notes dans les journaux reflexifs", color: C.orange, bg: C.orangeLight },
              ].map((item, i) => (
                <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: item.bg, border: `1px solid ${item.color}20` }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: item.color }}>{item.value} {item.label}</div>
                  <div style={{ fontSize: 13, color: item.color, opacity: 0.8, marginTop: 2 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal open={editModal} onClose={() => setEditModal(false)} title="Modifier le profil" width={560}>
        {/* Role switcher */}
        <FormField label="Role">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[{ val: false, label: "Etudiant", desc: "Etudiant en EPS", col: C.blue }, { val: true, label: "Enseignant", desc: "Enseignant en EPS", col: C.teal }].map(r => (
              <button key={r.label} onClick={() => setEditData(v => ({ ...v, isTeacher: r.val }))} style={{
                padding: "12px 16px", borderRadius: 10, border: `2px solid ${editData.isTeacher === r.val ? r.col : "#e5e7eb"}`,
                background: editData.isTeacher === r.val ? (r.val ? C.tealLight : C.blueLight) : "white",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all .15s",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: editData.isTeacher === r.val ? r.col : C.dark }}>{r.label}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{r.desc}</div>
              </button>
            ))}
          </div>
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Nom" req><Inp value={editData.name} onChange={e => setEditData(v => ({ ...v, name: e.target.value }))} /></FormField>
          <FormField label="Email"><Inp value={editData.email} onChange={e => setEditData(v => ({ ...v, email: e.target.value }))} type="email" /></FormField>
          <FormField label="Telephone"><Inp value={editData.phone} onChange={e => setEditData(v => ({ ...v, phone: e.target.value }))} /></FormField>
          <FormField label="Ville"><Inp value={editData.city} onChange={e => setEditData(v => ({ ...v, city: e.target.value }))} /></FormField>
        </div>
        <FormField label="Bio"><TA value={editData.bio} onChange={e => setEditData(v => ({ ...v, bio: e.target.value }))} /></FormField>
        {editData.isTeacher ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Departement"><Inp value={editData.department} onChange={e => setEditData(v => ({ ...v, department: e.target.value }))} /></FormField>
            <FormField label="Experience"><Inp value={editData.experience} onChange={e => setEditData(v => ({ ...v, experience: e.target.value }))} /></FormField>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormField label="Specialite"><Inp value={editData.specialite} onChange={e => setEditData(v => ({ ...v, specialite: e.target.value }))} /></FormField>
            <FormField label="Annee d'etude"><Inp value={editData.anneeEtude} onChange={e => setEditData(v => ({ ...v, anneeEtude: e.target.value }))} /></FormField>
            <FormField label="Maitre de stage"><Inp value={editData.maitreDuStage} onChange={e => setEditData(v => ({ ...v, maitreDuStage: e.target.value }))} /></FormField>
            <FormField label="Ecole de stage"><Inp value={editData.ecoleStage} onChange={e => setEditData(v => ({ ...v, ecoleStage: e.target.value }))} /></FormField>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 10 }}>
          <Btn outline color={C.gray} onClick={() => setEditModal(false)}>Annuler</Btn>
          <Btn danger onClick={onLogout}><LogOut size={13} color="white" /> Deconnexion</Btn>
          <Btn color={C.blue} onClick={saveProfile}>Sauvegarder</Btn>
        </div>
      </Modal>
    </div>
  )
}
