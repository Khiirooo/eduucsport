import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  
  const filter = searchParams.get('filter') || 'all'
  const discipline = searchParams.get('discipline')
  const visibility = searchParams.get('visibility')
  const userId = searchParams.get('userId')

  let query = supabase
    .from('preparations')
    .select(`
      *,
      profiles:user_id (
        first_name,
        last_name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filter === 'mine' && userId) {
    query = query.eq('user_id', userId)
  } else if (filter === 'published') {
    query = query.eq('is_published', true)
  }

  if (discipline) {
    query = query.eq('discipline', discipline)
  }

  if (visibility) {
    query = query.eq('visibility', visibility)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preparations: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('preparations')
    .insert({
      user_id: user.id,
      titre: body.titre,
      discipline: body.discipline,
      classe: body.classe,
      duree: body.duree || 0,
      objectifs: body.objectifs,
      materiel: body.materiel,
      deroulement: body.deroulement,
      reglement: body.reglement,
      location: body.location,
      category: body.category,
      file_url: body.file_url,
      file_type: body.file_type,
      // Map UI visibility values to DB values
      visibility: (() => {
        const v = body.visibility || 'commun'
        if (v === 'prof') return 'teacher'
        if (v === 'eleve') return 'student'
        if (v === 'commun') return 'all'
        return v // already correct
      })(),
      is_published: body.is_published || false,
      score: 0,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preparation: data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()
  const { id } = body

  // Verify ownership
  const { data: existing } = await supabase
    .from('preparations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise a modifier cette preparation' }, { status: 403 })
  }

  // Only update allowed fields
  const updateData: Record<string, any> = {}
  if (body.titre !== undefined) updateData.titre = body.titre
  if (body.discipline !== undefined) updateData.discipline = body.discipline
  if (body.classe !== undefined) updateData.classe = body.classe
  if (body.duree !== undefined) updateData.duree = body.duree
  if (body.objectifs !== undefined) updateData.objectifs = body.objectifs
  if (body.materiel !== undefined) updateData.materiel = body.materiel
  if (body.deroulement !== undefined) updateData.deroulement = body.deroulement
  if (body.reglement !== undefined) updateData.reglement = body.reglement
  if (body.location !== undefined) updateData.location = body.location
  if (body.category !== undefined) updateData.category = body.category
  if (body.file_url !== undefined) updateData.file_url = body.file_url
  if (body.file_type !== undefined) updateData.file_type = body.file_type
  if (body.visibility !== undefined) {
    // Map UI values to DB values
    const v = body.visibility
    updateData.visibility = v === 'prof' ? 'teacher' : v === 'eleve' ? 'student' : v === 'commun' ? 'all' : v
  }
  if (body.is_published !== undefined) updateData.is_published = body.is_published
  if (body.score !== undefined) updateData.score = body.score

  const { data, error } = await supabase
    .from('preparations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ preparation: data })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'ID requis' }, { status: 400 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('preparations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise a supprimer cette preparation' }, { status: 403 })
  }

  const { error } = await supabase
    .from('preparations')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
