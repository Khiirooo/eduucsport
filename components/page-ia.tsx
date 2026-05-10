"use client"
import React, { useState, useRef, useEffect } from "react"
import { C } from "@/lib/colors"
import { Card } from "@/components/ui-atoms"
import { Sparkles, Send } from "lucide-react"

export function PageIA() {
  const [msgs, setMsgs] = useState([
    { r: "a", t: "Bonjour ! Je suis votre assistant IA specialise EPS. Je peux vous aider a :\n\n- Generer des preparations de cours completes\n- Creer des cycles d'apprentissage adaptes\n- Proposer des activites et exercices\n- Adapter vos seances selon les niveaux\n- Suggerer des differenciations pedagogiques\n\nComment puis-je vous aider ?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) }, [msgs])

  const suggestions = ["Creer une preparation d'athletisme", "Proposer un cycle de sports collectifs", "Strategies de differenciation", "Gerer une classe difficile", "Activites pour l'inclusion"]

  const send = async (text: string) => {
    if (!text.trim() || loading) return
    setMsgs(m => [...m, { r: "u", t: text }])
    setInput("")
    setLoading(true)

    // Simulate IA response (no external API needed)
    await new Promise(r => setTimeout(r, 1200))

    const responses: Record<string, string> = {
      "athletisme": "Voici une proposition de preparation d'athletisme :\n\nTitre : Course de vitesse - Initiation\nClasse : 3eme secondaire\nDuree : 50 min\n\nObjectifs :\n- Developper la vitesse de reaction\n- Ameliorer la technique de depart\n- Travailler la coordination bras/jambes\n\nDeroulement :\n1. Echauffement (10min) : Course lente + gammes athletiques\n2. Situation d'apprentissage (25min) : Departs debout, departs accroupis, relais navettes\n3. Situation de reference (10min) : Course de 40m chronometree\n4. Retour au calme (5min) : Etirements + bilan\n\nDifferenciation : Adapter les distances selon les niveaux.",
      "cycle": "Proposition de cycle de sports collectifs (Basketball) :\n\nDuree : 8 seances de 50 min\nClasse : 4eme secondaire\n\nSeance 1-2 : Les fondamentaux\n- Dribble, passe, tir en course\n- Jeux reduits 2c2, 3c3\n\nSeance 3-4 : Jeu collectif\n- Montee de balle organisee\n- Defense individuelle\n- Match 4c4\n\nSeance 5-6 : Perfectionnement\n- Ecrans, appels de balle\n- Strategies offensives simples\n- Match 5c5\n\nSeance 7-8 : Evaluation\n- Tournoi inter-equipes\n- Evaluation individuelle et collective",
      "differenciation": "Strategies de differenciation en EPS :\n\n1. Adapter l'espace : Reduire/agrandir les terrains selon les niveaux\n2. Adapter le temps : Plus de temps pour les eleves en difficulte\n3. Adapter les regles : Simplifier ou complexifier les consignes\n4. Adapter le materiel : Ballons plus gros, cibles plus grandes\n5. Adapter les roles : Arbitre, coach, observateur\n6. Adapter les criteres de reussite : Objectifs individualises\n7. Tutorat entre pairs : Eleves experts aident les debutants\n8. Groupes de niveau : Ateliers differencies",
      "classe": "Gerer une classe difficile en EPS :\n\n1. Etablir un cadre clair des le debut\n- Regles non negociables affichees\n- Consequences connues de tous\n\n2. Rituels de debut et fin de cours\n- Rassemblement rapide\n- Signal d'arret connu\n\n3. Varier les activites\n- Alterner effort et recuperation\n- Proposer des choix\n\n4. Valoriser les comportements positifs\n- Encourager publiquement\n- Systeme de points/privileges\n\n5. Gestion de l'espace\n- Eviter les temps d'attente\n- Organiser des ateliers\n\n6. Communication non-verbale\n- Placement strategique\n- Contact visuel",
      "inclusion": "Activites pour l'inclusion en EPS :\n\n1. Sports adaptes\n- Boccia, goalball, torball\n- Basket fauteuil (simulation)\n\n2. Jeux cooperatifs\n- Parachute collectif\n- Relais entraide\n- Construction collective\n\n3. Adaptations universelles\n- Zones de jeu differenciees\n- Roles multiples (arbitre, coach, joueur)\n- Materiel adapte disponible\n\n4. Sensibilisation\n- Ateliers handicap\n- Parcours a l'aveugle\n- Communication non-verbale\n\n5. Evaluation inclusive\n- Progres individuel valorise\n- Auto-evaluation\n- Portfolio d'apprentissage"
    }

    const key = Object.keys(responses).find(k => text.toLowerCase().includes(k))
    const reply = key ? responses[key] : `Merci pour votre question ! Voici quelques pistes de reflexion :\n\nVotre demande concerne : "${text}"\n\nJe vous suggere de :\n1. Definir clairement vos objectifs pedagogiques\n2. Adapter le contenu au niveau de vos eleves\n3. Prevoir des situations de differenciation\n4. Integrer des moments d'evaluation formative\n\nN'hesitez pas a me poser des questions plus specifiques pour obtenir des reponses detaillees !`

    setMsgs(m => [...m, { r: "a", t: reply }])
    setLoading(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 112px)" }}>
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, display: "flex", alignItems: "center", gap: 10, color: C.dark }}>
          <Sparkles size={24} color={C.orange} /> Assistant IA EPS
        </h1>
      </div>
      <Card style={{ padding: "12px 16px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => send(s)} style={{
              padding: "5px 13px", borderRadius: 20, border: "1.5px solid #e5e7eb",
              background: "white", fontSize: 13, cursor: "pointer", color: "#374151", fontFamily: "inherit"
            }}>{s}</button>
          ))}
        </div>
      </Card>
      <Card style={{ flex: 1, overflowY: "auto", padding: 20, marginBottom: 12 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.r === "u" ? "flex-end" : "flex-start", marginBottom: 16 }}>
            <div style={{
              maxWidth: "75%", padding: "12px 16px", borderRadius: 14, fontSize: 14, lineHeight: 1.7,
              background: m.r === "u" ? C.blue : "#f8fafc",
              color: m.r === "u" ? "white" : "#374151",
              border: m.r === "a" ? "1px solid #e5e7eb" : "none"
            }}>
              {m.r === "a" && <div style={{ fontWeight: 700, fontSize: 12, color: C.orange, marginBottom: 6 }}>Assistant IA EPS</div>}
              <div style={{ whiteSpace: "pre-wrap" }}>{m.t}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 6, padding: 12 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, animation: `pulse 1s ${i * 0.2}s infinite` }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </Card>
      <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
      <Card style={{ padding: "11px 16px", display: "flex", gap: 10, alignItems: "center" }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
          placeholder="Posez votre question..."
          style={{ flex: 1, border: "none", outline: "none", fontSize: 14, background: "transparent", fontFamily: "inherit" }} />
        <button onClick={() => send(input)} disabled={!input.trim() || loading}
          style={{
            width: 36, height: 36, borderRadius: 9, border: "none", cursor: "pointer",
            background: input.trim() && !loading ? C.orange : "#e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
          <Send size={15} color="white" />
        </button>
      </Card>
    </div>
  )
}
