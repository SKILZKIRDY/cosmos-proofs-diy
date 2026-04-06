import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  location: string;
  youtube_url: string;
  website_url: string;
  avatar_url: string;
  is_founding_member?: boolean;
  contribution_score?: number;
  created_at: string;
  updated_at: string;
}


export interface ExperimentSubmission {
  id: string;
  user_id: string;
  experiment_id: string;
  notes: string;
  results: string;
  created_at: string;
  updated_at: string;
  photos?: SubmissionPhoto[];
  user_profile?: UserProfile;
}

export interface SubmissionPhoto {
  id: string;
  submission_id: string;
  photo_url: string;
  caption: string;
  created_at: string;
}

// ---- Profile Functions ----

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    });
  if (error) return { error: error.message };
  return { error: null };
}

export async function uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) return { url: null, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile with avatar URL
  await updateProfile(userId, { avatar_url: publicUrl });

  return { url: publicUrl, error: null };
}

// ---- Submission Functions ----

export async function createSubmission(
  userId: string,
  experimentId: string,
  notes: string,
  results: string,
  photos: File[]
): Promise<{ submission: ExperimentSubmission | null; error: string | null }> {
  // Create submission
  const { data: submission, error: subError } = await supabase
    .from('experiment_submissions')
    .insert({
      user_id: userId,
      experiment_id: experimentId,
      notes,
      results,
    })
    .select()
    .single();

  if (subError || !submission) return { submission: null, error: subError?.message || 'Failed to create submission' };

  // Upload photos
  if (photos.length > 0) {
    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${submission.id}/${i}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('submission-photos')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('submission-photos')
          .getPublicUrl(filePath);

        await supabase.from('submission_photos').insert({
          submission_id: submission.id,
          photo_url: publicUrl,
          caption: '',
        });
      }
    }
  }

  return { submission, error: null };
}

export async function getSubmissionsByExperiment(experimentId: string): Promise<ExperimentSubmission[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .eq('experiment_id', experimentId)
    .order('created_at', { ascending: false });

  if (error || !submissions) return [];

  // Fetch photos and profiles for each submission
  const enriched = await Promise.all(
    submissions.map(async (sub) => {
      const { data: photos } = await supabase
        .from('submission_photos')
        .select('*')
        .eq('submission_id', sub.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', sub.user_id)
        .single();

      return {
        ...sub,
        photos: photos || [],
        user_profile: profile || undefined,
      };
    })
  );

  return enriched;
}

export async function getSubmissionsByUser(userId: string): Promise<ExperimentSubmission[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !submissions) return [];

  const enriched = await Promise.all(
    submissions.map(async (sub) => {
      const { data: photos } = await supabase
        .from('submission_photos')
        .select('*')
        .eq('submission_id', sub.id);

      return {
        ...sub,
        photos: photos || [],
      };
    })
  );

  return enriched;
}

export async function deleteSubmission(submissionId: string, userId: string): Promise<{ error: string | null }> {
  // Delete photos from storage first
  const { data: photos } = await supabase
    .from('submission_photos')
    .select('*')
    .eq('submission_id', submissionId);

  if (photos) {
    for (const photo of photos) {
      // Extract path from URL
      const urlParts = photo.photo_url.split('/submission-photos/');
      if (urlParts[1]) {
        await supabase.storage.from('submission-photos').remove([urlParts[1]]);
      }
    }
  }

  // Delete submission (cascade will delete photos records)
  const { error } = await supabase
    .from('experiment_submissions')
    .delete()
    .eq('id', submissionId)
    .eq('user_id', userId);

  if (error) return { error: error.message };
  return { error: null };
}

export async function getRecentSubmissions(limit = 10): Promise<ExperimentSubmission[]> {
  const { data: submissions, error } = await supabase
    .from('experiment_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !submissions) return [];

  const enriched = await Promise.all(
    submissions.map(async (sub) => {
      const { data: photos } = await supabase
        .from('submission_photos')
        .select('*')
        .eq('submission_id', sub.id);

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', sub.user_id)
        .single();

      return {
        ...sub,
        photos: photos || [],
        user_profile: profile || undefined,
      };
    })
  );

  return enriched;
}
