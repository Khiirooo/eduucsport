import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('innovations')
    .select(`
      *,
      profiles:user_id (
        first_name,
        last_name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ innovations: data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  const body = await request.json()

  const { data, error } = await supabase
    .from('innovations')
    .insert({
      user_id: user.id,
      titre: body.titre,
      description: body.description,
      category: body.category || 'pedagogie',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ innovation: data })
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
    .from('innovations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('innovations')
    .update({
      titre: updates.titre,
      description: updates.description,
      category: updates.category,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ innovation: data })
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
    .from('innovations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (existing?.user_id !== user.id) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
  }

  const { error } = await supabase
    .from('innovations')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
