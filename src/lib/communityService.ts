import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/lib/profileService';

// ---- Types ----

export interface CommunityStats {
  total_members: number;
  total_submissions: number;
  total_experiments_attempted: number;
  total_comments: number;
  total_reactions: number;
  founding_members_count: number;
}

export interface SubmissionComment {
  id: string;
  submission_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_profile?: UserProfile;
}

export interface SubmissionReaction {
  id: string;
  submission_id: string;
  user_id: string;
  reaction_type: 'support' | 'insightful' | 'verified' | 'question';
  created_at: string;
}

export interface ReactionCounts {
  support: number;
  insightful: number;
  verified: number;
  question: number;
}

export interface ContributorProfile extends UserProfile {
  submission_count: number;
  unique_experiments: number;
  reactions_received: number;
  comments_made: number;
  contribution_score: number;
}

// ---- Community Stats ----

export async function getCommunityStats(): Promise<CommunityStats> {
  const { data, error } = await supabase
    .from('community_stats')
    .select('*')
    .single();

  if (error || !data) {
    return {
      total_members: 0,
      total_submissions: 0,
      total_experiments_attempted: 0,
      total_comments: 0,
      total_reactions: 0,
      founding_members_count: 0,
    };
  }
  return data;
}

// ---- Founding Members ----

export async function getFoundingMembers(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_founding_member', true)
    .order('created_at', { ascending: true })
    .limit(20);

  if (error || !data) return [];
  return data;
}

// ---- Featured Contributors ----

export async function getFeaturedContributors(limit = 6): Promise<ContributorProfile[]> {
  const { data, error } = await supabase
    .from('contributor_leaderboard')
    .select('*')
    .gt('submission_count', 0)
    .order('contribution_score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data;
}

// ---- Comments ----

export async function getComments(submissionId: string): Promise<SubmissionComment[]> {
  const { data: comments, error } = await supabase
    .from('submission_comments')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (error || !comments) return [];

  // Fetch profiles for each comment
  const enriched = await Promise.all(
    comments.map(async (comment) => {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', comment.user_id)
        .single();

      return {
        ...comment,
        user_profile: profile || undefined,
      };
    })
  );

  return enriched;
}

export async function addComment(
  submissionId: string,
  userId: string,
  content: string
): Promise<{ comment: SubmissionComment | null; error: string | null }> {
  const { data, error } = await supabase
    .from('submission_comments')
    .insert({
      submission_id: submissionId,
      user_id: userId,
      content,
    })
    .select()
    .single();

  if (error) return { comment: null, error: error.message };
  return { comment: data, error: null };
}

export async function deleteComment(commentId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('submission_comments')
    .delete()
    .eq('id', commentId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function getCommentCount(submissionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('submission_comments')
    .select('*', { count: 'exact', head: true })
    .eq('submission_id', submissionId);

  if (error) return 0;
  return count || 0;
}

// ---- Reactions ----

export async function getReactions(submissionId: string): Promise<{ counts: ReactionCounts; userReactions: string[] }> {
  const { data: reactions, error } = await supabase
    .from('submission_reactions')
    .select('*')
    .eq('submission_id', submissionId);

  if (error || !reactions) {
    return { counts: { support: 0, insightful: 0, verified: 0, question: 0 }, userReactions: [] };
  }

  const counts: ReactionCounts = { support: 0, insightful: 0, verified: 0, question: 0 };
  reactions.forEach((r) => {
    if (r.reaction_type in counts) {
      counts[r.reaction_type as keyof ReactionCounts]++;
    }
  });

  return { counts, userReactions: reactions.map(r => `${r.reaction_type}`) };
}

export async function getReactionsForUser(submissionId: string, userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('submission_reactions')
    .select('reaction_type')
    .eq('submission_id', submissionId)
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map(r => r.reaction_type);
}

export async function toggleReaction(
  submissionId: string,
  userId: string,
  reactionType: 'support' | 'insightful' | 'verified' | 'question'
): Promise<{ added: boolean; error: string | null }> {
  // Check if reaction exists
  const { data: existing } = await supabase
    .from('submission_reactions')
    .select('id')
    .eq('submission_id', submissionId)
    .eq('user_id', userId)
    .eq('reaction_type', reactionType)
    .single();

  if (existing) {
    // Remove reaction
    const { error } = await supabase
      .from('submission_reactions')
      .delete()
      .eq('id', existing.id);

    if (error) return { added: false, error: error.message };
    return { added: false, error: null };
  } else {
    // Add reaction
    const { error } = await supabase
      .from('submission_reactions')
      .insert({
        submission_id: submissionId,
        user_id: userId,
        reaction_type: reactionType,
      });

    if (error) return { added: false, error: error.message };
    return { added: true, error: null };
  }
}

// ---- Batch fetch reactions and comments for multiple submissions ----

export async function getBatchReactionCounts(submissionIds: string[]): Promise<Record<string, ReactionCounts>> {
  if (submissionIds.length === 0) return {};

  const { data, error } = await supabase
    .from('submission_reactions')
    .select('submission_id, reaction_type')
    .in('submission_id', submissionIds);

  if (error || !data) return {};

  const result: Record<string, ReactionCounts> = {};
  submissionIds.forEach(id => {
    result[id] = { support: 0, insightful: 0, verified: 0, question: 0 };
  });

  data.forEach((r) => {
    if (result[r.submission_id] && r.reaction_type in result[r.submission_id]) {
      result[r.submission_id][r.reaction_type as keyof ReactionCounts]++;
    }
  });

  return result;
}

export async function getBatchCommentCounts(submissionIds: string[]): Promise<Record<string, number>> {
  if (submissionIds.length === 0) return {};

  const { data, error } = await supabase
    .from('submission_comments')
    .select('submission_id')
    .in('submission_id', submissionIds);

  if (error || !data) return {};

  const result: Record<string, number> = {};
  submissionIds.forEach(id => { result[id] = 0; });
  data.forEach((c) => {
    result[c.submission_id] = (result[c.submission_id] || 0) + 1;
  });

  return result;
}

export async function getUserReactionsForSubmissions(submissionIds: string[], userId: string): Promise<Record<string, string[]>> {
  if (submissionIds.length === 0 || !userId) return {};

  const { data, error } = await supabase
    .from('submission_reactions')
    .select('submission_id, reaction_type')
    .in('submission_id', submissionIds)
    .eq('user_id', userId);

  if (error || !data) return {};

  const result: Record<string, string[]> = {};
  data.forEach((r) => {
    if (!result[r.submission_id]) result[r.submission_id] = [];
    result[r.submission_id].push(r.reaction_type);
  });

  return result;
}
