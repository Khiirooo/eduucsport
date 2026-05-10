"use client"

import React, { useState, useRef, useEffect } from "react"
import { C } from "@/lib/colors"
import { Logo, Icon } from "@/components/ui-atoms"
import type { User } from "@/lib/types"
import { ChevronDown, User as UserIcon, LogOut, Shield } from "lucide-react"

// Navigation principale (jamais l'admin ici)
const NAV = [
  { id: "accueil", label: "Accueil", icon: "home", color: C.blue },
  { id: "preparations", label: "Préparations", icon: "book", color: C.blue },
  { id: "cycles", label: "Cycles", icon: "calendar", color: C.green },
  { id: "journal", label: "Journal", icon: "doc", color: C.blue },
  { id: "ia", label: "IA", icon: "sparkles", color: C.orange },
  { id: "forum", label: "Forum", icon: "chat", color: C.purple },
  { id: "ecole", label: "École", icon: "school", color: C.orange },
  { id: "innovations", label: "Innovations", icon: "lightbulb", color: C.amber },
]

const ADMIN_NAV = { id: "admin", label: "Admin Panel", icon: "shield", color: C.red }

// Vérification stricte des droits admin/modérateur
const hasAdminAccess = (user: User) =>
  user.isAdmin === true ||
  user.isModerator === true ||
  user.role === "admin" ||
  user.role === "moderator"

export function DashboardNav({ page, setPage, user, onLogout }: {
  page: string
  setPage: (p: string) => void
  user: User
  onLogout: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const adminAccess = hasAdminAccess(user)

  return (
    <nav style={{
      display: "flex", alignItems: "center", padding: "0 24px", height: 56,
      borderBottom: "1px solid #e5e7eb", background: "white", position: "sticky",
      top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
    }}>
      <div style={{ cursor: "pointer", marginRight: 20 }} onClick={() => setPage("accueil")}>
        <Logo size={30} fs={16} />
      </div>

      <div style={{ display: "flex", gap: 2, flex: 1, overflowX: "auto" }}>
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
                transition: "all .15s", whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#f3f4f6" }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent" }}>
              <Icon name={n.icon} size={13} color={active ? "white" : "#6b7280"} />
              {n.label}
            </button>
          )
        })}

        {/* Bouton Admin : visible UNIQUEMENT pour les admins/modérateurs */}
        {adminAccess && (
          <button onClick={() => setPage(ADMIN_NAV.id)}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 11px",
              borderRadius: 9, border: "none", cursor: "pointer",
              background: page === ADMIN_NAV.id ? ADMIN_NAV.color : "transparent",
              color: page === ADMIN_NAV.id ? "white" : C.red,
              fontWeight: page === ADMIN_NAV.id ? 700 : 500, fontSize: 13, fontFamily: "inherit",
              transition: "all .15s",
            }}
            onMouseEnter={e => { if (page !== ADMIN_NAV.id) e.currentTarget.style.background = "#fef2f2" }}
            onMouseLeave={e => { if (page !== ADMIN_NAV.id) e.currentTarget.style.background = "transparent" }}>
            <Shield size={13} color={page === ADMIN_NAV.id ? "white" : C.red} />
            {ADMIN_NAV.label}
          </button>
        )}
      </div>

      <div ref={menuRef} style={{ position: "relative", marginLeft: 12 }}>
        <button
          onClick={() => setShowMenu(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "6px 12px",
            borderRadius: 10, border: "1.5px solid #e5e7eb", background: "white",
            cursor: "pointer", fontFamily: "inherit",
          }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: user.avatarColor || C.teal,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: 11, fontWeight: 800,
          }}>
            {(user.name || user.email || "U")[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.name || user.email}
          </span>
          <ChevronDown size={14} color="#6b7280" />
        </button>

        {showMenu && (
          <div style={{
            position: "absolute", right: 0, top: "calc(100% + 8px)",
            background: "white", borderRadius: 12, border: "1px solid #e5e7eb",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)", padding: 6, minWidth: 180, zIndex: 200,
          }}>
            <button onClick={() => { setPage("profil"); setShowMenu(false) }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 14px", borderRadius: 9, border: "none", background: "none",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#374151",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <UserIcon size={14} color="#6b7280" /> Mon profil
            </button>

            {adminAccess && (
              <button onClick={() => { setPage("admin"); setShowMenu(false) }}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "9px 14px", borderRadius: 9, border: "none", background: "none",
                  cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: C.red,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <Shield size={14} color={C.red} /> Administration
              </button>
            )}

            <div style={{ height: 1, background: "#f3f4f6", margin: "4px 6px" }} />

            <button onClick={() => { onLogout(); setShowMenu(false) }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "9px 14px", borderRadius: 9, border: "none", background: "none",
                cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: "#ef4444",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <LogOut size={14} color="#ef4444" /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
