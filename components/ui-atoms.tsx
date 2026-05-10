"use client"

import React, { useState, useEffect, useRef } from "react"
import { C } from "@/lib/colors"
import {
  Activity, BookOpen, Calendar, FileText, Sparkles, MessageCircle, GraduationCap, Lightbulb,
  User, Users, Plus, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Upload, Check,
  CheckCircle, Pencil, Trash2, BarChart3, LogOut, Camera, Mail, Lock, Trophy, TrendingUp,
  Send, AlertTriangle, Eye, X, MapPin, Paperclip, Star, Heart, Wrench, Image, Info,
  Link2, Archive, StickyNote, RefreshCw, School as SchoolIcon, Shield
} from "lucide-react"

/* Icon map to reference icons by string name */
export const IconMap: Record<string, React.ElementType> = {
  logo: Activity, home: Activity, book: BookOpen, calendar: Calendar, doc: FileText,
  sparkles: Sparkles, chat: MessageCircle, school: SchoolIcon, lightbulb: Lightbulb,
  user: User, users: Users, plus: Plus, arrow: ArrowRight, chevDown: ChevronDown,
  chevLeft: ChevronLeft, chevRight: ChevronRight, upload: Upload, checkSimple: Check,
  check: CheckCircle, edit: Pencil, trash: Trash2, chart: BarChart3, logout: LogOut,
  camera: Camera, mail: Mail, lock: Lock, trophy: Trophy, trend: TrendingUp, send: Send,
  warn: AlertTriangle, eye: Eye, close: X, location: MapPin, clip: Paperclip, star: Star,
  heart: Heart, tools: Wrench, photo: Image, info: Info, link: Link2, archive: Archive,
  note: StickyNote, starFilled: Star, refreshCw: RefreshCw, shield: Shield,
  // Badge icons
  BookOpen, Library: BookOpen, Award: Trophy, Calendar: Calendar, CalendarDays: Calendar,
  RefreshCw, BarChart3, MessageCircle, CheckCircle, Heart, Users, Trophy, FileText,
  Rocket: TrendingUp, Dumbbell: Activity, UserPlus: User, UserCheck: User, School: SchoolIcon, Camera,
}

export function Icon({ name, size = 20, color = "currentColor", className }: { name: string; size?: number; color?: string; className?: string }) {
  const Comp = IconMap[name]
  if (!Comp) return null
  return <Comp size={size} color={color} className={className} strokeWidth={1.8} />
}

export function Logo({ size = 34, fs = 18 }: { size?: number; fs?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        background: "linear-gradient(135deg,#0d9488,#2563eb)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
      }}>
        <Activity size={size * 0.5} color="white" />
      </div>
      <span style={{ fontWeight: 800, fontSize: fs, lineHeight: 1 }}>
        <span style={{ color: C.dark }}>Educ</span>
        <span style={{ color: C.teal }}>Sport</span>
      </span>
    </div>
  )
}

export function Btn({
  children, color = C.blue, outline = false, onClick, sm = false,
  full = false, disabled = false, style: s = {}, danger = false
}: {
  children: React.ReactNode; color?: string; outline?: boolean; onClick?: () => void;
  sm?: boolean; full?: boolean; disabled?: boolean; style?: React.CSSProperties; danger?: boolean
}) {
  const [hov, setHov] = useState(false)
  const col = danger ? C.red : color
  return (
    <button onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      disabled={disabled}
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: sm ? "6px 14px" : "9px 20px", width: full ? "100%" : undefined,
        borderRadius: 9, cursor: disabled ? "default" : "pointer",
        border: outline ? `1.5px solid ${col}` : "none",
        background: disabled ? "#e5e7eb" : outline ? (hov ? col + "15" : "white") : (hov ? col + "e0" : col),
        color: disabled ? "#9ca3af" : outline ? col : "white",
        fontWeight: 600, fontSize: sm ? 13 : 14, fontFamily: "inherit",
        transition: "all .15s",
        boxShadow: (!outline && !disabled) ? `0 1px 3px ${col}40` : "none",
        ...s
      }}>
      {children}
    </button>
  )
}

export function Tag({ children, color = C.blue, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: bg || color + "18", color
    }}>
      {children}
    </span>
  )
}

export function Card({
  children, style: s = {}, onClick, hover = false
}: {
  children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void; hover?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => hover && setHov(true)}
      onMouseLeave={() => hover && setHov(false)}
      style={{
        background: "white", borderRadius: 14, border: "1px solid #e5e7eb",
        boxShadow: hov ? "0 8px 24px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
        transition: "all .2s", cursor: onClick ? "pointer" : "default", ...s
      }}>
      {children}
    </div>
  )
}

export function Modal({
  open, onClose, title, subtitle, width = 500, children
}: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; width?: number; children: React.ReactNode
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    if (open) document.addEventListener("keydown", h)
    return () => document.removeEventListener("keydown", h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300, backdropFilter: "blur(2px)"
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "white", borderRadius: 18, padding: "26px 30px",
        width, maxWidth: "94vw", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 80px rgba(0,0,0,0.25)", animation: "slideUp .18s ease"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: C.dark }}>{title}</h2>
            {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13.5, color: C.gray }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", borderRadius: 8, width: 32, height: 32,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <X size={16} color={C.gray} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const iBase: React.CSSProperties = {
  width: "100%", padding: "9px 13px", borderRadius: 9,
  border: "1.5px solid #e5e7eb", fontSize: 14, outline: "none",
  boxSizing: "border-box", background: "#f9fafb", fontFamily: "inherit",
  transition: "border .15s, background .15s"
}

export function Inp({
  placeholder, value, onChange, type = "text", icon, disabled = false, min, max, step
}: {
  placeholder?: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; icon?: string; disabled?: boolean; min?: string; max?: string; step?: string
}) {
  const [foc, setFoc] = useState(false)
  const IconComp = icon ? IconMap[icon] : null
  return (
    <div style={{ position: "relative" }}>
      {IconComp && (
        <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <IconComp size={15} color={foc ? C.blue : "#9ca3af"} />
        </span>
      )}
      <input placeholder={placeholder} value={value} onChange={onChange} type={type}
        disabled={disabled} min={min} max={max} step={step}
        style={{
          ...iBase, paddingLeft: icon ? 34 : 13,
          borderColor: foc ? C.blue : "#e5e7eb",
          background: foc ? "white" : "#f9fafb",
          color: disabled ? "#9ca3af" : C.dark
        }}
        onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
    </div>
  )
}

export function TA({
  placeholder, rows = 3, value, onChange
}: {
  placeholder?: string; rows?: number; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  const [foc, setFoc] = useState(false)
  return (
    <textarea placeholder={placeholder} rows={rows} value={value} onChange={onChange}
      style={{
        ...iBase, resize: "vertical" as const,
        borderColor: foc ? C.blue : "#e5e7eb",
        background: foc ? "white" : "#f9fafb"
      }}
      onFocus={() => setFoc(true)} onBlur={() => setFoc(false)} />
  )
}

export function Sel({
  value, onChange, options, placeholder = "Selectionnez"
}: {
  value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (string | { v: string; l: string })[]; placeholder?: string
}) {
  return (
    <select value={value} onChange={onChange} style={{ ...iBase, cursor: "pointer" }}>
      <option value="">{placeholder}</option>
      {options.map((o, idx) =>
        typeof o === "string"
          ? <option key={`${o}-${idx}`} value={o}>{o}</option>
          : <option key={`${o.v || idx}-${idx}`} value={o.v}>{o.l}</option>
      )}
    </select>
  )
}

export function FormField({
  label, req, children, hint
}: {
  label: string; req?: boolean; children: React.ReactNode; hint?: string
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
        {label}
        {req && <span style={{ color: C.red }}>{" *"}</span>}
        {hint && <span style={{ fontWeight: 400, color: C.gray, fontSize: 12, marginLeft: 6 }}>({hint})</span>}
      </label>
      {children}
    </div>
  )
}

export function EmptyState({
  icon, title, subtitle, cta
}: {
  icon: string; title: string; subtitle: string; cta?: React.ReactNode
}) {
  const IconComp = IconMap[icon] || Info
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <div style={{
        width: 64, height: 64, borderRadius: 16, background: "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
      }}>
        <IconComp size={28} color="#d1d5db" />
      </div>
      <p style={{ fontWeight: 700, fontSize: 16, color: "#374151", margin: "0 0 6px" }}>{title}</p>
      <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 20px" }}>{subtitle}</p>
      {cta}
    </div>
  )
}

export function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  useEffect(() => {
    if (msg) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t) }
  }, [msg, onClose])
  if (!msg) return null
  return (
    <div style={{
      position: "fixed", bottom: 80, right: 24, background: "#0f172a", color: "white",
      padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 500, animation: "slideUp .2s ease",
      display: "flex", alignItems: "center", gap: 10
    }}>
      <Check size={16} color="#10b981" /> {msg}
    </div>
  )
}

export function ConfirmModal({
  open, title, msg, onConfirm, onClose
}: {
  open: boolean; title: string; msg: string; onConfirm: () => void; onClose: () => void
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width={400}>
      <p style={{ color: C.gray, fontSize: 14.5, marginBottom: 20 }}>{msg}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <Btn outline color={C.gray} onClick={onClose} sm>Annuler</Btn>
        <Btn danger onClick={() => { onConfirm(); onClose() }} sm>Supprimer</Btn>
      </div>
    </Modal>
  )
}

export function StarRating({ value = 0, onChange, size = 20 }: { value?: number; onChange: (n: number) => void; size?: number }) {
  const [hov, setHov] = useState(0)
  const labels = ["", "Mauvais", "Passable", "Correct", "Bien", "Excellent"]
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n === value ? 0 : n)}
          onMouseEnter={() => setHov(n)} onMouseLeave={() => setHov(0)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 2, lineHeight: 1 }}>
          <Star size={size} color={(hov || value) >= n ? "#f59e0b" : "#e5e7eb"}
            fill={(hov || value) >= n ? "#f59e0b" : "none"} />
        </button>
      ))}
      {(hov || value) > 0 && (
        <span style={{ fontSize: 12.5, color: C.amber, fontWeight: 600, marginLeft: 4 }}>
          {labels[hov || value]}
        </span>
      )}
    </div>
  )
}
