'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isInstitutionalEmail } from '@/lib/auth-utils'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const role = formData.get('role') as 'teacher' | 'student'
  const institution = formData.get('institution') as string
  const country = formData.get('country') as string
  const proofPath = formData.get('proofPath') as string | null

  // Validate institutional email
  const emailCheck = isInstitutionalEmail(email)
  if (!emailCheck.valid) {
    return { error: emailCheck.reason }
  }

  // Check for duplicate email in profiles
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .single()

  if (existingProfile) {
    return { error: 'Un compte avec cet email existe deja.' }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: {
        first_name: firstName,
        last_name: lastName,
        role: role,
        institution: institution,
        country: country,
        proof_url: proofPath || null,
        account_status: 'pending_verification',
      },
    },
  })

  if (error) {
    console.error('Signup error:', error)
    return { error: error.message }
  }

  return { success: true, message: 'Verifiez votre email pour confirmer votre compte.' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validate institutional email
  const emailCheck = isInstitutionalEmail(email)
  if (!emailCheck.valid) {
    return { error: emailCheck.reason }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Email ou mot de passe incorrect.' }
  }

  // Check account status
  const { data: profile } = await supabase
    .from('profiles')
    .select('account_status, role')
    .eq('id', data.user.id)
    .single()

  if (profile?.account_status === 'pending_verification') {
    // Sign out and return error
    await supabase.auth.signOut()
    return { error: 'Votre compte est en attente de verification. Vous recevrez un email une fois approuve.' }
  }

  if (profile?.account_status === 'rejected') {
    await supabase.auth.signOut()
    return { error: 'Votre demande de compte a ete refusee. Contactez l\'administration.' }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      queryParams: {
        hd: '*', // Allow any hosted domain (institutional)
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.url) {
    redirect(data.url)
  }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile,
  }
}

export async function updateUserRole(userId: string, newRole: 'teacher' | 'student') {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}
