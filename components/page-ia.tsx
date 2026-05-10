"use client"
import React, { useState, useRef, useEffect } from "react"
import { C } from "@/lib/colors"
import { Card } from "@/components/ui-atoms"
import { Sparkles, Send, Copy, Check } from "lucide-react"

interface Message {
  r: "u" | "a"
  t: string
  copied?: boolean
}

const SUGGESTIONS = [
  "Créer une préparation d'athlétisme pour des 3èmes",
  "Proposer un cycle de 8 séances de basketball",
  "Stratégies de différenciation pédagogique en EPS",
  "Comment gérer une classe difficile en gymnase ?",
  "Activités inclusives pour élèves handicapés",
  "Progression pour l'apprentissage du badminton",
]

const SYSTEM_PROMPT = `Tu es un assistant pédagogique expert en EPS (Éducation Physique et Sportive) pour les enseignants belges et francophones. Tu aides les professeurs d'EPS à :
- Créer des préparations de cours complètes et structurées
- Planifier des cycles d'apprentissage progressifs
- Proposer des activités adaptées aux différents niveaux
- Gérer la différenciation pédagogique
- Organiser l'espace et le matériel
- Évaluer les compétences motrices

Quand on te demande une préparation de cours, structure ta réponse avec :
**Titre** | **Classe** | **Durée** | **Discipline**
**Objectifs** (liste courte)
**Matériel nécessaire**
**Déroulement** (échauffement, corps de séance, retour au calme avec durées)
**Différenciation** (adaptations pour niveaux différents)
**Critères de réussite**

Réponds toujours en français, de façon claire et pratique. Sois concis mais complet.`

export function PageIA() {
  const [msgs, setMsgs] = useState<Message[]>([
    {
      r: "a",
      t: "Bonjour ! Je suis votre assistant IA spécialisé EPS, propulsé par Claude (Anthropic).\n\nJe peux vous aider à :\n• Générer des préparations de cours complètes\n• Créer des cycles d'apprentissage progressifs\n• Proposer des activités et exercices adaptés\n• Adapter vos séances selon les niveaux\n• Suggérer des stratégies de différenciation\n\nComment puis-je vous aider aujourd'hui ?"
    }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs])

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()
    setMsgs(m => [...m, { r: "u", t: userMsg }])
    setInput("")
    setLoading(true)
    setError(null)

    // Build conversation history for Claude API
    const history = msgs
      .filter(m => m.r === "u" || m.r === "a")
      .map(m => ({
        role: m.r === "u" ? "user" : "assistant",
        content: m.t
      }))

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [
            ...history,
            { role: "user", content: userMsg }
          ],
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || `Erreur ${response.status}`)
      }

      const data = await response.json()
      const reply = data.content
        .filter((block: any) => block.type === "text")
        .map((block: any) => block.text)
        .join("\n")

      setMsgs(m => [...m, { r: "a", t: reply }])
    } catch (err: any) {
      console.error("Claude API error:", err)
      setError("Erreur de connexion à l'IA. Vérifiez votre connexion et réessayez.")
      setMsgs(m => [...m, {
        r: "a",
        t: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer dans un instant."
      }])
    } finally {
      setLoading(false)
    }
  }

  const copyMsg = (idx: number, text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setMsgs(m => m.map((msg, i) => i === idx ? { ...msg, copied: true } : msg))
      setTimeout(() => setMsgs(m => m.map((msg, i) => i === idx ? { ...msg, copied: false } : msg)), 2000)
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)" }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
          <Sparkles size={24} color={C.orange} /> Assistant IA EPS
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.gray }}>Propulsé par Claude · Réponses personnalisées pour les enseignants EPS</p>
      </div>

      {/* Suggestions rapides */}
      <Card style={{ padding: "10px 14px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.gray, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.05em" }}>Suggestions</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)} disabled={loading}
              style={{
                padding: "5px 13px", borderRadius: 20, border: "1.5px solid #e5e7eb",
                background: "white", fontSize: 12.5, cursor: loading ? "not-allowed" : "pointer",
                color: "#374151", fontFamily: "inherit", opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.borderColor = C.orange }}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
              {s}
            </button>
          ))}
        </div>
      </Card>

      {/* Zone de messages */}
      <Card style={{ flex: 1, overflowY: "auto", padding: 20, marginBottom: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            {m.r === "a" && (
              <div style={{
                width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.orange}, #f59e0b)`,
                display: "flex", alignItems: "center", justifyContent: "center", marginRight: 10, flexShrink: 0, marginTop: 2,
              }}>
                <Sparkles size={14} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.7,
              background: m.r === "u" ? C.blue : "#f8fafc",
              color: m.r === "u" ? "white" : "#374151",
              border: m.r === "a" ? "1px solid #e5e7eb" : "none",
              position: "relative",
            }}>
              {m.r === "a" && (
                <div style={{ fontWeight: 700, fontSize: 11, color: C.orange, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Assistant IA EPS
                </div>
              )}
              <div style={{ whiteSpace: "pre-wrap" }}>{m.t}</div>
              {m.r === "a" && m.t.length > 50 && (
                <button onClick={() => copyMsg(i, m.t)}
                  style={{
                    position: "absolute", top: 8, right: 8, background: "none", border: "none",
                    cursor: "pointer", padding: 4, borderRadius: 6, opacity: 0.5,
                  }}
                  title="Copier la réponse"
                  onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "0.5"}>
                  {m.copied ? <Check size={13} color={C.green} /> : <Copy size={13} color={C.gray} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg, ${C.orange}, #f59e0b)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Sparkles size={14} color="white" />
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: "50%", background: C.orange,
                  animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out`
                }} />
              ))}
            </div>
            <span style={{ fontSize: 13, color: C.gray }}>L'IA réfléchit...</span>
          </div>
        )}

        {error && (
          <div style={{ padding: "10px 16px", background: "#fef2f2", borderRadius: 10, border: "1px solid #fecaca", fontSize: 13, color: "#b91c1c", marginBottom: 12 }}>
            ⚠️ {error}
          </div>
        )}

        <div ref={endRef} />
      </Card>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      {/* Zone de saisie */}
      <Card style={{ padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-end" }}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question... (Entrée pour envoyer, Maj+Entrée pour saut de ligne)"
          rows={1}
          style={{
            flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent",
            fontFamily: "inherit", resize: "none", maxHeight: 120, overflowY: "auto",
            lineHeight: 1.5,
          }}
          onInput={e => {
            const el = e.target as HTMLTextAreaElement
            el.style.height = "auto"
            el.style.height = Math.min(el.scrollHeight, 120) + "px"
          }}
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || loading}
          style={{
            width: 38, height: 38, borderRadius: 10, border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
            background: input.trim() && !loading ? `linear-gradient(135deg, ${C.orange}, #f59e0b)` : "#e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            transition: "all .15s",
          }}>
          <Send size={15} color="white" />
        </button>
      </Card>
    </div>
  )
}
