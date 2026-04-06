import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { evidenceData, categoryMeta, EvidenceCategory, EvidenceItem } from '../data/evidence';
import EvidenceCard from './EvidenceCard';
import EvidenceDetailModal from './EvidenceDetailModal';
import { experiments, Experiment } from '../data/experiments';
import ExperimentModal from './ExperimentModal';
import { SlidersHorizontal, Bookmark, LayoutGrid, List, Eye, Droplets, Sun, Atom, Compass, Camera } from 'lucide-react';


const categoryIcons: Record<string, React.FC<{ className?: string }>> = {
  eye: Eye,
  droplets: Droplets,
  sun: Sun,
  atom: Atom,
  compass: Compass,
  camera: Camera,
};

const allCategories: EvidenceCategory[] = [
  'Horizon & Visibility',
  'Water & Level',
  'Celestial Observations',
  'Motion & Physics',
  'Navigation & Mapping',
  'Photography & Optics',
];

type ViewMode = 'grid' | 'list';
type SortOption = 'default' | 'difficulty-asc' | 'difficulty-desc' | 'category';

interface EvidenceSectionProps {
  onSignInClick?: () => void;
  externalSelectedEvidence?: EvidenceItem | null;
  onClearExternalSelection?: () => void;
}

export default function EvidenceSection({ onSignInClick, externalSelectedEvidence, onClearExternalSelection }: EvidenceSectionProps) {
  const { bookmarkedIds, toggleBookmark, user, completedExperiments, toggleExperimentComplete, experimentNotes, updateExperimentNotes } = useAuth();

  const [selectedItem, setSelectedItem] = useState<typeof evidenceData[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EvidenceCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [relatedExperiment, setRelatedExperiment] = useState<Experiment | null>(null);

  // Handle external evidence selection (from global search)
  useEffect(() => {
    if (externalSelectedEvidence) {
      setSelectedItem(externalSelectedEvidence);
      onClearExternalSelection?.();
    }
  }, [externalSelectedEvidence, onClearExternalSelection]);

  const difficultyOrder: Record<string, number> = { Easy: 1, Moderate: 2, Advanced: 3 };

  const filteredEvidence = useMemo(() => {
    let items = [...evidenceData];

    // Category
    if (selectedCategory !== 'All') {
      items = items.filter((item) => item.category === selectedCategory);
    }

    // Difficulty
    if (selectedDifficulty !== 'All') {
      items = items.filter((item) => item.verificationDifficulty === selectedDifficulty);
    }

    // Bookmarked
    if (showBookmarkedOnly) {
      items = items.filter((item) => bookmarkedIds.has(item.id));
    }

    // Sort
    if (sortBy === 'difficulty-asc') {
      items.sort((a, b) => difficultyOrder[a.verificationDifficulty] - difficultyOrder[b.verificationDifficulty]);
    } else if (sortBy === 'difficulty-desc') {
      items.sort((a, b) => difficultyOrder[b.verificationDifficulty] - difficultyOrder[a.verificationDifficulty]);
    } else if (sortBy === 'category') {
      items.sort((a, b) => a.category.localeCompare(b.category));
    }

    return items;
  }, [selectedCategory, selectedDifficulty, showBookmarkedOnly, sortBy, bookmarkedIds]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: evidenceData.length };
    allCategories.forEach((cat) => {
      counts[cat] = evidenceData.filter((e) => e.category === cat).length;
    });
    return counts;
  }, []);

  const handleOpenExperiment = (experimentId: string) => {
    const exp = experiments.find((e) => e.id === experimentId);
    if (exp) setRelatedExperiment(exp);
  };

  const hasActiveFilters = selectedCategory !== 'All' || selectedDifficulty !== 'All' || showBookmarkedOnly;

  return (
    <div id="evidence" className="bg-gradient-to-b from-gray-50 via-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            {evidenceData.length} Documented Observations
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Evidence Library
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive collection of observable phenomena that challenge mainstream cosmological assumptions. 
            Each entry includes verification methods you can perform yourself.
          </p>
          {user && bookmarkedIds.size > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full text-sm text-amber-700 font-medium">
              <Bookmark className="w-4 h-4" fill="currentColor" />
              You have {bookmarkedIds.size} bookmarked items synced to your account
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === 'All'
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All ({categoryCounts['All']})
            </button>
            {allCategories.map((cat) => {
              const meta = categoryMeta[cat];
              const Icon = categoryIcons[meta.icon] || Eye;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedCategory === cat
                      ? `${meta.bgColor} ${meta.color} shadow-lg border-2 ${meta.borderColor}`
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat}</span>
                  <span className="sm:hidden">{cat.split(' ')[0]}</span>
                  <span className="text-xs opacity-70">({categoryCounts[cat]})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Controls — compact row without search */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Difficulty Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy to Verify</option>
              <option value="Moderate">Moderate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="default">Default Order</option>
            <option value="difficulty-asc">Easiest First</option>
            <option value="difficulty-desc">Hardest First</option>
            <option value="category">By Category</option>
          </select>

          {/* Bookmarks Toggle */}
          <button
            onClick={() => {
              if (!user) {
                onSignInClick?.();
                return;
              }
              setShowBookmarkedOnly(!showBookmarkedOnly);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
              showBookmarkedOnly
                ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Bookmark className="w-4 h-4" fill={showBookmarkedOnly ? 'currentColor' : 'none'} />
            {user ? (
              <>
                <span className="hidden sm:inline">Saved ({bookmarkedIds.size})</span>
                <span className="sm:hidden">{bookmarkedIds.size}</span>
              </>
            ) : (
              <span className="hidden sm:inline">Sign in to save</span>
            )}
          </button>


          {/* Spacer */}
          <div className="flex-1" />

          {/* View Toggle */}
          <div className="flex rounded-full border border-gray-200 overflow-hidden flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-700">{filteredEvidence.length}</span> of {evidenceData.length} evidence entries
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setShowBookmarkedOnly(false);
                setSortBy('default');
              }}
              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Evidence Grid / List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvidence.map((item) => (
              <EvidenceCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                isBookmarked={bookmarkedIds.has(item.id)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvidence.map((item) => {
              const meta = categoryMeta[item.category];
              const Icon = categoryIcons[meta.icon] || Eye;
              const diffColor = {
                Easy: 'bg-green-100 text-green-700',
                Moderate: 'bg-yellow-100 text-yellow-700',
                Advanced: 'bg-red-100 text-red-700',
              }[item.verificationDifficulty];

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`flex items-start gap-4 p-5 rounded-xl border-2 ${meta.borderColor} ${meta.bgColor} hover:shadow-lg transition-all cursor-pointer group`}
                >
                  <div className={`p-2.5 rounded-lg bg-white/80 shadow-sm ${meta.color} flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold uppercase tracking-wider ${meta.color}`}>{item.category}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffColor}`}>
                        {item.verificationDifficulty}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 text-gray-500 font-medium">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBookmark(item.id);
                    }}
                    className={`p-1.5 rounded-full transition-colors flex-shrink-0 ${
                      bookmarkedIds.has(item.id)
                        ? 'text-amber-500 bg-amber-100'
                        : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={bookmarkedIds.has(item.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* No Results */}
        {filteredEvidence.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No evidence found</h3>
            <p className="text-gray-600 mb-4">
              {showBookmarkedOnly
                ? 'You haven\'t bookmarked any evidence yet. Browse the library and save items for quick access.'
                : 'Try adjusting your filters to find what you\'re looking for.'}
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDifficulty('All');
                setShowBookmarkedOnly(false);
              }}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {allCategories.map((cat) => {
            const meta = categoryMeta[cat];
            const Icon = categoryIcons[meta.icon] || Eye;
            const count = categoryCounts[cat];
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  window.scrollTo({ top: document.getElementById('evidence')!.offsetTop - 20, behavior: 'smooth' });
                }}
                className={`${meta.bgColor} border ${meta.borderColor} rounded-xl p-4 text-center hover:shadow-md transition-all group`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-2 ${meta.color} group-hover:scale-110 transition-transform`} />
                <div className={`text-2xl font-bold ${meta.color}`}>{count}</div>
                <div className="text-xs text-gray-600 font-medium mt-1">{cat}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Evidence Detail Modal */}
      <EvidenceDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        isBookmarked={selectedItem ? bookmarkedIds.has(selectedItem.id) : false}
        onToggleBookmark={() => selectedItem && toggleBookmark(selectedItem.id)}
        onOpenExperiment={handleOpenExperiment}
      />

      {/* Related Experiment Modal */}
      <ExperimentModal
        experiment={relatedExperiment}
        onClose={() => setRelatedExperiment(null)}
        isCompleted={relatedExperiment ? completedExperiments.has(relatedExperiment.id) : false}
        onToggleComplete={() => relatedExperiment && toggleExperimentComplete(relatedExperiment.id)}
        notes={relatedExperiment ? (experimentNotes[relatedExperiment.id] || '') : ''}
        onUpdateNotes={(notes) => relatedExperiment && updateExperimentNotes(relatedExperiment.id, notes)}
        isLoggedIn={!!user}
        onSignInClick={onSignInClick}
      />

    </div>
  );
}
