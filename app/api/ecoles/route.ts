import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('ecoles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ecoles: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('ecoles')
    .insert({
      user_id: user.id,
      nom: body.nom,
      adresse: body.adresse,
      description: body.description || '',
      infrastructure: body.infrastructure || '',
      couleur: body.couleur || '#0d9488',
      classes: body.classes || [],
      materiel: body.materiel || [],
      journal: body.journal || [],
      ecole_photos: body.ecole_photos || [],
      checklist: body.checklist || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ecole: data })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()
  const { id, ...updates } = body

  // Verify ownership
  const { data: existing } = await supabase
    .from('ecoles')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('ecoles')
    .update({
      nom: updates.nom,
      adresse: updates.adresse,
      description: updates.description,
      infrastructure: updates.infrastructure,
      couleur: updates.couleur,
      classes: updates.classes,
      materiel: updates.materiel,
      journal: updates.journal,
      ecole_photos: updates.ecole_photos,
      checklist: updates.checklist,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ecole: data })
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
    .from('ecoles')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { error } = await supabase
    .from('ecoles')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
