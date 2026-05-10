import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isInstitutionalEmail } from '@/lib/auth-utils'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // For Google OAuth, validate institutional email
      const email = data.user.email
      if (email) {
        const emailCheck = isInstitutionalEmail(email)
        if (!emailCheck.valid) {
          // Sign out and redirect with error
          await supabase.auth.signOut()
          return NextResponse.redirect(
            `${origin}/auth/error?message=${encodeURIComponent(emailCheck.reason || 'Email non autorise')}`
          )
        }
      }

      // Check if profile exists and account status
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('id', data.user.id)
        .single()

      if (profile?.account_status === 'pending_verification') {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/auth/pending?message=${encodeURIComponent('Votre compte est en attente de verification.')}`
        )
      }

      if (profile?.account_status === 'rejected') {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/auth/error?message=${encodeURIComponent('Votre demande de compte a ete refusee.')}`
        )
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Erreur d\'authentification')}`)
}
