import { put, del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'proof', 'preparation', 'material', 'avatar'
    const discipline = formData.get('discipline') as string | null

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Validate file type based on upload type
    const allowedTypes: Record<string, string[]> = {
      proof: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      preparation: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      material: ['image/jpeg', 'image/png', 'image/webp'],
      avatar: ['image/jpeg', 'image/png', 'image/webp'],
    }

    if (type && allowedTypes[type] && !allowedTypes[type].includes(file.type)) {
      return NextResponse.json({ error: 'Type de fichier non autorise' }, { status: 400 })
    }

    // Generate unique filename with user id and type
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const folder = type || 'misc'
    const filename = `${folder}/${user.id}/${timestamp}.${ext}`

    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({ 
      url: blob.url,
      pathname: blob.pathname,
      discipline: discipline,
      userId: user.id,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Echec de l\'upload' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'URL requise' }, { status: 400 })
    }

    // Verify the file belongs to the user (check if user id is in the path)
    if (!url.includes(user.id)) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        return NextResponse.json({ error: 'Non autorise a supprimer ce fichier' }, { status: 403 })
      }
    }

    await del(url)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Echec de la suppression' }, { status: 500 })
  }
}
