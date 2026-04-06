import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getComments, addComment, deleteComment, SubmissionComment } from '@/lib/communityService';
import { X, Send, Loader2, Trash2, MessageCircle, LogIn } from 'lucide-react';

interface CommentSectionProps {
  submissionId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSignInClick: () => void;
  onCommentCountChange?: (submissionId: string, count: number) => void;
}

export default function CommentSection({ submissionId, isOpen, onClose, onSignInClick, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<SubmissionComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && submissionId) {
      loadComments();
    }
  }, [isOpen, submissionId]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadComments = async () => {
    if (!submissionId) return;
    setLoading(true);
    const data = await getComments(submissionId);
    setComments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !submissionId || !newComment.trim() || submitting) return;

    setSubmitting(true);
    const { error } = await addComment(submissionId, user.id, newComment.trim());
    if (!error) {
      setNewComment('');
      await loadComments();
      onCommentCountChange?.(submissionId, comments.length + 1);
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!submissionId) return;
    setDeletingId(commentId);
    const { error } = await deleteComment(commentId);
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCommentCountChange?.(submissionId, comments.length - 1);
    }
    setDeletingId(null);
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Discussion</h3>
            {comments.length > 0 && (
              <span className="text-xs text-gray-400">({comments.length})</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-gray-300" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">Start the first discussion</h4>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Share your thoughts, ask questions, or provide feedback on this field report.
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const profile = comment.user_profile;
              const displayName = profile?.display_name || 'Anonymous';
              const initials = displayName.slice(0, 2).toUpperCase();
              const isOwn = user?.id === comment.user_id;

              return (
                <div key={comment.id} className="flex gap-3 group">
                  {/* Avatar */}
                  <button
                    onClick={() => navigate(`/profile/${comment.user_id}`)}
                    className="flex-shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white text-xs font-bold">{initials}</span>
                      )}
                    </div>
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <button
                        onClick={() => navigate(`/profile/${comment.user_id}`)}
                        className="text-sm font-semibold text-gray-900 hover:text-cyan-600 transition-colors truncate"
                      >
                        {displayName}
                      </button>
                      <span className="text-xs text-gray-400 flex-shrink-0">{getTimeAgo(comment.created_at)}</span>
                      {isOwn && (
                        <button
                          onClick={() => handleDelete(comment.id)}
                          disabled={deletingId === comment.id}
                          className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-gray-400 hover:text-red-500 transition-all"
                          title="Delete comment"
                        >
                          {deletingId === comment.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 px-5 py-4">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">
                  {(user.user_metadata?.display_name || user.email || '??').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  rows={1}
                  maxLength={1000}
                  className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-200 disabled:text-gray-400 text-white flex items-center justify-center transition-colors"
                >
                  {submitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={onSignInClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Sign in to join the discussion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
