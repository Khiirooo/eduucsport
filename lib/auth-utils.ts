// Institutional email validation
// Block personal email providers (Gmail, Yahoo, Hotmail, etc.)

const BLOCKED_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'yahoo.fr',
  'yahoo.co.uk',
  'hotmail.com',
  'hotmail.fr',
  'outlook.com',
  'live.com',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'protonmail.com',
  'proton.me',
  'mail.com',
  'gmx.com',
  'gmx.fr',
  'zoho.com',
  'yandex.com',
  'tutanota.com',
  'fastmail.com',
]

// Common institutional domain patterns
const INSTITUTIONAL_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2}$/i,
  /\.ac\.[a-z]{2}$/i,
  /\.univ-.*\.[a-z]{2}$/i,
  /\.u-.*\.[a-z]{2}$/i,
  /universi/i,
  /college/i,
  /school/i,
  /ecole/i,
  /lycee/i,
  /academie/i,
  /\.gouv\./i,
  /\.gov\./i,
  /hefr\.ch/i,
  /hep.*\.ch/i,
]

export function isInstitutionalEmail(email: string): { valid: boolean; reason?: string } {
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) {
    return { valid: false, reason: 'Email invalide' }
  }
  
  // Check if it's a blocked personal email provider
  if (BLOCKED_DOMAINS.includes(domain)) {
    return { 
      valid: false, 
      reason: 'Les adresses email personnelles (Gmail, Yahoo, Hotmail, etc.) ne sont pas autorisees. Veuillez utiliser votre email institutionnel.' 
    }
  }
  
  // Check for institutional patterns (optional, for extra validation)
  const isLikelyInstitutional = INSTITUTIONAL_PATTERNS.some(pattern => pattern.test(domain))
  
  // For now, we accept any non-blocked domain
  // In production, you might want to be stricter
  return { valid: true }
}

// Detect role from email domain
export function detectRoleFromEmail(email: string): 'teacher' | 'student' | null {
  const domain = email.split('@')[1]?.toLowerCase()
  
  if (!domain) return null
  
  // Common patterns for student emails
  const studentPatterns = [
    /student\./i,
    /etu\./i,
    /etudiant/i,
    /eleve/i,
    /edu\..*student/i,
  ]
  
  // Common patterns for teacher/staff emails
  const teacherPatterns = [
    /staff\./i,
    /prof\./i,
    /teacher/i,
    /enseignant/i,
    /admin\./i,
    /personnel/i,
  ]
  
  const localPart = email.split('@')[0]?.toLowerCase() || ''
  const fullCheck = `${localPart}@${domain}`
  
  if (studentPatterns.some(p => p.test(fullCheck) || p.test(domain))) {
    return 'student'
  }
  
  if (teacherPatterns.some(p => p.test(fullCheck) || p.test(domain))) {
    return 'teacher'
  }
  
  // Default: cannot determine, user must choose
  return null
}

// Text auto-correction for French
const CORRECTIONS: Record<string, string> = {
  // Common missing accents
  'education': 'education',
  'eleve': 'eleve',
  'ecole': 'ecole',
  'etudiant': 'etudiant',
  'preparation': 'preparation',
  'seance': 'seance',
  'activite': 'activite',
  'materiel': 'materiel',
  'categorie': 'categorie',
  'regle': 'regle',
  'reglement': 'reglement',
  'interieur': 'interieur',
  'exterieur': 'exterieur',
  'equipe': 'equipe',
  'general': 'general',
  'specialise': 'specialise',
  'annee': 'annee',
  'journee': 'journee',
  'entree': 'entree',
  'creer': 'creer',
  'ajouter': 'ajouter',
  'modifier': 'modifier',
  'supprimer': 'supprimer',
}

export function autoCorrectText(text: string): string {
  if (!text) return text
  
  let corrected = text
  
  // Apply corrections (case-insensitive but preserve original case)
  Object.entries(CORRECTIONS).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    corrected = corrected.replace(regex, (match) => {
      // Preserve original capitalization
      if (match[0] === match[0].toUpperCase()) {
        return right.charAt(0).toUpperCase() + right.slice(1)
      }
      return right
    })
  })
  
  return corrected
}

// Countries list for signup
export const COUNTRIES = [
  'Belgique',
  'France',
  'Suisse',
  'Canada',
  'Luxembourg',
  'Monaco',
  'Maroc',
  'Tunisie',
  'Algerie',
  'Senegal',
  'Cote d\'Ivoire',
  'Cameroun',
  'Autre',
]
