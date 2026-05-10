"use client"

import React, { useState, useRef, useEffect } from "react"
import { C } from "@/lib/colors"
import { Logo, Icon } from "@/components/ui-atoms"
import type { User } from "@/lib/types"
import { ChevronDown, User as UserIcon, LogOut, Shield } from "lucide-react"

const NAV = [
  { id: "accueil", label: "Accueil", icon: "home", color: C.blue },
  { id: "preparations", label: "Preparations", icon: "book", color: C.blue },
  { id: "cycles", label: "Cycles", icon: "calendar", color: C.green },
  { id: "journal", label: "Journal", icon: "doc", color: C.blue },
  { id: "ia", label: "IA", icon: "sparkles", color: C.orange },
  { id: "forum", label: "Forum", icon: "chat", color: C.purple },
  { id: "ecole", label: "Ecole", icon: "school", color: C.orange },
  { id: "innovations", label: "Innovations", icon: "lightbulb", color: C.amber },
  { id: "admin", label: "Admin", icon: "lightbulb", color: C.amber },
]


const ADMIN_NAV = { id: "admin", label: "Admin Panel", icon: "shield", color: C.red }

// Check if user has admin or moderator access
const hasAdminAccess = (user: User) => user.isAdmin || user.isModerator || user.role === 'admin' || user.role === 'moderator'

export function DashboardNav({ page, setPage, user, onLogout }: { page: string; setPage: (p: string) => void; user: User; onLogout: () => void }) {
  const [showMenu, setShowMenu] = useState(false)
  const [dashMobile, setDashMobile] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  return (
    <nav style={{ display: "flex", alignItems: "center", padding: "0 24px", height: 56, borderBottom: "1px solid #e5e7eb", background: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <div style={{ cursor: "pointer", marginRight: 20 }} onClick={() => setPage("accueil")}>
        <Logo size={30} fs={16} />
      </div>

      <div className="dash-nav-items">
        {NAV.map(n => {
          const active = page === n.id
          return (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
                borderRadius: 9, border: "none", cursor: "pointer",
                background: active ? n.color : "transparent",
                color: active ? "white" : "#374151",
                fontWeight: active ? 700 : 500, fontSize: 13, fontFamily: "inherit",
                transition: "all .15s"
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f4f6" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
              <Icon name={n.icon} size={13} color={active ? "white" : "#6b7280"} />
              {n.label}
            </button>
          )
        })}
        {hasAdminAccess(user) && (
          <button onClick={() => setPage(ADMIN_NAV.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
              borderRadius: 9, border: "none", cursor: "pointer",
              background: page === ADMIN_NAV.id ? ADMIN_NAV.color : "transparent",
              color: page === ADMIN_NAV.id ? "white" : "#374151",
              fontWeight: page === ADMIN_NAV.id ? 700 : 500, fontSize: 13, fontFamily: "inherit",
              transition: "all .15s"
            }}
            onMouseEnter={e => { if (page !== ADMIN_NAV.id) e.currentTarget.style.background = "#fef2f2" }}
            onMouseLeave={e => { if (page !== ADMIN_NAV.id) e.currentTarget.style.background = "transparent" }}>
            <Shield size={13} color={page === ADMIN_NAV.id ? "white" : C.red} />
            {ADMIN_NAV.label}
          </button>
        )}
      </div>

      <button className="dash-hamburger" onClick={() => setDashMobile(!dashMobile)} aria-label="Menu">
        <span /><span /><span />
      </button>

      <div className={"dash-mobile-nav" + (dashMobile ? " open" : "")}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => { setPage(n.id); setDashMobile(false) }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 9, border: "none", cursor: "pointer",
              background: page === n.id ? n.color : "transparent",
              color: page === n.id ? "white" : "#374151",
              fontWeight: page === n.id ? 700 : 500, fontSize: 14, fontFamily: "inherit",
              width: "100%", textAlign: "left"
            }}>
            <Icon name={n.icon} size={14} color={page === n.id ? "white" : "#6b7280"} />
            {n.label}
          </button>
        ))}
        {hasAdminAccess(user) && (
          <button onClick={() => { setPage(ADMIN_NAV.id); setDashMobile(false) }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: 9, border: "none", cursor: "pointer",
              background: page === ADMIN_NAV.id ? ADMIN_NAV.color : "transparent",
              color: page === ADMIN_NAV.id ? "white" : C.red,
              fontWeight: page === ADMIN_NAV.id ? 700 : 500, fontSize: 14, fontFamily: "inherit",
              width: "100%", textAlign: "left"
            }}>
            <Shield size={14} color={page === ADMIN_NAV.id ? "white" : C.red} />
            {ADMIN_NAV.label}
          </button>
        )}
      </div>

      <div ref={menuRef} style={{ position: "relative", marginLeft: "auto" }}>
        <div onClick={() => setShowMenu(!showMenu)}
          style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "6px 10px", borderRadius: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: user.avatarUrl ? "transparent" : user.avatarColor,
            overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: 800, fontSize: 13, boxShadow: "0 2px 6px rgba(0,0,0,0.15)"
          }}>
            {user.avatarUrl
              ? <img src={user.avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
              : user.name[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
            {"Niv."}{user.niveau}{" - "}{user.points}{"pts"}
          </span>
          <ChevronDown size={12} color={C.gray} />
        </div>

        {showMenu && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "white", borderRadius: 14, border: "1px solid #e5e7eb", boxShadow: "0 12px 32px rgba(0,0,0,0.12)", minWidth: 180, padding: "8px 0", zIndex: 200 }}>
            <button onClick={() => { setPage("profil"); setShowMenu(false) }}
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: "#374151", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <UserIcon size={15} color={C.gray} /> Mon profil
            </button>
            <div style={{ height: 1, background: "#f1f5f9", margin: "4px 0" }} />
            <button onClick={onLogout}
              style={{ width: "100%", textAlign: "left", padding: "10px 16px", border: "none", background: "none", cursor: "pointer", fontSize: 14, color: C.red, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 10 }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fef2f2")}
              onMouseLeave={e => (e.currentTarget.style.background = "none")}>
              <LogOut size={15} color={C.red} /> Se deconnecter
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
