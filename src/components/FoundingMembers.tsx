import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFoundingMembers } from '@/lib/communityService';
import type { UserProfile } from '@/lib/profileService';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, MapPin, Calendar, LogIn, Loader2 } from 'lucide-react';

interface FoundingMembersProps {
  onSignInClick: () => void;
}

export default function FoundingMembers({ onSignInClick }: FoundingMembersProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await getFoundingMembers();
    setMembers(data);
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name ? name.slice(0, 2).toUpperCase() : '??';
  };

  const getJoinDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="relative">
      {/* Section header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-4">
          <Shield className="w-4 h-4" />
          Founding Contributors
        </div>
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          The First to Question & Verify
        </h3>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          These pioneering members joined early and helped build this community from the ground up. 
          Every contribution matters.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </div>
      ) : members.length === 0 ? (
        /* Empty state - encouraging sign up */
        <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-200">
          <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-amber-500" />
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">
            Join the Founding Community
          </h4>
          <p className="text-gray-600 max-w-md mx-auto mb-2">
            The first 50 members will be recognized as Founding Contributors with a permanent badge on their profile.
          </p>
          <p className="text-sm text-amber-600 font-medium mb-6">
            Spots are limited. Be among the first.
          </p>
          {!user ? (
            <button
              onClick={onSignInClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
            >
              <LogIn className="w-4 h-4" />
              Create Account & Claim Your Spot
            </button>
          ) : (
            <p className="text-sm text-green-600 font-medium flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              You're a founding member! Start contributing to build your profile.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Members grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.map((member) => {
              const displayName = member.display_name || 'Anonymous';
              const initials = getInitials(displayName);

              return (
                <button
                  key={member.id}
                  onClick={() => navigate(`/profile/${member.id}`)}
                  className="group bg-white rounded-xl border border-gray-200 p-4 text-center hover:shadow-lg hover:border-amber-300 transition-all"
                >
                  {/* Avatar */}
                  <div className="relative mx-auto w-16 h-16 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center ring-2 ring-amber-200 group-hover:ring-amber-400 transition-all">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-lg font-bold">{initials}</span>
                      )}
                    </div>
                    {/* Founding badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-white">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* Name */}
                  <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-amber-700 transition-colors">
                    {displayName}
                  </h4>

                  {/* Meta */}
                  <div className="mt-1 space-y-0.5">
                    {member.location && (
                      <p className="text-xs text-gray-400 flex items-center justify-center gap-1 truncate">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {member.location}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      {getJoinDate(member.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}

            {/* Remaining spots indicator */}
            {members.length < 50 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border-2 border-dashed border-amber-200 p-4 flex flex-col items-center justify-center text-center min-h-[160px]">
                <div className="text-2xl font-bold text-amber-600 mb-1">
                  {50 - members.length}
                </div>
                <p className="text-xs text-amber-600 font-medium">spots remaining</p>
                {!user && (
                  <button
                    onClick={onSignInClick}
                    className="mt-3 text-xs text-amber-700 font-semibold underline underline-offset-2 hover:text-amber-800"
                  >
                    Claim yours
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
