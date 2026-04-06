import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, UserProfile } from '@/lib/profileService';
import { getSubmissionsByUser, SubmissionWithMedia } from '@/lib/submissionService';
import { experiments } from '@/data/experiments';
import ProfileEditModal from '@/components/ProfileEditModal';
import SubmissionForm from '@/components/SubmissionForm';
import SubmissionCard from '@/components/SubmissionCard';
import {
  User, MapPin, Youtube, Globe, Calendar, FlaskConical, FileText,
  ArrowLeft, Edit3, Loader2, Plus, Camera, CheckCircle2, ExternalLink, Award
} from 'lucide-react';

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user, completedExperiments } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionWithMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'experiments'>('submissions');

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (userId) loadData();
  }, [userId]);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    const [profileData, submissionsData] = await Promise.all([
      getProfile(userId),
      getSubmissionsByUser(userId),
    ]);
    setProfile(profileData);
    setSubmissions(submissionsData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">This member profile doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || 'Anonymous Researcher';
  const initials = displayName.slice(0, 2).toUpperCase();
  const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Stats
  const submissionCount = submissions.length;
  const uniqueExperiments = new Set(submissions.map(s => s.experiment_id)).size;
  const totalPhotos = submissions.reduce((sum, s) => sum + (s.media?.length || 0), 0);
  const completedCount = isOwnProfile ? completedExperiments.size : uniqueExperiments;

  // Completed experiments list
  const completedExperimentsList = isOwnProfile
    ? experiments.filter(e => completedExperiments.has(e.id))
    : experiments.filter(e => submissions.some(s => s.experiment_id === e.id));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to TrueCosmology</span>
            <span className="sm:hidden">Back</span>
          </button>
          <div className="flex items-center gap-2">
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setSubmissionFormOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Submission</span>
                </button>
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-lg text-xs font-semibold hover:bg-cyan-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-2xl ring-4 ring-white/10">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">{initials}</span>
                )}
              </div>
              {isOwnProfile && (
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg flex items-center justify-center shadow-lg transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{displayName}</h1>
                {profile.is_founding_member && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-semibold">
                    <Award className="w-3.5 h-3.5" />
                    Founding Member
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-gray-400 text-sm">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Joined {joinDate}
                </span>
              </div>
              {profile.bio && (
                <p className="mt-3 text-gray-300 text-sm leading-relaxed max-w-xl">{profile.bio}</p>
              )}

              {/* Social links */}
              {(profile.youtube_url || profile.website_url) && (
                <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
                  {profile.youtube_url && (
                    <a
                      href={profile.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <Youtube className="w-3.5 h-3.5" />
                      YouTube
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {profile.website_url && (
                    <a
                      href={profile.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-4 divide-x divide-gray-200">
            {[
              { label: 'Submissions', value: submissionCount, icon: FileText, color: 'text-purple-600' },
              { label: 'Experiments', value: completedCount, icon: FlaskConical, color: 'text-blue-600' },
              { label: 'Photos', value: totalPhotos, icon: Camera, color: 'text-amber-600' },
              { label: 'Unique Exps', value: uniqueExperiments, icon: CheckCircle2, color: 'text-green-600' },
            ].map((stat) => (
              <div key={stat.label} className="py-4 text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'submissions'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Submissions ({submissionCount})
          </button>
          <button
            onClick={() => setActiveTab('experiments')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'experiments'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Experiments ({completedExperimentsList.length})
          </button>
        </div>

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <>
            {submissions.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {isOwnProfile
                    ? 'Share your experiment results with the community!'
                    : 'This member hasn\'t submitted any experiment results yet.'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => setSubmissionFormOpen(true)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Submit Your First Result
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissions.map((sub) => (
                  <SubmissionCard
                    key={sub.id}
                    submission={sub}
                    showUserInfo={false}
                    showExperimentInfo={true}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Experiments Tab */}
        {activeTab === 'experiments' && (
          <>
            {completedExperimentsList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No experiments completed</h3>
                <p className="text-gray-500 text-sm">
                  {isOwnProfile
                    ? 'Start completing experiments to build your research portfolio!'
                    : 'This member hasn\'t completed any experiments yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedExperimentsList.map((exp) => {
                  const expSubmissions = submissions.filter(s => s.experiment_id === exp.id);
                  return (
                    <div
                      key={exp.id}
                      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-32">
                        <img src={exp.image} alt={exp.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <h4 className="text-white font-semibold text-sm truncate">{exp.title}</h4>
                        </div>
                        {expSubmissions.length > 0 && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs font-bold">
                            {expSubmissions.length} result{expSubmissions.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">{exp.category}</span>
                          <span>{exp.difficulty}</span>
                          <span className="text-gray-300">·</span>
                          <span>{exp.duration}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSaved={loadData}
      />
      <SubmissionForm
        isOpen={submissionFormOpen}
        onClose={() => setSubmissionFormOpen(false)}
        onSubmitted={loadData}
      />
    </div>
  );
}
