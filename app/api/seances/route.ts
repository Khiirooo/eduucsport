import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('seances')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seances: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('seances')
    .insert({
      user_id: user.id,
      titre: body.titre,
      date: body.date,
      heure: body.heure,
      duree: body.duree || 0,
      classe: body.classe,
      objectifs: body.objectifs,
      prep_liee_id: body.prep_liee_id,
      notes: body.notes,
      observations: body.observations,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seance: data })
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
    .from('seances')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('seances')
    .update({
      titre: updates.titre,
      date: updates.date,
      heure: updates.heure,
      duree: updates.duree,
      classe: updates.classe,
      objectifs: updates.objectifs,
      prep_liee_id: updates.prep_liee_id,
      notes: updates.notes,
      observations: updates.observations,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ seance: data })
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
    .from('seances')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { error } = await supabase
    .from('seances')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
