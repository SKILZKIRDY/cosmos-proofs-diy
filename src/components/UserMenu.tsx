import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Bookmark, FlaskConical, Cloud, CloudOff, Loader2, ChevronDown, User, Edit3 } from 'lucide-react';
import ProfileEditModal from './ProfileEditModal';

interface UserMenuProps {
  scrolled?: boolean;
}

export default function UserMenu({ scrolled = false }: UserMenuProps) {
  const { user, signOut, bookmarkedIds, completedExperiments, syncStatus } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const syncIcon = {
    idle: <Cloud className="w-3.5 h-3.5 text-gray-400" />,
    syncing: <Loader2 className="w-3.5 h-3.5 text-cyan-500 animate-spin" />,
    synced: <Cloud className="w-3.5 h-3.5 text-green-500" />,
    error: <CloudOff className="w-3.5 h-3.5 text-red-500" />,
  }[syncStatus];

  const syncLabel = {
    idle: 'Local only',
    syncing: 'Syncing...',
    synced: 'Synced',
    error: 'Sync error',
  }[syncStatus];

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-colors border ${
            scrolled
              ? 'bg-gray-100 hover:bg-gray-200 border-gray-200'
              : 'bg-white/10 hover:bg-white/20 border-white/20'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-inner">
            {initials}
          </div>
          <span className={`text-sm font-medium hidden lg:block max-w-[120px] truncate ${
            scrolled ? 'text-gray-700' : 'text-white'
          }`}>
            {displayName}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${
            scrolled ? 'text-gray-400' : 'text-white/70'
          } ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
            {/* User info */}
            <div className="p-4 bg-gradient-to-br from-slate-50 to-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-lg font-bold shadow-md">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bookmarks</p>
                    <p className="text-xs text-gray-500">Saved evidence</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-amber-600">{bookmarkedIds.size}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Experiments</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-purple-600">{completedExperiments.size}</span>
              </div>

              {/* Sync status */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
                {syncIcon}
                <span className="text-xs text-gray-600 font-medium">{syncLabel}</span>
                {syncStatus === 'synced' && (
                  <span className="text-xs text-gray-400 ml-auto">All data backed up</span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 p-2 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/profile/${user.id}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                View Profile
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEditProfileOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <ProfileEditModal
        isOpen={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
      />
    </>
  );
}
