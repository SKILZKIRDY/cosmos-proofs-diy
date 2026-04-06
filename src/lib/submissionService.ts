/**
 * submissionService.ts
 *
 * Clean service layer for the Phase 1 photo-based experiment submission system.
 *
 * Tables used:
 *   - experiment_submissions  (id, user_id, experiment_id, notes, results, created_at, updated_at)
 *   - submission_media        (id, submission_id, file_url, created_at)
 *
 * Storage bucket:
 *   - submission-images       (public, user-scoped folders)
 *
 * All functions keep upload logic separate from UI logic.
 */

import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SubmissionMedia {
  id: string;
  submission_id: string;
  file_url: string;
  created_at: string;
}

export interface SubmissionRow {
  id: string;
  user_id: string;
  experiment_id: string;
  notes: string;
  results: string;
  created_at: string;
  updated_at: string;
}

export interface SubmissionWithMedia extends SubmissionRow {
  media: SubmissionMedia[];
  user_profile?: {
    id: string;
    display_name: string;
    avatar_url: string;
    location: string;
    bio: string;
    is_founding_member?: boolean;
  } | null;
}

// ─── Image Upload ────────────────────────────────────────────────────────────

const BUCKET = 'submission-images';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload a single image to the submission-images bucket.
 * Files are stored under `{userId}/{submissionId}/{index}.{ext}`.
 * Returns the public URL on success, or null + error message on failure.
 */
export async function uploadSubmissionImage(
  userId: string,
  submissionId: string,
  file: File,
  index: number
): Promise<{ url: string | null; error: string | null }> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: `Unsupported file type: ${file.type}. Use JPEG, PNG, WebP, or GIF.` };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 5 MB.` };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const filePath = `${userId}/${submissionId}/${index}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return { url: publicUrl, error: null };
}

/**
 * Delete all images for a submission from the bucket.
 */
export async function deleteSubmissionImages(
  userId: string,
  submissionId: string
): Promise<void> {
  const folderPath = `${userId}/${submissionId}`;

  const { data: files } = await supabase.storage
    .from(BUCKET)
    .list(folderPath);

  if (files && files.length > 0) {
    const paths = files.map(f => `${folderPath}/${f.name}`);
    await supabase.storage.from(BUCKET).remove(paths);
  }
}

// ─── Submission CRUD ─────────────────────────────────────────────────────────

export interface CalculationData {
  observerHeight: number;
  observerUnit: string;
  targetHeight: number;
  targetUnit: string;
  distance: number;
  distanceUnit: string;
  horizonMi: number;
  horizonKm: number;
  hiddenFt: number;
  hiddenM: number;
  visibleFt: number;
  visibleM: number;
  angleDeg: number;
  fullyVisible: boolean;
  fullyHidden: boolean;
}

export interface CreateSubmissionInput {
  userId: string;
  experimentId: string;
  notes: string;
  photos: File[];
  calculationData?: CalculationData;
}


/**
 * Create a new experiment submission with photos.
 *
 * Steps:
 *   1. Insert row into experiment_submissions
 *   2. Upload each photo to submission-images bucket
 *   3. Insert a submission_media row for each uploaded photo
 *   4. Return the complete submission with media
 */
export async function createSubmission(
  input: CreateSubmissionInput
): Promise<{ submission: SubmissionWithMedia | null; error: string | null }> {
  const { userId, experimentId, notes, photos, calculationData } = input;

  // Build the results field: if calculationData is provided, store as JSON; otherwise use notes
  const resultsField = calculationData
    ? JSON.stringify(calculationData)
    : notes.trim();

  // 1. Create submission row
  const { data: submission, error: subError } = await supabase
    .from('experiment_submissions')
    .insert({
      user_id: userId,
      experiment_id: experimentId,
      notes: notes.trim(),
      results: resultsField,
    })
    .select()
    .single();



  if (subError || !submission) {
    return {
      submission: null,
      error: subError?.message || 'Failed to create submission',
    };
  }

  // 2 & 3. Upload photos and create media rows
  const mediaRows: SubmissionMedia[] = [];
  const uploadErrors: string[] = [];

  for (let i = 0; i < photos.length; i++) {
    const { url, error: uploadErr } = await uploadSubmissionImage(
      userId,
      submission.id,
      photos[i],
      i
    );

    if (uploadErr || !url) {
      uploadErrors.push(uploadErr || `Failed to upload photo ${i + 1}`);
      continue;
    }

    // Insert media row
    const { data: mediaRow, error: mediaErr } = await supabase
      .from('submission_media')
      .insert({
        submission_id: submission.id,
        file_url: url,
      })
      .select()
      .single();

    if (mediaErr) {
      uploadErrors.push(mediaErr.message);
    } else if (mediaRow) {
      mediaRows.push(mediaRow);
    }

    // Also insert into legacy submission_photos for backward compatibility
    await supabase.from('submission_photos').insert({
      submission_id: submission.id,
      photo_url: url,
      caption: '',
    });
  }

  // If ALL uploads failed but submission was created, still return success
  // (submission without photos is valid)
  if (uploadErrors.length > 0 && mediaRows.length === 0 && photos.length > 0) {
    console.warn('Some photo uploads failed:', uploadErrors);
  }

  return {
    submission: {
      ...submission,
      media: mediaRows,
    },
    error: uploadErrors.length > 0
      ? `Submission created. ${uploadErrors.length} photo(s) failed to upload.`
      : null,
  };
}

/**
 * Delete a submission and all its media.
 * Only the owner can delete (enforced by RLS).
 */
export async function deleteSubmission(
  submissionId: string,
  userId: string
): Promise<{ error: string | null }> {
  // Delete images from storage
  await deleteSubmissionImages(userId, submissionId);

  // Delete submission (cascade deletes submission_media and submission_photos rows)
  const { error } = await supabase
    .from('experiment_submissions')
    .delete()
    .eq('id', submissionId)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Submission Queries ──────────────────────────────────────────────────────

/**
 * Fetch a single submission with its media and user profile.
 */
export async function getSubmission(
  submissionId: string
): Promise<SubmissionWithMedia | null> {
  const { data: submission, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .eq('id', submissionId)
    .single();

  if (error || !submission) return null;

  const [media, profile] = await Promise.all([
    fetchMediaForSubmission(submissionId),
    fetchUserProfile(submission.user_id),
  ]);

  return {
    ...submission,
    media,
    user_profile: profile,
  };
}

/**
 * Fetch all submissions for a specific experiment, with media and profiles.
 */
export async function getSubmissionsByExperiment(
  experimentId: string,
  limit = 50
): Promise<SubmissionWithMedia[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !submissions) return [];

  return enrichSubmissions(submissions);
}

/**
 * Fetch all submissions by a specific user, with media.
 */
export async function getSubmissionsByUser(
  userId: string,
  limit = 50
): Promise<SubmissionWithMedia[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !submissions) return [];

  return enrichSubmissions(submissions);
}

/**
 * Fetch the most recent submissions across all experiments.
 */
export async function getRecentSubmissions(
  limit = 10
): Promise<SubmissionWithMedia[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !submissions) return [];

  return enrichSubmissions(submissions);
}

/**
 * Count total submissions for a user.
 */
export async function getUserSubmissionCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('experiment_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) return 0;
  return count || 0;
}

/**
 * Count unique experiments a user has submitted for.
 */
export async function getUserExperimentCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('experiment_submissions')
    .select('experiment_id')
    .eq('user_id', userId);

  if (error || !data) return 0;

  const unique = new Set(data.map(d => d.experiment_id));
  return unique.size;
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Fetch media rows for a single submission.
 * Falls back to submission_photos if no submission_media rows exist.
 */
async function fetchMediaForSubmission(submissionId: string): Promise<SubmissionMedia[]> {
  // Try new table first
  const { data: media, error } = await supabase
    .from('submission_media')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (!error && media && media.length > 0) {
    return media;
  }

  // Fallback: read from legacy submission_photos table
  const { data: photos } = await supabase
    .from('submission_photos')
    .select('*')
    .eq('submission_id', submissionId)
    .order('created_at', { ascending: true });

  if (photos && photos.length > 0) {
    return photos.map(p => ({
      id: p.id,
      submission_id: p.submission_id,
      file_url: p.photo_url,
      created_at: p.created_at,
    }));
  }

  return [];
}

/**
 * Fetch a user profile by ID.
 */
async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, location, bio, is_founding_member')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Enrich an array of submission rows with media and user profiles.
 * Uses batching for efficiency.
 */
async function enrichSubmissions(submissions: SubmissionRow[]): Promise<SubmissionWithMedia[]> {
  if (submissions.length === 0) return [];

  // Batch fetch all media
  const submissionIds = submissions.map(s => s.id);
  const userIds = [...new Set(submissions.map(s => s.user_id))];

  // Fetch media from new table
  const { data: allMedia } = await supabase
    .from('submission_media')
    .select('*')
    .in('submission_id', submissionIds)
    .order('created_at', { ascending: true });

  // Fetch media from legacy table as fallback
  const { data: allPhotos } = await supabase
    .from('submission_photos')
    .select('*')
    .in('submission_id', submissionIds)
    .order('created_at', { ascending: true });

  // Fetch all user profiles
  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url, location, bio, is_founding_member')
    .in('id', userIds);

  // Build lookup maps
  const mediaMap = new Map<string, SubmissionMedia[]>();
  (allMedia || []).forEach(m => {
    if (!mediaMap.has(m.submission_id)) mediaMap.set(m.submission_id, []);
    mediaMap.get(m.submission_id)!.push(m);
  });

  const photosMap = new Map<string, SubmissionMedia[]>();
  (allPhotos || []).forEach(p => {
    if (!photosMap.has(p.submission_id)) photosMap.set(p.submission_id, []);
    photosMap.get(p.submission_id)!.push({
      id: p.id,
      submission_id: p.submission_id,
      file_url: p.photo_url,
      created_at: p.created_at,
    });
  });

  const profileMap = new Map<string, any>();
  (profiles || []).forEach(p => profileMap.set(p.id, p));

  // Assemble enriched submissions
  return submissions.map(sub => ({
    ...sub,
    media: mediaMap.get(sub.id) || photosMap.get(sub.id) || [],
    user_profile: profileMap.get(sub.user_id) || null,
  }));
}
