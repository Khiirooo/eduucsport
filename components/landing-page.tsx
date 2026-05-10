"use client"

import React, { useState } from "react"
import { C } from "@/lib/colors"
import { Logo, Btn, Icon } from "@/components/ui-atoms"
import { Activity, BookOpen, Calendar, FileText, Sparkles, MessageCircle, GraduationCap, Lightbulb, Users, Lock, ArrowRight, Check } from "lucide-react"

export function LandingPage({ setView }: { setView: (v: string) => void }) {
  const [mobileMenu, setMobileMenu] = useState(false)

  const features = [
    { icon: BookOpen, color: C.blue, bg: C.blueLight, title: "Preparations", desc: "Creation, importation, publication et acces a une bibliotheque communautaire de preparations de cours." },
    { icon: Calendar, color: C.green, bg: C.greenLight, title: "Cycles", desc: "Planification annuelle par classe avec integration de preparations et visualisation complete." },
    { icon: FileText, color: C.orange, bg: C.orangeLight, title: "Journal de classe", desc: "Calendrier pedagogique, suivi des seances et observations avec liaison aux preparations existantes." },
    { icon: GraduationCap, color: C.blue, bg: C.blueLight, title: "Ecole", desc: "Gestion complete des ecoles, classes, materiel note avec photos et journal reflexif d'ecole." },
    { icon: MessageCircle, color: C.purple, bg: C.purpleLight, title: "Forum", desc: "Espace de questions, reponses et echanges entre enseignants et etudiants avec badge de statut." },
    { icon: Sparkles, color: C.orange, bg: C.orangeLight, title: "IA specialisee EPS", desc: "Generation de preparations et cycles, analyse pedagogique, differenciation et conseils adaptes." },
    { icon: Lightbulb, color: C.amber, bg: C.amberLight, title: "Innovations", desc: "Actualites, recherches et nouveautes en education physique." },
  ]

  const previews = [
    { icon: Activity, color: C.blue, bg: C.blueLight, title: "Tableau de bord", desc: "Vue d'ensemble de votre activite et acces rapide a toutes les fonctionnalites de la plateforme." },
    { icon: Calendar, color: C.green, bg: C.greenLight, title: "Calendrier interactif", desc: "Planifiez et suivez vos seances avec un calendrier jour, semaine, mois et annee." },
    { icon: FileText, color: C.orange, bg: C.orangeLight, title: "Preparations de cours", desc: "Creez, partagez et importez vos preparations facilement depuis un seul endroit." },
    { icon: GraduationCap, color: C.blue, bg: C.blueLight, title: "Gestion d'ecole", desc: "Suivez vos stages et ecoles pratiques en detail avec materiel, photos et notes." },
  ]

  const navLinks = [
    { label: "Fonctionnalites", id: "fonctionnalites" },
    { label: "Pour qui", id: "pourqui" },
    { label: "Apercu", id: "apercu" },
    { label: "Nos valeurs", id: "apropos" },
    { label: "Contact", id: "contact" },
  ]

  const scrollTo = (id: string) => {
    setMobileMenu(false)
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div style={{ fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", background: "white", minHeight: "100vh" }}>
      {/* NAV */}
      <nav style={{ display: "flex", alignItems: "center", padding: "0 48px", height: 64, borderBottom: "1px solid #f1f5f9", background: "white", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 #f1f5f9" }}>
        <div style={{ flex: 1 }}><Logo /></div>
        <div className="lp-nav-links">
          {navLinks.map(l => (
            <span key={l.label} onClick={() => scrollTo(l.id)}
              style={{ cursor: "pointer", transition: "color .15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
              onMouseLeave={e => (e.currentTarget.style.color = "#374151")}>
              {l.label}
            </span>
          ))}
        </div>
        <button className="lp-hamburger" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Menu">
          <span /><span /><span />
        </button>
        <div className={"lp-mobile" + (mobileMenu ? " open" : "")}>
          {navLinks.map(l => (
            <span key={l.label} onClick={() => scrollTo(l.id)}>{l.label}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginLeft: "auto" }}>
          <button onClick={() => setView("login")} style={{ background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14.5, color: "#374151", padding: "8px 16px", borderRadius: 8, transition: "background .15s" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f3f4f6")}
            onMouseLeave={e => (e.currentTarget.style.background = "none")}>Se connecter</button>
          <Btn onClick={() => setView("signup")} color={C.green}>Creer un compte</Btn>
        </div>
      </nav>

      {/* HERO */}
      <section className="lp-hero" style={{ display: "flex", alignItems: "stretch", background: "linear-gradient(145deg,#f0f9ff 0%,#f0fdf4 55%,#fffbeb 100%)", overflow: "hidden", minHeight: "calc(100vh - 64px)" }}>
        <div className="lp-hero-text" style={{ flex: 1, display: "flex", alignItems: "center", padding: "80px 64px 80px 80px", animation: "slideUp .5s ease" }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0369a1", borderRadius: 20, padding: "5px 16px", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
              {"🇧🇪 Belgique FWB"}
            </div>
            <h1 style={{ margin: "0 0 22px", fontSize: 52, fontWeight: 900, lineHeight: 1.12, color: C.dark }}>
              {"La plateforme digitale"}<br />
              {"des "}<span style={{ color: C.blue }}>etudiants</span>{" et "}<span style={{ color: C.green }}>enseignants</span><br />
              {"en education physique"}
            </h1>
            <p style={{ margin: "0 0 36px", fontSize: 16.5, color: C.gray, lineHeight: 1.7 }}>
              {"Creez vos preparations, planifiez vos cycles, gerez vos ecoles, utilisez une IA specialisee EPS et echangez avec la communaute."}
            </p>
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <button onClick={() => setView("signup")} style={{ display: "flex", alignItems: "center", gap: 9, padding: "13px 26px", borderRadius: 10, border: "none", background: C.blue, color: "white", fontWeight: 700, fontSize: 15.5, cursor: "pointer", boxShadow: `0 4px 14px ${C.blue}50`, transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = C.blueDark; e.currentTarget.style.transform = "translateY(-1px)" }}
                onMouseLeave={e => { e.currentTarget.style.background = C.blue; e.currentTarget.style.transform = "translateY(0)" }}>
                {"Commencer "}<ArrowRight size={17} color="white" />
              </button>
              <button onClick={() => setView("login")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 24px", borderRadius: 10, border: "1.5px solid #d1d5db", background: "white", fontWeight: 600, fontSize: 15, cursor: "pointer", color: "#374151" }}>
                Se connecter
              </button>
            </div>
            <div style={{ display: "flex", gap: 20, fontSize: 13.5, color: C.gray }}>
              {["Sans engagement", "Acces immediat"].map(t => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Check size={16} color={C.green} strokeWidth={2.5} /> {t}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="lp-hero-img" style={{ flex: 1, position: "relative", minHeight: "100%", animation: "slideUp .6s ease .1s both" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1554284126-aa88f22d8b74?w=1000&q=90" alt="Sport EPS" crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block", position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(240,249,255,0.3) 0%, transparent 30%)" }} />
          <div style={{ position: "absolute", top: 40, left: 32, background: "white", borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Sparkles size={18} color={C.green} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.gray }}>IA integree</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Specialisee EPS</div>
            </div>
          </div>
          <div style={{ position: "absolute", bottom: 40, right: 32, background: "white", borderRadius: 14, padding: "12px 18px", boxShadow: "0 8px 24px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Users size={18} color={C.blue} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: C.gray }}>Communaute</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Active et engagee</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fonctionnalites" style={{ padding: "88px 80px", background: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 14px", color: C.dark }}>Fonctionnalites principales</h2>
          <p style={{ fontSize: 16.5, color: C.gray, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>{"Une suite complete d'outils pour optimiser votre enseignement"}</p>
        </div>
        <div className="lp-grid3">
          {features.map(f => (
            <div key={f.title} style={{ padding: "28px 26px", borderRadius: 16, border: "1px solid #f1f5f9", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-3px)" }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: C.dark }}>{f.title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: C.gray, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* POUR QUI */}
      <section id="pourqui" style={{ padding: "88px 80px", background: "linear-gradient(145deg,#f0f9ff 0%,#f0fdf4 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 12px", color: C.dark }}>Pour qui ?</h2>
          <p style={{ fontSize: 16.5, color: C.gray, lineHeight: 1.7 }}>Une plateforme concue pour repondre aux besoins de tous</p>
        </div>
        <div className="lp-grid2" style={{ maxWidth: 1100 }}>
          {[
            { icon: GraduationCap, bg: C.blue, label: "Etudiants en EPS", sub: "Reussissez vos stages et examens", items: ["Organiser vos ecoles de maniere structuree", "Creer des preparations rapidement avec l'IA", "Structurer vos cycles d'apprentissage", "Recevoir de l'aide pedagogique adaptee", "Acceder a une bibliotheque de ressources"] },
            { icon: Users, bg: C.green, label: "Enseignants", sub: "Optimisez votre enseignement", items: ["Centraliser tous vos documents pedagogiques", "Suivre la progression de vos classes", "Partager vos preparations avec la communaute", "Gagner du temps grace a l'automatisation", "Collaborer avec d'autres enseignants"] },
          ].map(g => (
            <div key={g.label} style={{ background: "white", borderRadius: 20, padding: "32px 36px", border: "1px solid #e5e7eb", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <g.icon size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 19, color: C.dark }}>{g.label}</div>
                  <div style={{ fontSize: 13.5, color: C.gray }}>{g.sub}</div>
                </div>
              </div>
              {g.items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 13, fontSize: 14.5, color: "#374151" }}>
                  <Check size={17} color={C.green} strokeWidth={2.5} /> {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* APERCU */}
      <section id="apercu" style={{ padding: "88px 80px", background: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 14px", color: C.dark }}>{"Apercu de l'interface"}</h2>
          <p style={{ fontSize: 16.5, color: C.gray, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>Une interface moderne, intuitive et pensee pour l'efficacite</p>
        </div>
        <div className="lp-grid2" style={{ maxWidth: 1100 }}>
          {previews.map(pv => (
            <div key={pv.title} style={{ padding: "28px 26px", borderRadius: 16, border: "1px solid #f1f5f9", transition: "all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.09)"; e.currentTarget.style.transform = "translateY(-3px)" }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)" }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: pv.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <pv.icon size={24} color={pv.color} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: C.dark }}>{pv.title}</h3>
              <span style={{ margin: 0, fontSize: 14, color: C.gray, lineHeight: 1.7, display: "block" }}>{pv.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NOS VALEURS */}
      <section id="apropos" style={{ padding: "88px 80px", background: "linear-gradient(145deg,#f0f9ff 0%,#f0fdf4 100%)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, margin: "0 0 12px", color: C.dark }}>Nos valeurs</h2>
          <p style={{ fontSize: 16.5, color: C.gray }}>{"Ce qui fait d'EducSport une plateforme unique"}</p>
        </div>
        <div className="lp-grid4" style={{ maxWidth: 1100, margin: "0 auto" }}>
          {[
            { icon: Users, color: C.blue, bg: C.blueLight, title: "Collaboratif", desc: "Partagez et decouvrez des ressources creees par la communaute EPS" },
            { icon: GraduationCap, color: C.green, bg: C.greenLight, title: "Specialise EPS", desc: "Concu specifiquement pour l'education physique en Belgique FWB" },
            { icon: Sparkles, color: C.orange, bg: C.orangeLight, title: "Moderne", desc: "Interface intuitive avec IA integree et outils innovants" },
            { icon: Lock, color: "#6366f1", bg: "#ede9fe", title: "Securise", desc: "Vos donnees sont protegees et hebergees de maniere securisee" },
          ].map(v => (
            <div key={v.title} style={{ background: "white", borderRadius: 18, padding: "28px 22px", border: "1px solid #e5e7eb", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: v.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <v.icon size={24} color={v.color} />
              </div>
              <h3 style={{ margin: "0 0 8px", fontSize: 16, fontWeight: 800, color: C.dark }}>{v.title}</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: C.gray, lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "88px 80px", background: "white", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-block", background: C.purpleLight, color: C.purple, borderRadius: 20, padding: "5px 16px", fontSize: 13, fontWeight: 700, marginBottom: 16 }}>
              {"✉️ Contact"}
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 12px", color: C.dark }}>Nous contacter</h2>
            <p style={{ fontSize: 16, color: C.gray }}>Une question, une suggestion ou un probleme ? On vous repond rapidement.</p>
          </div>
          <div className="lp-cgrid">
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.dark, marginBottom: 6 }}>{"Prenom & Nom"}</label>
              <input type="text" placeholder="Jean Dupont" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Email</label>
              <input type="email" placeholder="jean@ecole.be" style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Sujet</label>
            <select style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", outline: "none", background: "white" }}>
              <option>Question generale</option>
              <option>Probleme technique</option>
              <option>{"Suggestion d'amelioration"}</option>
              <option>Partenariat / collaboration</option>
              <option>Autre</option>
            </select>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: C.dark, marginBottom: 6 }}>Message</label>
            <textarea placeholder="Decrivez votre demande..." rows={5} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, fontFamily: "inherit", outline: "none", resize: "vertical" }} />
          </div>
          <button style={{ width: "100%", padding: "13px", borderRadius: 11, border: "none", background: `linear-gradient(135deg,${C.blue},${C.green})`, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            {"Envoyer le message →"}
          </button>
          <div className="lp-cinfo">
            {[{ icon: "✉️", label: "lucas@educsport.be" }, { icon: "🇧🇪", label: "Belgique — FWB" }, { icon: "⏱️", label: "Reponse sous 48h" }].map(item => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 13.5, color: C.gray, fontWeight: 500 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 80, textAlign: "center", background: "linear-gradient(135deg,#1d4ed8 0%,#15803d 55%,#c2410c 100%)", color: "white" }}>
        <h2 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 16px" }}>Rejoignez la communaute EducSport des maintenant</h2>
        <p style={{ fontSize: 16.5, opacity: 0.9, maxWidth: 600, margin: "0 auto 40px", lineHeight: 1.7 }}>
          Commencez a creer, planifier et partager vos contenus pedagogiques en quelques minutes, sans engagement.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <button onClick={() => setView("signup")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 30px", borderRadius: 12, border: "2px solid white", background: "white", color: C.blue, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
            {"Creer un compte "}<ArrowRight size={16} color={C.blue} />
          </button>
          <button onClick={() => setView("login")} style={{ padding: "14px 30px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.6)", background: "transparent", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
            Se connecter
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "white", borderTop: "1px solid #e5e7eb", padding: "24px 80px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Logo size={28} fs={15} />
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#9ca3af" }}>{"®2026 EducSport — Plateforme dediee a l'EPS en Belgique FWB"}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#b0b7c3" }}>Site en cours de construction</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <a href="mailto:lucas@educsport.be" style={{ fontSize: 13, color: C.blue, textDecoration: "none", fontWeight: 600 }}>lucas@educsport.be</a>
          <div style={{ display: "flex", gap: 20, fontSize: 13, color: C.gray }}>
            {["Confidentialite", "CGU", "Contact"].map(l => (
              <span key={l} style={{ cursor: "pointer", transition: "color .15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = C.blue)}
                onMouseLeave={e => (e.currentTarget.style.color = C.gray)}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
