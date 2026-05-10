import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const contentType = searchParams.get('content_type')
  const contentId = searchParams.get('content_id')

  if (!contentType || !contentId) {
    return NextResponse.json({ error: 'content_type et content_id requis' }, { status: 400 })
  }

  // Get vote counts
  const { data: votes } = await supabase
    .from('votes')
    .select('vote_type')
    .eq('content_type', contentType)
    .eq('content_id', contentId)

  const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0
  const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0

  // Get user's vote if logged in
  const { data: { user } } = await supabase.auth.getUser()
  let userVote = null
  
  if (user) {
    const { data: existingVote } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('user_id', user.id)
      .single()
    
    userVote = existingVote?.vote_type || null
  }

  return NextResponse.json({ 
    upvotes, 
    downvotes, 
    score: upvotes - downvotes,
    userVote 
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()
  const { content_type, content_id, vote_type } = body

  if (!content_type || !content_id || !vote_type) {
    return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
  }

  if (!['upvote', 'downvote'].includes(vote_type)) {
    return NextResponse.json({ error: 'Type de vote invalide' }, { status: 400 })
  }

  // Check if user already voted
  const { data: existingVote } = await supabase
    .from('votes')
    .select('id, vote_type')
    .eq('content_type', content_type)
    .eq('content_id', content_id)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    if (existingVote.vote_type === vote_type) {
      // Remove vote (toggle off)
      await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)
      
      return NextResponse.json({ action: 'removed', vote_type: null })
    } else {
      // Change vote
      await supabase
        .from('votes')
        .update({ vote_type })
        .eq('id', existingVote.id)
      
      return NextResponse.json({ action: 'changed', vote_type })
    }
  } else {
    // Add new vote
    const { error } = await supabase
      .from('votes')
      .insert({
        content_type,
        content_id,
        user_id: user.id,
        vote_type,
      })

    if (error) {
      // Handle unique constraint violation (double vote attempt)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Vote deja enregistre' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ action: 'added', vote_type })
  }
}
