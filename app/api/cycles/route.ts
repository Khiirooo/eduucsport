import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('cycles')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cycles: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('cycles')
    .insert({
      user_id: user.id,
      titre: body.titre,
      discipline: body.discipline,
      classe: body.classe,
      objectifs: body.objectifs,
      annee: body.annee || '',
      date_debut: body.date_debut,
      date_fin: body.date_fin,
      nb_seances: body.nb_seances || 0,
      preps_liees: body.preps_liees || [],
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cycle: data })
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
    .from('cycles')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('cycles')
    .update({
      titre: updates.titre,
      discipline: updates.discipline,
      classe: updates.classe,
      objectifs: updates.objectifs,
      annee: updates.annee || '',
      date_debut: updates.date_debut,
      date_fin: updates.date_fin,
      nb_seances: updates.nb_seances,
      preps_liees: updates.preps_liees,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ cycle: data })
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
    .from('cycles')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { error } = await supabase
    .from('cycles')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
