// Dictionnaire de corrections automatiques pour le francais
const CORRECTIONS: Record<string, string> = {
  // Accents manquants
  "ecole": "ecole",
  "eleve": "eleve",
  "preparation": "preparation",
  "education": "education",
  "activite": "activite",
  "seance": "seance",
  "exercice": "exercice",
  "materiel": "materiel",
  "objectif": "objectif",
  "evaluation": "evaluation",
  "pedagogie": "pedagogie",
  "athletisme": "athletisme",
  "gymnastique": "gymnastique",
  "competition": "competition",
  "entrainement": "entrainement",
  "echauffement": "echauffement",
  "etirement": "etirement",
  "difficulte": "difficulte",
  "securite": "securite",
  "velocite": "velocite",
  "agilite": "agilite",
  "endurance": "endurance",
  "resistance": "resistance",
  "equipement": "equipement",
  "organisation": "organisation",
  "planification": "planification",
  "progression": "progression",
  "differentiation": "differentiation",
  "autonomie": "autonomie",
  "cooperation": "cooperation",
  "creativite": "creativite",
  "motricite": "motricite",
  
  // Fautes courantes
  "peux tu": "peux-tu",
  "peut etre": "peut-etre",
  "c est": "c'est",
  "j ai": "j'ai",
  "l eleve": "l'eleve",
  "d abord": "d'abord",
  "qu est ce": "qu'est-ce",
  "n est pas": "n'est pas",
  "s il": "s'il",
  "aujourd hui": "aujourd'hui",
  
  // Erreurs de frappe communes
  "teh": "the",
  "adn": "and",
  "fo": "of",
  "hte": "the",
  
  // Conjugaisons
  "il a fait": "il a fait",
  "ils ont fait": "ils ont fait",
  
  // Apostrophes
  "l'ecole": "l'ecole",
  "l'eleve": "l'eleve",
  "l'activite": "l'activite",
  "l'exercice": "l'exercice",
  "l'objectif": "l'objectif",
  "l'organisation": "l'organisation",
  "l'entrainement": "l'entrainement",
  "l'evaluation": "l'evaluation",
  "l'enseignant": "l'enseignant",
  "l'etudiant": "l'etudiant",
  
  // Majuscules pour noms propres
  "belgique": "Belgique",
  "france": "France",
  "fwb": "FWB",
  "eps": "EPS",
}

// Mots avec accents corrects
const ACCENT_WORDS: Record<string, string> = {
  "a": "a", // contexte: preposition
  "ou": "ou", // contexte: relatif
  "la": "la", // contexte: adverbe
  "ca": "ca",
  "deja": "deja",
  "tres": "tres",
  "apres": "apres",
  "pres": "pres",
  "eleves": "eleves",
  "ecoles": "ecoles",
  "annee": "annee",
  "annees": "annees",
  "premiere": "premiere",
  "deuxieme": "deuxieme",
  "troisieme": "troisieme",
  "quatrieme": "quatrieme",
  "cinquieme": "cinquieme",
  "sixieme": "sixieme",
  "secondaire": "secondaire",
  "primaire": "primaire",
  "regle": "regle",
  "regles": "regles",
  "reglement": "reglement",
  "metre": "metre",
  "metres": "metres",
  "minute": "minute",
  "minutes": "minutes",
  "equipe": "equipe",
  "equipes": "equipes",
  "cote": "cote",
  "numero": "numero",
  "general": "general",
  "generaux": "generaux",
  "special": "special",
  "specifique": "specifique",
  "theorique": "theorique",
  "pratique": "pratique",
  "technique": "technique",
  "tactique": "tactique",
  "physique": "physique",
  "psychologique": "psychologique",
  "sociologique": "sociologique",
  "pedagogique": "pedagogique",
  "didactique": "didactique",
  "methodologique": "methodologique",
  "strategique": "strategique",
}

/**
 * Corrige automatiquement les fautes courantes et ajoute les accents manquants
 */
export function correctText(text: string): string {
  if (!text) return text
  
  let corrected = text
  
  // Appliquer les corrections directes
  Object.entries(CORRECTIONS).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    corrected = corrected.replace(regex, right)
  })
  
  // Appliquer les corrections d'accents
  Object.entries(ACCENT_WORDS).forEach(([word, correctedWord]) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    corrected = corrected.replace(regex, (match) => {
      // Preserver la casse originale
      if (match[0] === match[0].toUpperCase()) {
        return correctedWord.charAt(0).toUpperCase() + correctedWord.slice(1)
      }
      return correctedWord
    })
  })
  
  // Corriger les espaces multiples
  corrected = corrected.replace(/\s+/g, ' ')
  
  // Corriger la ponctuation (espace avant : ; ? !)
  corrected = corrected.replace(/\s*([;:?!])/g, ' $1')
  
  // Capitaliser apres un point
  corrected = corrected.replace(/\.\s+([a-z])/g, (match, letter) => `. ${letter.toUpperCase()}`)
  
  // Capitaliser la premiere lettre
  if (corrected.length > 0) {
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1)
  }
  
  return corrected.trim()
}

/**
 * Verifie si le texte contient des erreurs potentielles
 */
export function hasErrors(text: string): boolean {
  if (!text) return false
  
  const corrected = correctText(text)
  return corrected !== text
}

/**
 * Retourne les suggestions de correction pour un texte
 */
export function getSuggestions(text: string): { original: string; suggestion: string }[] {
  if (!text) return []
  
  const suggestions: { original: string; suggestion: string }[] = []
  
  Object.entries(CORRECTIONS).forEach(([wrong, right]) => {
    const regex = new RegExp(`\\b${wrong}\\b`, 'gi')
    const matches = text.match(regex)
    if (matches) {
      matches.forEach(match => {
        if (match.toLowerCase() !== right.toLowerCase()) {
          suggestions.push({ original: match, suggestion: right })
        }
      })
    }
  })
  
  return suggestions
}
