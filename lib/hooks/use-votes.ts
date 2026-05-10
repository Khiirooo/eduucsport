"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

export type VoteType = 'upvote' | 'downvote'
export type ContentType = 'preparation' | 'forum_post' | 'innovation'

interface VoteState {
  upvotes: number
  downvotes: number
  userVote: VoteType | null
}

export function useVotes(contentType: ContentType) {
  const [voteStates, setVoteStates] = useState<Record<string, VoteState>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const fetchVotes = useCallback(async (contentId: string) => {
    const supabase = createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    // Get vote counts
    const { data: votes } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('content_type', contentType)
      .eq('content_id', contentId)

    const upvotes = votes?.filter(v => v.vote_type === 'upvote').length || 0
    const downvotes = votes?.filter(v => v.vote_type === 'downvote').length || 0

    // Get user's vote if logged in
    let userVote: VoteType | null = null
    if (user) {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .single()
      
      userVote = existingVote?.vote_type as VoteType | null
    }

    setVoteStates(prev => ({
      ...prev,
      [contentId]: { upvotes, downvotes, userVote }
    }))

    return { upvotes, downvotes, userVote }
  }, [contentType])

  const vote = useCallback(async (contentId: string, voteType: VoteType): Promise<{ success: boolean; error?: string }> => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Non connecte' }
    }

    setLoading(prev => ({ ...prev, [contentId]: true }))

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id, vote_type')
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .eq('user_id', user.id)
        .single()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote (toggle off)
          await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Change vote
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        // Add new vote
        await supabase
          .from('votes')
          .insert({
            content_type: contentType,
            content_id: contentId,
            user_id: user.id,
            vote_type: voteType,
          })
      }

      // Refresh vote counts
      await fetchVotes(contentId)
      
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      setLoading(prev => ({ ...prev, [contentId]: false }))
    }
  }, [contentType, fetchVotes])

  const getScore = useCallback((contentId: string): number => {
    const state = voteStates[contentId]
    if (!state) return 0
    return state.upvotes - state.downvotes
  }, [voteStates])

  return {
    voteStates,
    loading,
    fetchVotes,
    vote,
    getScore,
  }
}
