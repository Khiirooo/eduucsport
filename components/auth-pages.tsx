"use client"

import React, { useState, useRef } from "react"
import { C } from "@/lib/colors"
import { Logo, Btn, Inp, FormField, Sel } from "@/components/ui-atoms"
import { Mail, Lock, User as UserIcon, Building, Globe, Upload, GraduationCap, BookOpen, Check, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { isInstitutionalEmail, COUNTRIES } from "@/lib/auth-utils"
import type { User } from "@/lib/types"

// Step indicator for signup flow
function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i + 1 === step ? 24 : 8,
          height: 8,
          borderRadius: 4,
          background: i + 1 <= step ? C.blue : "#e5e7eb",
          transition: "all .2s"
        }} />
      ))}
    </div>
  )
}

// Role selection cards
function RoleCard({ selected, onClick, icon: Icon, title, desc, color }: {
  selected: boolean; onClick: () => void; icon: React.ElementType; title: string; desc: string; color: string
}) {
  return (
    <button onClick={onClick} style={{
      padding: "20px 16px",
      borderRadius: 14,
      border: `2px solid ${selected ? color : "#e5e7eb"}`,
      background: selected ? color + "10" : "white",
      cursor: "pointer",
      textAlign: "center",
      transition: "all .15s",
      fontFamily: "inherit",
      flex: 1,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: selected ? color : "#f3f4f6",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px"
      }}>
        <Icon size={24} color={selected ? "white" : "#9ca3af"} />
      </div>
      <div style={{ fontWeight: 700, fontSize: 15, color: selected ? color : C.dark, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: C.gray }}>{desc}</div>
    </button>
  )
}

export function LoginPage({ setView, onLogin }: { setView: (v: string) => void; onLogin: (u: User) => void }) {
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)

  const handle = async () => {
    if (!email || !pwd) { setErr("Veuillez remplir tous les champs."); return }
    
    // Validate institutional email
    const emailCheck = isInstitutionalEmail(email)
    if (!emailCheck.valid) {
      setErr(emailCheck.reason || "Email non autorise")
      return
    }

    setLoading(true)
    setErr("")

    try {
      const supabaseClient = createClient()
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: pwd })

      if (error) {
        setErr("Email ou mot de passe incorrect.")
        setLoading(false)
        return
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profile?.account_status === 'pending_verification') {
        await supabaseClient.auth.signOut()
        setErr("Votre compte est en attente de verification.")
        setLoading(false)
        return
      }

      if (profile?.account_status === 'rejected') {
        await supabaseClient.auth.signOut()
        setErr("Votre demande de compte a ete refusee.")
        setLoading(false)
        return
      }

      // Map to app User type
      const isAdmin = profile?.is_admin === true || profile?.user_role === 'admin' || profile?.role === 'admin'
      const isMod = profile?.user_role === 'moderator'
      
      setLoading(false)
      onLogin({
        id: data.user.id,
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || email.split("@")[0],
        email: data.user.email || email,
        status: profile?.role === 'teacher' || isAdmin ? "Enseignant EPS" : "Etudiant EPS",
        statusFull: profile?.role === 'teacher' || isAdmin ? "Enseignant EPS" : "Etudiant EPS",
        isTeacher: profile?.role === 'teacher' || isAdmin,
        isAdmin: isAdmin,
        isModerator: isMod,
        role: isAdmin ? 'admin' : (isMod ? 'moderator' : 'user'),
        niveau: 1,
        points: profile?.points || 0,
        badges: 1,
        avatarColor: profile?.role === 'teacher' ? "#0d9488" : "#2563eb",
        unlockedBadges: [17],
        institution: profile?.institution,
        country: profile?.country,
      })
    } catch (e) {
      setErr("Une erreur est survenue. Veuillez reessayer.")
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErr("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { hd: '*' },
        },
      })
      if (error) {
        setErr(error.message)
        setLoading(false)
      }
    } catch (e) {
      setErr("Erreur de connexion Google")
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#e0f2fe 0%,#f0fdf4 60%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: "20px" }}>
      <div style={{ animation: "slideUp .3s ease", width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo size={44} fs={24} />
          <p style={{ color: C.gray, fontSize: 14.5, marginTop: 8 }}>Connectez-vous a votre compte</p>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "32px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
          {err && <div style={{ background: "#fef2f2", color: C.red, padding: "10px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={16} />{err}</div>}
          
          <FormField label="Email institutionnel" req>
            <Inp placeholder="votre@institution.edu" value={email} onChange={e => setEmail(e.target.value)} type="email" icon="mail" />
          </FormField>
          <FormField label="Mot de passe" req>
            <Inp placeholder="Mot de passe" value={pwd} onChange={e => setPwd(e.target.value)} type="password" icon="lock" />
          </FormField>
          <Btn full color={C.blue} onClick={handle} disabled={loading} style={{ marginTop: 6 }}>
            {loading ? "Connexion..." : "Se connecter"}
          </Btn>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            <span style={{ fontSize: 12, color: C.gray }}>ou</span>
            <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
          </div>

          <button onClick={handleGoogleLogin} disabled={loading} style={{
            width: "100%", padding: "10px 16px", borderRadius: 9,
            border: "1.5px solid #e5e7eb", background: "white",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 600, color: C.dark
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuer avec Google
          </button>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: C.gray }}>
            {"Pas de compte ? "}
            <span onClick={() => setView("signup")} style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>Creer un compte</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#9ca3af" }}>
            <span onClick={() => setView("landing")} style={{ cursor: "pointer", textDecoration: "underline" }}>{"← Retour a l'accueil"}</span>
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.gray }}>
          Seuls les emails institutionnels sont autorises
        </p>
      </div>
    </div>
  )
}

export function SignupPage({ setView, onLogin }: { setView: (v: string) => void; onLogin: (u: User) => void }) {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'teacher' | 'student' | null>(null)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [pwd, setPwd] = useState("")
  const [pwdConfirm, setPwdConfirm] = useState("")
  const [institution, setInstitution] = useState("")
  const [country, setCountry] = useState("")
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofUrl, setProofUrl] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErr("Fichier trop volumineux (max 10MB)")
        return
      }
      setProofFile(file)
    }
  }

  const validateStep1 = () => {
    if (!role) { setErr("Veuillez selectionner votre role."); return false }
    setErr("")
    return true
  }

  const validateStep2 = () => {
    if (!firstName || !lastName || !email || !pwd) {
      setErr("Veuillez remplir tous les champs obligatoires.")
      return false
    }
    const emailCheck = isInstitutionalEmail(email)
    if (!emailCheck.valid) {
      setErr(emailCheck.reason || "Email non autorise")
      return false
    }
    if (pwd.length < 8) {
      setErr("Le mot de passe doit contenir au moins 8 caracteres.")
      return false
    }
    if (pwd !== pwdConfirm) {
      setErr("Les mots de passe ne correspondent pas.")
      return false
    }
    setErr("")
    return true
  }

  const validateStep3 = () => {
    if (!institution || !country) {
      setErr("Veuillez remplir tous les champs obligatoires.")
      return false
    }
    setErr("")
    return true
  }

  const nextStep = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
    else if (step === 3 && validateStep3()) handleSubmit()
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
    setErr("")
  }

  const handleSubmit = async () => {
    setLoading(true)
    setErr("")

    try {
      const supabase = createClient()
      
      // Upload proof file if provided
      let proofPath = null
      if (proofFile) {
        const formData = new FormData()
        formData.append('file', proofFile)
        formData.append('type', 'proof')
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          proofPath = uploadData.url
        }
      }

      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pwd,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
            institution: institution,
            country: country,
            proof_url: proofPath,
            account_status: 'pending_verification',
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErr("Un compte avec cet email existe deja.")
        } else {
          setErr(error.message)
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (e) {
      setErr("Une erreur est survenue. Veuillez reessayer.")
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#e0f2fe 0%,#f0fdf4 60%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: "20px" }}>
        <div style={{ animation: "slideUp .3s ease", width: "100%", maxWidth: 420 }}>
          <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: C.greenLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <Check size={32} color={C.green} />
            </div>
            <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: C.dark }}>Inscription reussie !</h2>
            <p style={{ color: C.gray, fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
              Un email de verification a ete envoye a <strong>{email}</strong>.<br />
              Votre compte sera actif apres verification par un administrateur.
            </p>
            <Btn full color={C.blue} onClick={() => setView("login")}>
              Retour a la connexion
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#e0f2fe 0%,#f0fdf4 60%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: "20px" }}>
      <div style={{ animation: "slideUp .3s ease", width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Logo size={44} fs={24} />
          <p style={{ color: C.gray, fontSize: 14.5, marginTop: 8 }}>Creez votre compte</p>
        </div>
        <div style={{ background: "white", borderRadius: 20, padding: "32px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9" }}>
          <StepIndicator step={step} total={3} />
          
          {err && <div style={{ background: "#fef2f2", color: C.red, padding: "10px 14px", borderRadius: 10, fontSize: 13.5, marginBottom: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><AlertCircle size={16} />{err}</div>}

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <>
              <h3 style={{ margin: "0 0 20px", fontSize: 17, fontWeight: 700, color: C.dark, textAlign: "center" }}>Vous etes...</h3>
              <div style={{ display: "flex", gap: 12 }}>
                <RoleCard
                  selected={role === 'student'}
                  onClick={() => setRole('student')}
                  icon={GraduationCap}
                  title="Etudiant"
                  desc="Etudiant en EPS"
                  color={C.blue}
                />
                <RoleCard
                  selected={role === 'teacher'}
                  onClick={() => setRole('teacher')}
                  icon={BookOpen}
                  title="Enseignant"
                  desc="Professeur d'EPS"
                  color={C.teal}
                />
              </div>
            </>
          )}

          {/* Step 2: Personal Info */}
          {step === 2 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <FormField label="Prenom" req>
                  <Inp placeholder="Jean" value={firstName} onChange={e => setFirstName(e.target.value)} icon="user" />
                </FormField>
                <FormField label="Nom" req>
                  <Inp placeholder="Dupont" value={lastName} onChange={e => setLastName(e.target.value)} icon="user" />
                </FormField>
              </div>
              <FormField label="Email institutionnel" req>
                <Inp placeholder="prenom.nom@institution.edu" value={email} onChange={e => setEmail(e.target.value)} type="email" icon="mail" />
              </FormField>
              <FormField label="Mot de passe" req>
                <Inp placeholder="Minimum 8 caracteres" value={pwd} onChange={e => setPwd(e.target.value)} type="password" icon="lock" />
              </FormField>
              <FormField label="Confirmer le mot de passe" req>
                <Inp placeholder="Confirmez votre mot de passe" value={pwdConfirm} onChange={e => setPwdConfirm(e.target.value)} type="password" icon="lock" />
              </FormField>
            </>
          )}

          {/* Step 3: Institution & Proof */}
          {step === 3 && (
            <>
              <FormField label="Institution" req>
                <Inp placeholder="Universite de Paris" value={institution} onChange={e => setInstitution(e.target.value)} />
              </FormField>
              <FormField label="Pays" req>
                <Sel value={country} onChange={e => setCountry(e.target.value)} options={COUNTRIES} placeholder="Selectionnez votre pays" />
              </FormField>
              <FormField label="Preuve d'affiliation" hint="optionnel">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <button onClick={() => fileRef.current?.click()} style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: 10,
                  border: "2px dashed #e5e7eb",
                  background: "#f9fafb",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "inherit",
                }}>
                  <Upload size={24} color={C.gray} />
                  <span style={{ fontSize: 13, color: C.gray }}>
                    {proofFile ? proofFile.name : "Carte etudiant, attestation..."}
                  </span>
                </button>
              </FormField>
              <div style={{ background: "#f0f9ff", padding: "12px 14px", borderRadius: 10, fontSize: 12.5, color: C.blue, marginTop: -6 }}>
                La preuve d'affiliation accelere la verification de votre compte.
              </div>
            </>
          )}

          {/* Navigation */}
          <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
            {step > 1 && (
              <Btn outline color={C.gray} onClick={prevStep} style={{ flex: 1 }}>
                <ChevronLeft size={18} /> Retour
              </Btn>
            )}
            <Btn color={step === 3 ? C.green : C.blue} onClick={nextStep} disabled={loading} style={{ flex: 1 }}>
              {loading ? "Inscription..." : step === 3 ? "Creer mon compte" : "Continuer"}
              {step < 3 && <ChevronRight size={18} />}
            </Btn>
          </div>

          <p style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: C.gray }}>
            {"Deja un compte ? "}
            <span onClick={() => setView("login")} style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>Se connecter</span>
          </p>
          <p style={{ textAlign: "center", marginTop: 8, fontSize: 13, color: "#9ca3af" }}>
            <span onClick={() => setView("landing")} style={{ cursor: "pointer", textDecoration: "underline" }}>{"← Retour a l'accueil"}</span>
          </p>
        </div>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 12, color: C.gray }}>
          Seuls les emails institutionnels sont autorises
        </p>
      </div>
    </div>
  )
}

// Auth error page
export function AuthErrorPage({ setView, message }: { setView: (v: string) => void; message?: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#e0f2fe 0%,#f0fdf4 60%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: "20px" }}>
      <div style={{ animation: "slideUp .3s ease", width: "100%", maxWidth: 420 }}>
        <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: C.redLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertCircle size={32} color={C.red} />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: C.dark }}>Erreur d'authentification</h2>
          <p style={{ color: C.gray, fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
            {message || "Une erreur est survenue lors de l'authentification."}
          </p>
          <Btn full color={C.blue} onClick={() => setView("login")}>
            Retour a la connexion
          </Btn>
        </div>
      </div>
    </div>
  )
}

// Pending verification page
export function PendingVerificationPage({ setView }: { setView: (v: string) => void }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg,#e0f2fe 0%,#f0fdf4 60%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", padding: "20px" }}>
      <div style={{ animation: "slideUp .3s ease", width: "100%", maxWidth: 420 }}>
        <div style={{ background: "white", borderRadius: 20, padding: "40px 36px", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", border: "1px solid #f1f5f9", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: C.amberLight, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <AlertCircle size={32} color={C.amber} />
          </div>
          <h2 style={{ margin: "0 0 12px", fontSize: 22, fontWeight: 800, color: C.dark }}>Verification en cours</h2>
          <p style={{ color: C.gray, fontSize: 14.5, lineHeight: 1.6, marginBottom: 24 }}>
            Votre compte est en attente de verification par un administrateur.<br />
            Vous recevrez un email une fois votre compte approuve.
          </p>
          <Btn full color={C.blue} onClick={() => setView("landing")}>
            Retour a l'accueil
          </Btn>
        </div>
      </div>
    </div>
  )
}
