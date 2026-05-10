"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { createClient } from "./supabase/client"
import type {
  User, Preparation, Cycle, Seance, ForumPost,
  Ecole, Innovation, Vote
} from "./types"

/* ─── Context ─── */
interface AppState {
  user: User | null
  preps: Preparation[]
  cycles: Cycle[]
  seances: Seance[]
  posts: ForumPost[]
  ecoles: Ecole[]
  innovations: Innovation[]
  votes: Vote[]
  toastMsg: string
  likedPrepIds: string[]
  likedCommunityIds: string[]
  hydrated: boolean
  loading: boolean
}

interface AppActions {
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  setPreps: React.Dispatch<React.SetStateAction<Preparation[]>>
  setCycles: React.Dispatch<React.SetStateAction<Cycle[]>>
  setSeances: React.Dispatch<React.SetStateAction<Seance[]>>
  setPosts: React.Dispatch<React.SetStateAction<ForumPost[]>>
  setEcoles: React.Dispatch<React.SetStateAction<Ecole[]>>
  setInnovations: React.Dispatch<React.SetStateAction<Innovation[]>>
  setVotes: React.Dispatch<React.SetStateAction<Vote[]>>
  toast: (msg: string) => void
  addPoints: (pts: number, reason: string) => void
  unlockBadge: (badgeId: number) => void
  toggleLikePrep: (id: string | number) => void
  toggleLikeCommunity: (id: string) => void
  isPrepLiked: (id: string | number) => boolean
  isCommunityLiked: (id: string) => boolean
  loadUserData: (userId: string) => Promise<void>
  savePreparation: (prep: Preparation) => Promise<boolean>
  deletePreparation: (id: string | number) => Promise<void>
  saveCycle: (cycle: Cycle) => Promise<boolean>
  deleteCycle: (id: string | number) => Promise<void>
  saveSeance: (seance: Seance) => Promise<boolean>
  deleteSeance: (id: string | number) => Promise<void>
  saveForumPost: (post: ForumPost) => Promise<boolean>
  deleteForumPost: (id: string | number) => Promise<void>
  saveEcole: (ecole: Ecole) => Promise<boolean>
  deleteEcole: (id: string | number) => Promise<void>
  saveInnovation: (innovation: Innovation) => Promise<boolean>
  deleteInnovation: (id: string | number) => Promise<void>
}

const AppContext = createContext<(AppState & AppActions) | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [preps, setPreps] = useState<Preparation[]>([])
  const [cycles, setCycles] = useState<Cycle[]>([])
  const [seances, setSeances] = useState<Seance[]>([])
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [innovations, setInnovations] = useState<Innovation[]>([])
  const [votes, setVotes] = useState<Vote[]>([])
  const [toastMsg, setToastMsg] = useState("")
  const [likedPrepIds, setLikedPrepIds] = useState<string[]>([])
  const [likedCommunityIds, setLikedCommunityIds] = useState<string[]>([])

  const supabase = createClient()

  // ─── Load user data from API ───
  const loadUserData = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      // Load preparations via API
      const prepsRes = await fetch(`/api/preparations?filter=mine&userId=${userId}`)
      const prepsJson = await prepsRes.json()
      if (prepsJson.preparations) {
        setPreps(prepsJson.preparations.map((p: any) => ({
          id: p.id,
          titre: p.titre || '',
          discipline: p.discipline || '',
          classe: p.classe || '',
          duree: String(p.duree || ''),
          objectifs: p.objectifs || '',
          competences: '',
          materiel: p.materiel || '',
          organisation: '',
          deroulement: p.deroulement || '',
          differenciation: '',
          published: p.is_published || false,
          liked: false,
          date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
          auteur: p.profiles ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() : '',
          auteurId: p.user_id,
          isTeacher: p.profiles?.role === 'teacher',
          visibility: p.visibility || 'commun',
          score: p.score || 0,
          category: p.category,
          location: p.location,
          reglement: p.reglement,
          fileUrl: p.file_url,
          fileType: p.file_type,
        })))
      }

      // Load cycles via API
      const cyclesRes = await fetch(`/api/cycles?userId=${userId}`)
      const cyclesJson = await cyclesRes.json()
      if (cyclesJson.cycles) {
        setCycles(cyclesJson.cycles.map((c: any) => ({
          id: c.id,
          titre: c.titre || '',
          discipline: c.discipline || '',
          classe: c.classe || '',
          annee: c.annee || '',
          dateDebut: c.date_debut || '',
          dateFin: c.date_fin || '',
          nbSeances: c.nb_seances || 0,
          objectifs: c.objectifs || '',
          prepsLiees: c.preps_liees || [],
        })))
      }

      // Load seances via API
      const seancesRes = await fetch(`/api/seances?userId=${userId}`)
      const seancesJson = await seancesRes.json()
      if (seancesJson.seances) {
        setSeances(seancesJson.seances.map((s: any) => ({
          id: s.id,
          titre: s.titre || '',
          date: s.date || '',
          heure: s.heure || '',
          duree: s.duree || 0,
          classe: s.classe || '',
          objectifs: s.objectifs || '',
          prepLieeId: s.prep_liee_id,
          prepLiee: null,
          notes: s.notes || '',
          observations: s.observations || '',
        })))
      }

      // Load ecoles via API
      const ecolesRes = await fetch(`/api/ecoles?userId=${userId}`)
      const ecolesJson = await ecolesRes.json()
      if (ecolesJson.ecoles) {
        setEcoles(ecolesJson.ecoles.map((e: any) => ({
          id: e.id,
          nom: e.nom || '',
          adresse: e.adresse || '',
          description: e.description || '',
          infrastructure: e.infrastructure || '',
          couleur: e.couleur || '#0d9488',
          classes: e.classes || [],
          materielItems: e.materiel || [],
          journal: e.journal || [],
          ecolePhotos: e.ecole_photos || [],
          checklist: e.checklist || [],
        })))
      }

      // Load forum posts via API
      const forumRes = await fetch(`/api/forum`)
      const forumJson = await forumRes.json()
      if (forumJson.posts) {
        setPosts(forumJson.posts.map((p: any) => ({
          id: p.id,
          titre: p.titre || '',
          categorie: p.category || '',
          contenu: p.contenu || '',
          auteur: p.profiles ? `${p.profiles.first_name || ''} ${p.profiles.last_name || ''}`.trim() : '',
          auteurId: p.user_id,
          isTeacher: p.profiles?.role === 'teacher',
          date: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '',
          likes: p.likes || 0,
          likedBy: p.liked_by || [],
          replies: p.replies_count || 0,
          replyList: p.reply_list || [],
          score: p.score || 0,
        })))
      }

      // Load innovations via API
      const innovRes = await fetch(`/api/innovations`)
      const innovJson = await innovRes.json()
      if (innovJson.innovations) {
        setInnovations(innovJson.innovations.map((i: any) => ({
          id: i.id,
          titre: i.titre || '',
          categorie: i.category || '',
          description: i.description || '',
          auteur: i.profiles ? `${i.profiles.first_name || ''} ${i.profiles.last_name || ''}`.trim() : '',
          auteurId: i.user_id,
          isTeacher: i.profiles?.role === 'teacher',
          date: i.created_at ? new Date(i.created_at).toLocaleDateString('fr-FR') : '',
          likes: i.likes || 0,
          score: i.score || 0,
        })))
      }

    } catch (err) {
      console.error('Error loading user data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Save preparation via API ───
  const savePreparation = useCallback(async (prep: Preparation): Promise<boolean> => {
    try {
      const isExisting = typeof prep.id === 'string' && prep.id.includes('-')
      
      const body = {
        id: isExisting ? prep.id : undefined,
        titre: prep.titre,
        discipline: prep.discipline,
        classe: prep.classe,
        duree: parseInt(prep.duree) || 0,
        objectifs: prep.objectifs,
        materiel: prep.materiel,
        deroulement: prep.deroulement,
        is_published: prep.published || false,
        category: prep.category,
        location: prep.location,
        reglement: prep.reglement,
        visibility: prep.visibility || 'commun',
        file_url: prep.fileUrl,
        file_type: prep.fileType,
      }

      const res = await fetch('/api/preparations', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      
      if (!res.ok) {
        console.error('Erreur sauvegarde preparation:', json.error)
        return false
      }

      if (json.preparation) {
        const newPrep = {
          ...prep,
          id: json.preparation.id,
        }
        setPreps(prev => {
          const existing = prev.findIndex(p => p.id === prep.id || p.id === json.preparation.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newPrep
            return updated
          }
          return [...prev, newPrep]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving preparation:', err)
      return false
    }
  }, [])

  // ─── Delete preparation via API ───
  const deletePreparation = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/preparations?id=${id}`, { method: 'DELETE' })
      setPreps(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting preparation:', err)
    }
  }, [])

  // ─── Save cycle via API ───
  const saveCycle = useCallback(async (cycle: Cycle): Promise<boolean> => {
    try {
      const isExisting = typeof cycle.id === 'string' && cycle.id.includes('-')
      
      const body = {
        id: isExisting ? cycle.id : undefined,
        titre: cycle.titre,
        discipline: cycle.discipline,
        classe: cycle.classe,
        annee: cycle.annee || '',
        date_debut: cycle.dateDebut || null,
        date_fin: cycle.dateFin || null,
        nb_seances: cycle.nbSeances || 0,
        objectifs: cycle.objectifs,
        preps_liees: cycle.prepsLiees || [],
      }

      const res = await fetch('/api/cycles', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) return false

      if (json.cycle) {
        const newCycle = { ...cycle, id: json.cycle.id }
        setCycles(prev => {
          const existing = prev.findIndex(c => c.id === cycle.id || c.id === json.cycle.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newCycle
            return updated
          }
          return [...prev, newCycle]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving cycle:', err)
      return false
    }
  }, [])

  // ─── Delete cycle via API ───
  const deleteCycle = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/cycles?id=${id}`, { method: 'DELETE' })
      setCycles(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting cycle:', err)
    }
  }, [])

  // ─── Save seance via API ───
  const saveSeance = useCallback(async (seance: Seance): Promise<boolean> => {
    try {
      const isExisting = typeof seance.id === 'string' && seance.id.includes('-')
      
      const body = {
        id: isExisting ? seance.id : undefined,
        titre: seance.titre,
        date: seance.date || null,
        heure: seance.heure || null,
        duree: seance.duree || 0,
        classe: seance.classe,
        objectifs: seance.objectifs,
        prep_liee_id: seance.prepLieeId || null,
        notes: seance.notes,
        observations: seance.observations,
      }

      const res = await fetch('/api/seances', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) return false

      if (json.seance) {
        const newSeance = { ...seance, id: json.seance.id }
        setSeances(prev => {
          const existing = prev.findIndex(s => s.id === seance.id || s.id === json.seance.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newSeance
            return updated
          }
          return [...prev, newSeance]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving seance:', err)
      return false
    }
  }, [])

  // ─── Delete seance via API ───
  const deleteSeance = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/seances?id=${id}`, { method: 'DELETE' })
      setSeances(prev => prev.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting seance:', err)
    }
  }, [])

  // ─── Save forum post via API ───
  const saveForumPost = useCallback(async (post: ForumPost): Promise<boolean> => {
    try {
      const isExisting = typeof post.id === 'string' && post.id.includes('-')
      
      const body = {
        id: isExisting ? post.id : undefined,
        titre: post.titre,
        category: post.categorie,
        contenu: post.contenu,
      }

      const res = await fetch('/api/forum', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) return false

      if (json.post) {
        const newPost = { ...post, id: json.post.id }
        setPosts(prev => {
          const existing = prev.findIndex(p => p.id === post.id || p.id === json.post.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newPost
            return updated
          }
          return [...prev, newPost]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving forum post:', err)
      return false
    }
  }, [])

  // ─── Delete forum post via API ───
  const deleteForumPost = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/forum?id=${id}`, { method: 'DELETE' })
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting forum post:', err)
    }
  }, [])

  // ─── Save ecole via API ───
  const saveEcole = useCallback(async (ecole: Ecole): Promise<boolean> => {
    try {
      const isExisting = typeof ecole.id === 'string' && ecole.id.includes('-')
      
      const body = {
        id: isExisting ? ecole.id : undefined,
        nom: ecole.nom,
        adresse: ecole.adresse,
        description: ecole.description || '',
        infrastructure: ecole.infrastructure || '',
        couleur: ecole.couleur,
        classes: ecole.classes || [],
        materiel: ecole.materielItems || [],
        journal: ecole.journal || [],
        ecole_photos: ecole.ecolePhotos || [],
        checklist: ecole.checklist || [],
      }

      const res = await fetch('/api/ecoles', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) return false

      if (json.ecole) {
        const newEcole = { ...ecole, id: json.ecole.id }
        setEcoles(prev => {
          const existing = prev.findIndex(e => e.id === ecole.id || e.id === json.ecole.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newEcole
            return updated
          }
          return [...prev, newEcole]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving ecole:', err)
      return false
    }
  }, [])

  // ─── Delete ecole via API ───
  const deleteEcole = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/ecoles?id=${id}`, { method: 'DELETE' })
      setEcoles(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      console.error('Error deleting ecole:', err)
    }
  }, [])

  // ─── Save innovation via API ───
  const saveInnovation = useCallback(async (innovation: Innovation): Promise<boolean> => {
    try {
      const isExisting = typeof innovation.id === 'string' && innovation.id.includes('-')
      
      const body = {
        id: isExisting ? innovation.id : undefined,
        titre: innovation.titre,
        category: innovation.categorie,
        description: innovation.description,
      }

      const res = await fetch('/api/innovations', {
        method: isExisting ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const json = await res.json()
      if (!res.ok) return false

      if (json.innovation) {
        const newInnovation = { ...innovation, id: json.innovation.id }
        setInnovations(prev => {
          const existing = prev.findIndex(i => i.id === innovation.id || i.id === json.innovation.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = newInnovation
            return updated
          }
          return [...prev, newInnovation]
        })
      }
      return true
    } catch (err) {
      console.error('Error saving innovation:', err)
      return false
    }
  }, [])

  // ─── Delete innovation via API ───
  const deleteInnovation = useCallback(async (id: string | number) => {
    try {
      await fetch(`/api/innovations?id=${id}`, { method: 'DELETE' })
      setInnovations(prev => prev.filter(i => i.id !== id))
    } catch (err) {
      console.error('Error deleting innovation:', err)
    }
  }, [])

  // ─── Toast ───
  const toast = useCallback((msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(""), 3000)
  }, [])

  // ─── Points ───
  const addPoints = useCallback(async (pts: number, _reason: string) => {
    if (!user?.id) return
    
    // Update local state optimistically
    setUser(u => u ? { ...u, points: (u.points || 0) + pts } : u)
    
    // Update points in database using increment to avoid race conditions
    try {
      const { data: current } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single()
      
      await supabase
        .from('profiles')
        .update({ points: (current?.points || 0) + pts })
        .eq('id', user.id)
    } catch (err) {
      console.error('Error updating points:', err)
    }
  }, [user, supabase])

  // ─── Badge ───
  const unlockBadge = useCallback((badgeId: number) => {
    setUser(u => {
      if (!u) return u
      const badges = u.unlockedBadges || []
      if (badges.includes(badgeId)) return u
      return { ...u, unlockedBadges: [...badges, badgeId] }
    })
  }, [])

  // ─── Likes ───
  const toggleLikePrep = useCallback((id: string | number) => {
    const strId = String(id)
    setLikedPrepIds(prev =>
      prev.includes(strId) ? prev.filter(x => x !== strId) : [...prev, strId]
    )
  }, [])

  const toggleLikeCommunity = useCallback((id: string) => {
    setLikedCommunityIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }, [])

  const isPrepLiked = useCallback((id: string | number) => likedPrepIds.includes(String(id)), [likedPrepIds])
  const isCommunityLiked = useCallback((id: string) => likedCommunityIds.includes(id), [likedCommunityIds])

  // ─── Initialize session on mount ───
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            const isAdmin = profile.is_admin === true || profile.user_role === 'admin' || profile.role === 'admin'
            const isMod = profile.user_role === 'moderator'

            setUser({
              id: session.user.id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || session.user.email?.split('@')[0] || '',
              email: session.user.email || '',
              status: profile.role === 'teacher' || isAdmin ? 'Enseignant EPS' : 'Etudiant EPS',
              statusFull: profile.role === 'teacher' || isAdmin ? 'Enseignant EPS' : 'Etudiant EPS',
              isTeacher: profile.role === 'teacher' || isAdmin,
              isAdmin,
              isModerator: isMod,
              role: isAdmin ? 'admin' : (isMod ? 'moderator' : 'user'),
              niveau: 1,
              points: profile.points || 0,
              badges: 1,
              avatarColor: profile.role === 'teacher' ? '#0d9488' : '#2563eb',
              unlockedBadges: profile.unlocked_badges || [17],
              institution: profile.institution,
              country: profile.country,
            })

            // Load user data
            await loadUserData(session.user.id)
          }
        }
      } catch (err) {
        console.error('Error initializing session:', err)
      } finally {
        setHydrated(true)
      }
    }

    initSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setPreps([])
        setCycles([])
        setSeances([])
        setPosts([])
        setEcoles([])
        setInnovations([])
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Reload data on sign in
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profile) {
          const isAdmin = profile.is_admin === true || profile.user_role === 'admin' || profile.role === 'admin'
          const isMod = profile.user_role === 'moderator'

          setUser({
            id: session.user.id,
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || session.user.email?.split('@')[0] || '',
            email: session.user.email || '',
            status: profile.role === 'teacher' || isAdmin ? 'Enseignant EPS' : 'Etudiant EPS',
            statusFull: profile.role === 'teacher' || isAdmin ? 'Enseignant EPS' : 'Etudiant EPS',
            isTeacher: profile.role === 'teacher' || isAdmin,
            isAdmin,
            isModerator: isMod,
            role: isAdmin ? 'admin' : (isMod ? 'moderator' : 'user'),
            niveau: 1,
            points: profile.points || 0,
            badges: 1,
            avatarColor: profile.role === 'teacher' ? '#0d9488' : '#2563eb',
            unlockedBadges: profile.unlocked_badges || [17],
            institution: profile.institution,
            country: profile.country,
          })

          await loadUserData(session.user.id)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [loadUserData, supabase])

  return (
    <AppContext.Provider value={{
      user, preps, cycles, seances, posts, ecoles, innovations, votes, toastMsg,
      likedPrepIds, likedCommunityIds, hydrated, loading,
      setUser, setPreps, setCycles, setSeances, setPosts, setEcoles, setInnovations, setVotes,
      toast, addPoints, unlockBadge, toggleLikePrep, toggleLikeCommunity, isPrepLiked, isCommunityLiked,
      loadUserData, savePreparation, deletePreparation, saveCycle, deleteCycle, 
      saveSeance, deleteSeance, saveForumPost, deleteForumPost,
      saveEcole, deleteEcole, saveInnovation, deleteInnovation,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be within AppProvider")
  return ctx
}
