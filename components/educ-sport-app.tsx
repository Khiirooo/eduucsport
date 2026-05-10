"use client"

import React, { useState, useEffect } from "react"
import { useApp } from "@/lib/store"
import { Toast } from "@/components/ui-atoms"
import { LandingPage } from "@/components/landing-page"
import { LoginPage, SignupPage, AuthErrorPage, PendingVerificationPage } from "@/components/auth-pages"
import { DashboardNav } from "@/components/dashboard-nav"
import { PageAccueil } from "@/components/page-accueil"
import { PagePreparations } from "@/components/page-preparations"
import { PageCycles } from "@/components/page-cycles"
import { PageJournal } from "@/components/page-journal"
import { PageIA } from "@/components/page-ia"
import { PageForum } from "@/components/page-forum"
import { PageEcole } from "@/components/page-ecole"
import { PageInnovations } from "@/components/page-innovations"
import { PageProfil } from "@/components/page-profil"
import { PageAdmin } from "@/components/page-admin"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/lib/types"

export function EducSportApp() {
  const {
    user, setUser, preps, setPreps, cycles, setCycles, seances, setSeances,
    posts, setPosts, ecoles, setEcoles, innovations, setInnovations,
    votes, setVotes, toastMsg, toast, addPoints, unlockBadge, hydrated,
    toggleLikePrep, toggleLikeCommunity, isPrepLiked, isCommunityLiked,
    loadUserData, savePreparation, deletePreparation, saveCycle, deleteCycle,
    saveSeance, deleteSeance, saveForumPost, deleteForumPost, saveEcole, deleteEcole,
    saveInnovation, deleteInnovation,
  } = useApp()

  const [view, setView] = useState<"landing" | "login" | "signup" | "dashboard" | "error" | "pending">("landing")
  const [page, setPage] = useState("accueil")
  const [authError, setAuthError] = useState<string | undefined>()

  /* Auto-restore session - the store already loads user data, we just set the view */
  useEffect(() => {
    if (hydrated && user) {
      setView("dashboard")
    }
  }, [hydrated, user])

  /* Listen for auth state changes */
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setView("landing")
      }
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  const onLogin = async (u: User) => { 
    setUser(u)
    if (u.id) await loadUserData(u.id)
    setView("dashboard")
    setPage("accueil")
  }
  const onLogout = async () => { 
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setView("landing")
    setPage("accueil") 
  }

  /* Show nothing until hydrated to avoid flash */
  if (!hydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e5e7eb", borderTopColor: "#0d9488", borderRadius: "50%", animation: "spin 0.6s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 600, fontSize: 14, color: "#6b7280" }}>Chargement...</div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  if (view === "landing") return <LandingPage setView={setView} />
  if (view === "login") return <LoginPage setView={setView} onLogin={onLogin} />
  if (view === "signup") return <SignupPage setView={setView} onLogin={onLogin} />
  if (view === "error") return <AuthErrorPage setView={setView} message={authError} />
  if (view === "pending") return <PendingVerificationPage setView={setView} />

  const pages: Record<string, React.ReactNode> = {
    accueil: <PageAccueil user={user!} setPage={setPage} preps={preps} cycles={cycles} ecoles={ecoles} seances={seances} />,
    preparations: <PagePreparations preps={preps} setPreps={setPreps} toast={toast} user={user!} addPoints={addPoints} toggleLikePrep={toggleLikePrep} isPrepLiked={isPrepLiked} savePreparation={savePreparation} deletePreparation={deletePreparation} />,
    cycles: <PageCycles cycles={cycles} setCycles={setCycles} preps={preps} seances={seances} toast={toast} setPage={setPage} addPoints={addPoints} user={user!} isPrepLiked={isPrepLiked} saveCycle={saveCycle} deleteCycle={deleteCycle} />,
    journal: <PageJournal seances={seances} setSeances={setSeances} preps={preps} cycles={cycles} toast={toast} addPoints={addPoints} isPrepLiked={isPrepLiked} saveSeance={saveSeance} deleteSeance={deleteSeance} />,
    ia: <PageIA />,
    forum: <PageForum posts={posts} setPosts={setPosts} toast={toast} user={user!} addPoints={addPoints} votes={votes} setVotes={setVotes} saveForumPost={saveForumPost} deleteForumPost={deleteForumPost} />,
    ecole: <PageEcole ecoles={ecoles} setEcoles={setEcoles} toast={toast} addPoints={addPoints} user={user!} saveEcole={saveEcole} deleteEcole={deleteEcole} />,
    innovations: <PageInnovations innovations={innovations} setInnovations={setInnovations} toast={toast} user={user!} votes={votes} setVotes={setVotes} saveInnovation={saveInnovation} deleteInnovation={deleteInnovation} />,
    profil: <PageProfil user={user!} setUser={setUser} toast={toast} onLogout={onLogout} preps={preps} cycles={cycles} seances={seances} ecoles={ecoles} isPrepLiked={isPrepLiked} />,
    admin: <PageAdmin user={user!} preps={preps} posts={posts} innovations={innovations} setPreps={setPreps} setPosts={setPosts} setInnovations={setInnovations} />,
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom,#f0f4f8 0%,#f0fdf4 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <style>{`* {box-sizing:border-box} @keyframes slideUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <DashboardNav page={page} setPage={setPage} user={user!} onLogout={onLogout} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px", animation: "slideUp .2s ease" }} key={page}>
        {pages[page] || pages.accueil}
      </div>
      <Toast msg={toastMsg} onClose={() => toast("")} />
    </div>
  )
}
