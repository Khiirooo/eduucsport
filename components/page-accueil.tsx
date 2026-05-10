"use client"
import React from "react"
import { C } from "@/lib/colors"
import { Card, Btn, Tag, Icon } from "@/components/ui-atoms"
import { BookOpen, Calendar, GraduationCap, FileText, Trophy, TrendingUp } from "lucide-react"
import type { User, Preparation, Cycle, Ecole, Seance, JournalEntry } from "@/lib/types"
import { LEVELS } from "@/lib/types"

/* color helpers by item type */
const TYPE_COLORS: Record<string, { dot: string; bg: string; label: string }> = {
  seance:      { dot: C.blue,   bg: C.blueLight,   label: "Seance" },
  seancePrep:  { dot: C.green,  bg: "#d1fae5",     label: "Avec prepa" },
  observation: { dot: C.orange, bg: C.orangeLight,  label: "Observation" },
  reflexion:   { dot: "#7c3aed", bg: "#ede9fe",     label: "Reflexion" },
  feedback:    { dot: C.teal,   bg: C.tealLight,    label: "Feedback" },
  journal:     { dot: C.amber,  bg: C.amberLight,   label: "Journal" },
}

interface CalendarItem {
  id: string | number
  titre: string
  heure?: string
  type: string
  source: "seance" | "journal"
}

function classifySeance(s: Seance): string {
  if (s.prepLiee) return "seancePrep"
  if (s.observations) return "observation"
  return "seance"
}

function classifyJournal(j: JournalEntry): string {
  const t = (j.type || "").toLowerCase()
  if (t.includes("observation")) return "observation"
  if (t.includes("reflexion")) return "reflexion"
  if (t.includes("feedback")) return "feedback"
  return "journal"
}

export function PageAccueil({ user, setPage, preps, cycles, ecoles, seances }: { user: User; setPage: (p: string) => void; preps: Preparation[]; cycles: Cycle[]; ecoles: Ecole[]; seances: Seance[] }) {
  const today = new Date()
  const year = today.getFullYear(), month = today.getMonth()
  const monthNames = ["Janvier","Fevrier","Mars","Avril","Mai","Juin","Juillet","Aout","Septembre","Octobre","Novembre","Decembre"]
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = firstDay === 0 ? 6 : firstDay - 1
  const calCells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) calCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d)

  const nextLevel = LEVELS.find(l => l.level === user.niveau + 1) || { level: user.niveau + 1, pts: (user.niveau + 1) * 500, label: "Legende" }
  const ptsNext = nextLevel.pts
  const progress = Math.min(100, Math.round((user.points / ptsNext) * 100))

  const nextBadgeGoals = [
    { done: preps.length >= 1, label: "1ere prepa creee", icon: "book" },
    { done: preps.length >= 5, label: "5 preparations", icon: "book" },
    { done: cycles.length >= 1, label: "1er cycle cree", icon: "calendar" },
    { done: preps.filter(p => p.published).length >= 1, label: "1ere publi", icon: "check" },
  ]
  const nextBadge = nextBadgeGoals.find(g => !g.done)

  /* Build unified calendar items from seances + all ecole journals */
  const allJournalEntries: JournalEntry[] = ecoles.flatMap(e => (e.journal || []))

  const itemsByDate: Record<string, CalendarItem[]> = {}
  seances.forEach(s => {
    if (!s.date) return
    if (!itemsByDate[s.date]) itemsByDate[s.date] = []
    itemsByDate[s.date].push({ id: s.id, titre: s.titre, heure: s.heure, type: classifySeance(s), source: "seance" })
  })
  allJournalEntries.forEach(j => {
    if (!j.date) return
    if (!itemsByDate[j.date]) itemsByDate[j.date] = []
    itemsByDate[j.date].push({ id: j.id, titre: j.titre, type: classifyJournal(j), source: "journal" })
  })

  /* Week view: 7 days starting Monday of current week */
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1
  const mondayDate = new Date(today)
  mondayDate.setDate(today.getDate() - dayOfWeek)

  const weekDays: { date: Date; label: string; dateStr: string }[] = []
  const dayLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate)
    d.setDate(mondayDate.getDate() + i)
    weekDays.push({
      date: d,
      label: dayLabels[i],
      dateStr: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    })
  }

  /* Legend items for the week view */
  const usedTypes = new Set<string>()
  weekDays.forEach(wd => {
    (itemsByDate[wd.dateStr] || []).forEach(it => usedTypes.add(it.type))
  })

  return (
    <div>
      {/* Welcome banner */}
      <Card style={{ padding: "26px 32px", marginBottom: 20, background: "linear-gradient(135deg,#1d4ed8 0%,#16a34a 55%,#d97706 100%)", border: "none" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, color: "white" }}>{"Bonjour, "}{user.name}{" \uD83D\uDC4B"}</h1>
            <div style={{ display: "flex", gap: 10 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: "white" }}>
                {user.isTeacher ? "\uD83D\uDC68\u200D\uD83C\uDFEB" : "\uD83C\uDF93"} {user.status}
              </span>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 14px", fontSize: 13, fontWeight: 600, color: "white" }}>
                {"\uD83C\uDFC5 "}{user.badges}{" badges"}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ label: "Niveau", val: user.niveau, icon: Trophy }, { label: "Points", val: user.points, icon: TrendingUp }].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 14, padding: "12px 20px", textAlign: "center" }}>
                <s.icon size={17} color="rgba(255,255,255,0.85)" />
                <div style={{ fontSize: 26, fontWeight: 900, color: "white", marginTop: 4 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {[
          { label: "Preparations", val: preps.length, icon: BookOpen, bg: C.blueLight, ic: C.blue, page: "preparations" },
          { label: "Cycles", val: cycles.length, icon: Calendar, bg: C.greenLight, ic: C.green, page: "cycles" },
          { label: "Ecoles", val: ecoles.length, icon: GraduationCap, bg: C.orangeLight, ic: C.orange, page: "ecole" },
          { label: "Seances", val: seances.length, icon: FileText, bg: C.purpleLight, ic: C.purple, page: "journal" },
        ].map(s => (
          <Card key={s.label} hover onClick={() => setPage(s.page)} style={{ padding: "18px 20px", cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon size={20} color={s.ic} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.dark, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: C.gray, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Week overview - visual + color coded */}
      <Card style={{ padding: 22, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.dark, display: "flex", alignItems: "center", gap: 8 }}>
            <Calendar size={18} color={C.teal} /> {"Vue de la semaine"}
          </h3>
          <div style={{ display: "flex", gap: 12, fontSize: 11, color: C.gray, flexWrap: "wrap" }}>
            {Object.entries(TYPE_COLORS).filter(([k]) => usedTypes.has(k) || ["seance","seancePrep","journal"].includes(k)).map(([key, val]) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: val.dot, display: "inline-block" }} />
                {val.label}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
          {weekDays.map(wd => {
            const isToday = wd.date.toDateString() === today.toDateString()
            const dayItems = itemsByDate[wd.dateStr] || []
            const totalCount = dayItems.length
            return (
              <div key={wd.dateStr} onClick={() => setPage("journal")} style={{
                cursor: "pointer", borderRadius: 12, padding: "12px 8px",
                background: isToday ? "#eff6ff" : "#f9fafb",
                border: isToday ? `2px solid ${C.blue}` : "1px solid #e5e7eb",
                transition: "all .15s", minHeight: 120,
              }}>
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? C.blue : C.gray, textTransform: "uppercase", letterSpacing: "0.04em" }}>{wd.label}</div>
                  <div style={{ fontSize: 20, fontWeight: isToday ? 900 : 600, color: isToday ? C.blue : C.dark, marginTop: 2 }}>{wd.date.getDate()}</div>
                  {totalCount > 0 && (
                    <div style={{ fontSize: 10, color: C.gray, marginTop: 2 }}>{totalCount} elem.</div>
                  )}
                </div>
                {dayItems.length === 0 ? (
                  <div style={{ fontSize: 10.5, color: "#d1d5db", textAlign: "center", padding: "6px 0" }}>--</div>
                ) : (
                  dayItems.slice(0, 3).map(item => {
                    const tc = TYPE_COLORS[item.type] || TYPE_COLORS.seance
                    return (
                      <div key={`${item.source}-${item.id}`} style={{
                        background: tc.bg, color: tc.dot,
                        borderRadius: 6, padding: "3px 6px", fontSize: 10, fontWeight: 600,
                        marginBottom: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                        borderLeft: `3px solid ${tc.dot}`,
                      }}>
                        {item.heure ? item.heure + " " : ""}{item.titre}
                      </div>
                    )
                  })
                )}
                {dayItems.length > 3 && (
                  <div style={{ fontSize: 10, color: C.gray, textAlign: "center" }}>+{dayItems.length - 3} autre(s)</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Recent content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\uD83D\uDCCB Preparations recentes"}</h3>
            <button onClick={() => setPage("preparations")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{"Voir tout \u2192"}</button>
          </div>
          {preps.length === 0
            ? <p style={{ color: "#9ca3af", fontSize: 13.5, textAlign: "center", padding: "16px 0" }}>Aucune preparation</p>
            : preps.slice(0, 4).map(p => (
              <div key={p.id} style={{ padding: "8px 0", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{p.titre}</div>
                  <div style={{ fontSize: 12, color: C.gray }}>{p.discipline} {"\u2022"} {p.duree}min</div>
                </div>
                <Tag color={p.published ? C.green : C.gray}>{p.published ? "Publie" : "Brouillon"}</Tag>
              </div>
            ))}
        </Card>
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\uD83D\uDD04 Cycles recents"}</h3>
            <button onClick={() => setPage("cycles")} style={{ background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>{"Voir tout \u2192"}</button>
          </div>
          {cycles.length === 0
            ? <p style={{ color: "#9ca3af", fontSize: 13.5, textAlign: "center", padding: "16px 0" }}>Aucun cycle</p>
            : cycles.slice(0, 4).map(c => (
              <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.titre}</div>
                <div style={{ fontSize: 12, color: C.gray }}>{c.classe} {"\u2022"} {c.nbSeances} seances {"\u2022"} {(c.prepsLiees || []).length} prepa(s) liee(s)</div>
              </div>
            ))}
        </Card>
      </div>

      {/* Quick actions */}
      <Card style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{"\u26A1 Actions rapides"}</h3>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "Nouvelle preparation", c: C.blue, p: "preparations" },
            { label: "Nouveau cycle", c: C.green, p: "cycles" },
            { label: "Ajouter une seance", c: C.blue, p: "journal" },
            { label: "Demander a l'IA", c: C.orange, p: "ia" },
            { label: "Forum", c: C.purple, p: "forum" },
            { label: "Ajouter une ecole", c: C.orange, p: "ecole" },
          ].map(a => <Btn key={a.label} color={a.c} onClick={() => setPage(a.p)} sm>{a.label}</Btn>)}
        </div>
      </Card>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {/* Next objective */}
        <Card style={{ padding: 20 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>{"\uD83C\uDFAF Prochain objectif"}</h3>
          <div style={{ background: "linear-gradient(135deg,#f0f9ff,#e0fdf4)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: C.dark }}>{"\uD83C\uDFC6 Niveau " + nextLevel.level}</span>
              <span style={{ fontSize: 12, color: C.gray }}>{user.points + " / " + ptsNext + " pts"}</span>
            </div>
            <div style={{ background: "#e5e7eb", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div style={{ width: progress + "%", height: "100%", background: `linear-gradient(90deg,${C.teal},${C.blue})`, borderRadius: 99, transition: "width .4s ease" }} />
            </div>
            <div style={{ fontSize: 11.5, color: C.gray, marginTop: 6 }}>{progress + "% vers " + nextLevel.label}</div>
          </div>
          {nextBadge
            ? <div style={{ padding: "12px 14px", border: "1.5px dashed #d1d5db", borderRadius: 10 }}>
                <div style={{ fontSize: 11, color: C.gray, marginBottom: 4 }}>Prochain badge</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <Icon name={nextBadge.icon} size={20} color={C.blue} />
                  {nextBadge.label}
                </div>
              </div>
            : <div style={{ padding: "12px 14px", background: C.greenLight, borderRadius: 10, color: C.green, fontWeight: 700, fontSize: 13.5, textAlign: "center" }}>Tous les objectifs atteints !</div>}
        </Card>

        {/* Mini calendar - linked to journal + ecole journals */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\uD83D\uDCC6 " + monthNames[month] + " " + year}</h3>
            <button onClick={() => setPage("journal")} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{"Voir journal \u2192"}</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
            {["L","M","M","J","V","S","D"].map((d, i) => (
              <div key={i} style={{ fontSize: 10.5, fontWeight: 700, color: C.gray, paddingBottom: 4 }}>{d}</div>
            ))}
            {calCells.map((d, i) => {
              const dateStr = d ? `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}` : ""
              const dayItems = d ? (itemsByDate[dateStr] || []) : []
              const hasItems = dayItems.length > 0
              const isToday2 = d === today.getDate()
              /* pick dominant color for dot */
              const dominantType = dayItems.length > 0 ? dayItems[0].type : "seance"
              const dotColor = TYPE_COLORS[dominantType]?.dot || C.teal
              return (
                <div key={i} style={{
                  fontSize: 12.5, padding: "4px 2px", borderRadius: 6, position: "relative",
                  fontWeight: isToday2 ? 800 : 400,
                  background: isToday2 ? C.blue : "transparent",
                  color: isToday2 ? "white" : d ? C.dark : "transparent",
                  cursor: d ? "pointer" : "default",
                }} onClick={() => d && setPage("journal")}>
                  {d || ""}
                  {hasItems && !isToday2 && (
                    <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: dotColor }} />
                  )}
                  {hasItems && isToday2 && (
                    <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "white" }} />
                  )}
                </div>
              )
            })}
          </div>
        </Card>

        {/* Recent seances */}
        <Card style={{ padding: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{"\uD83D\uDCDD Dernieres seances"}</h3>
            <button onClick={() => setPage("journal")} style={{ background: "none", border: "none", color: C.blue, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>{"Tout voir \u2192"}</button>
          </div>
          {seances.length === 0
            ? <div style={{ textAlign: "center", padding: "20px 0", color: C.gray, fontSize: 13.5 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{"\uD83D\uDCC6"}</div>
                {"Aucune seance enregistree"}
                <br />
                <button onClick={() => setPage("journal")} style={{ marginTop: 10, background: "none", border: "none", color: C.blue, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>+ Ajouter une seance</button>
              </div>
            : [...seances].reverse().slice(0, 5).map((s) => {
              const sType = classifySeance(s)
              const tc = TYPE_COLORS[sType] || TYPE_COLORS.seance
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: tc.dot, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: C.dark }}>{s.titre || "Seance"}</div>
                    <div style={{ fontSize: 11.5, color: C.gray }}>{s.date || ""}{s.heure ? ` a ${s.heure}` : ""}{s.classe ? ` - ${s.classe}` : ""}</div>
                  </div>
                  {s.prepLiee && <Tag color={C.green} bg="#d1fae5">{s.prepLiee.titre}</Tag>}
                </div>
              )
            })}
        </Card>
      </div>
    </div>
  )
}
