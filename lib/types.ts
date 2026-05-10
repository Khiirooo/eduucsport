export type UserRole = 'user' | 'moderator' | 'admin'

export interface User {
  id?: string
  name: string
  email: string
  status: string
  statusFull: string
  isTeacher: boolean
  isAdmin?: boolean
  isModerator?: boolean
  role?: UserRole
  niveau: number
  points: number
  badges: number
  avatarColor: string
  avatarUrl?: string
  school?: string
  city?: string
  phone?: string
  bio?: string
  department?: string
  experience?: string
  specialite?: string
  anneeEtude?: string
  maitreDuStage?: string
  ecoleStage?: string
  institution?: string
  country?: string
  accountStatus?: 'pending_verification' | 'verified' | 'rejected'
  isSuspended?: boolean
  suspendedAt?: string
  suspendedReason?: string
  unlockedBadges: number[]
}

export interface Report {
  id: string
  reporterId: string
  reporterName: string
  targetType: 'preparation' | 'forum_post' | 'innovation' | 'user'
  targetId: string
  targetTitle?: string
  reason: string
  description?: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
  resolution?: string
}

export interface AdminLog {
  id: string
  adminId: string
  adminName: string
  action: 'delete_content' | 'edit_content' | 'hide_content' | 'delete_user' | 'suspend_user' | 'unsuspend_user' | 'change_role' | 'resolve_report' | 'warn_user' | 'approve_user' | 'reject_user'
  targetType: 'preparation' | 'forum_post' | 'innovation' | 'user' | 'report'
  targetId: string
  targetName?: string
  details?: string
  timestamp: string
}

export interface Preparation {
  id: number | string
  titre: string
  discipline: string
  classe: string
  duree: string
  objectifs: string
  competences: string
  materiel: string
  organisation: string
  deroulement: string
  differenciation: string
  published: boolean
  liked: boolean
  date: string
  auteur: string
  auteurId?: string
  isTeacher: boolean
  imported?: boolean
  fileName?: string
  fileData?: string
  fileUrl?: string
  fileType?: string
  category?: string
  location?: 'interieur' | 'exterieur' | 'les_deux'
  reglement?: string
  visibility?: 'prof' | 'eleve' | 'commun'
  score?: number
  upvotes?: number
  downvotes?: number
}

export interface Vote {
  id: string
  userId: string
  targetId: string
  targetType: 'preparation' | 'innovation' | 'forum'
  voteType: 'up' | 'down'
}

export interface Cycle {
  id: number | string
  titre: string
  discipline: string
  classe: string
  annee: string
  nbSeances: string
  dateDebut: string
  dateFin: string
  objectifs: string
  prepsLiees: Preparation[]
}

export interface Seance {
  id: number | string
  titre: string
  classe: string
  date: string
  heure: string
  duree: string
  objectifs: string
  observations: string
  notes: string
  prepLiee: Preparation | null
  prepLieeId?: string
  cycleId?: number | string
}

export interface ForumPost {
  id: number | string
  titre: string
  categorie: string
  contenu: string
  auteur: string
  auteurId?: string
  isTeacher: boolean
  date: string
  likes: number
  likedBy: string[]
  replies: number
  replyList: ForumReply[]
  score?: number
  upvotes?: number
  downvotes?: number
}

export interface ForumReply {
  id: number | string
  auteur: string
  isTeacher: boolean
  contenu: string
  date: string
}

export interface Ecole {
  id: number | string
  nom: string
  adresse: string
  description: string
  infrastructure: string
  couleur?: string
  ecolePhotos: { url: string; name: string }[]
  classes: EcoleClasse[]
  materielItems: MaterielItem[]
  checklist: ChecklistItem[]
  journal: JournalEntry[]
}

export interface EcoleClasse {
  id: number | string
  nom: string
  niveau: string
  nb: string
  eleves: Eleve[]
}

export interface Eleve {
  id: number | string
  prenom: string
  nom: string
  presences: Record<string, string>
}

export interface MaterielItem {
  id: number | string
  nom: string
  quantite: string
  categorie: string
  etat: string
  note: number
  informations: string
  photos: { url: string; name: string }[]
}

export interface ChecklistItem {
  id: number | string
  label: string
  done: boolean
}

export interface JournalEntry {
  id: number | string
  titre: string
  type: string
  date: string
  observations: string
  reflexion: string
  auteur?: string
  auteurId?: string
}

export interface Innovation {
  id: number | string
  titre: string
  categorie: string
  description: string
  date: string
  likes: number
  auteur?: string
  auteurId?: string
  isTeacher?: boolean
  score?: number
  upvotes?: number
  downvotes?: number
}

export interface Badge {
  id: number
  icon: string
  label: string
  cat: string
  desc: string
}

export const BADGES_ALL: Badge[] = [
  { id: 1, icon: "BookOpen", label: "Premiere preparation", cat: "Preparations", desc: "Creer votre premiere preparation" },
  { id: 2, icon: "Library", label: "5 preparations", cat: "Preparations", desc: "Atteindre 5 preparations" },
  { id: 3, icon: "Award", label: "15 preparations", cat: "Preparations", desc: "Atteindre 15 preparations" },
  { id: 4, icon: "Star", label: "30 preparations", cat: "Preparations", desc: "Creer 30 preparations" },
  { id: 5, icon: "Calendar", label: "Premier cycle", cat: "Cycles", desc: "Creer votre premier cycle" },
  { id: 6, icon: "CalendarDays", label: "3 cycles", cat: "Cycles", desc: "Creer 3 cycles" },
  { id: 7, icon: "RefreshCw", label: "7 cycles", cat: "Cycles", desc: "Creer 7 cycles" },
  { id: 8, icon: "BarChart3", label: "15 cycles", cat: "Cycles", desc: "Creer 15 cycles" },
  { id: 9, icon: "MessageCircle", label: "Premier post forum", cat: "Communaute", desc: "Publier votre premiere question" },
  { id: 10, icon: "CheckCircle", label: "Premiere publication", cat: "Communaute", desc: "Publier une preparation" },
  { id: 11, icon: "Heart", label: "10 likes recus", cat: "Communaute", desc: "Recevoir 10 likes" },
  { id: 12, icon: "Users", label: "Collaborateur", cat: "Communaute", desc: "Lier 5 preparations a des cycles" },
  { id: 13, icon: "Trophy", label: "Champion", cat: "Progression", desc: "Atteindre le niveau 5" },
  { id: 14, icon: "FileText", label: "5 seances", cat: "Progression", desc: "Enregistrer 5 seances" },
  { id: 15, icon: "Rocket", label: "Lance", cat: "Progression", desc: "Atteindre le niveau 3" },
  { id: 16, icon: "Dumbbell", label: "Perseverant", cat: "Progression", desc: "20 seances journal" },
  { id: 17, icon: "UserPlus", label: "Bienvenue", cat: "Profil", desc: "Creer votre compte" },
  { id: 18, icon: "UserCheck", label: "Complet", cat: "Profil", desc: "Profil complete" },
  { id: 19, icon: "School", label: "En stage", cat: "Profil", desc: "1ere ecole ajoutee" },
  { id: 20, icon: "Camera", label: "Photo de profil", cat: "Profil", desc: "Ajouter une photo de profil" },
]

export const DISCIPLINES = [
  "Athletisme", "Natation", "Gymnastique", "Sports collectifs", "Arts martiaux",
  "Danse", "Badminton", "Tennis", "Football", "Plein air", "Volleyball", "Basketball"
]

export const CATEGORIES = [
  "Echauffement", "Jeu collectif", "Jeu individuel", "Circuit", "Evaluation",
  "Technique", "Tactique", "Condition physique", "Relaxation", "Competition"
]

export const LOCATIONS = [
  { value: "interieur", label: "Interieur" },
  { value: "exterieur", label: "Exterieur" },
  { value: "les_deux", label: "Les deux" }
]

export const VISIBILITIES = [
  { value: "commun", label: "Tout le monde" },
  { value: "prof", label: "Enseignants uniquement" },
  { value: "eleve", label: "Etudiants uniquement" }
]

export const LEVELS = [
  { level: 1, pts: 200, label: "Debutant" },
  { level: 2, pts: 400, label: "Apprenti" },
  { level: 3, pts: 700, label: "Confirme" },
  { level: 4, pts: 1200, label: "Expert" },
  { level: 5, pts: 2000, label: "Maitre EPS" },
]
