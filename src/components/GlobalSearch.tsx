import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, FlaskConical, BookOpen, Wrench, ArrowRight } from 'lucide-react';
import { experiments, Experiment } from '@/data/experiments';
import { evidenceData, EvidenceItem } from '@/data/evidence';

// Resource titles for search
const resourceTitles = [
  'Visibility Test (Observation Calculator)',
  'Visibility Calculator',

  'Experiment Guide PDF',
  'Equipment List',
  'Video Tutorials',
  'Community Forum',
  'Data Templates',
  'Curvature Reference Chart',
  'Photography Guide',

];


export type SearchResultType = 'experiment' | 'evidence' | 'resource';

export interface SearchResult {
  id: string;
  title: string;
  type: SearchResultType;
  subtitle?: string;
  experiment?: Experiment;
  evidence?: EvidenceItem;
}

function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  experiments.forEach((exp) => {
    results.push({
      id: `exp-${exp.id}`,
      title: exp.title,
      type: 'experiment',
      subtitle: `${exp.category} · ${exp.difficulty}`,
      experiment: exp,
    });
  });

  evidenceData.forEach((ev) => {
    results.push({
      id: `ev-${ev.id}`,
      title: ev.title,
      type: 'evidence',
      subtitle: ev.category,
      evidence: ev,
    });
  });

  resourceTitles.forEach((title, idx) => {
    results.push({
      id: `res-${idx}`,
      title,
      type: 'resource',
      subtitle: 'Resource',
    });
  });

  return results;
}

const searchIndex = buildSearchIndex();

interface GlobalSearchProps {
  scrolled: boolean;
  onSelectExperiment: (experiment: Experiment) => void;
  onSelectEvidence: (evidence: EvidenceItem) => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function GlobalSearch({
  scrolled,
  onSelectExperiment,
  onSelectEvidence,
  onScrollToSection,
}: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = query.trim().length > 0
    ? searchIndex.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  const showDropdown = focused && (results.length > 0 || query.trim().length > 0);

  const handleSelect = useCallback((result: SearchResult) => {
    setQuery('');
    setFocused(false);
    inputRef.current?.blur();

    if (result.type === 'experiment' && result.experiment) {
      onScrollToSection('experiments');
      setTimeout(() => onSelectExperiment(result.experiment!), 300);
    } else if (result.type === 'evidence' && result.evidence) {
      onScrollToSection('evidence');
      setTimeout(() => onSelectEvidence(result.evidence!), 300);
    } else if (result.type === 'resource') {
      // Calculator-related resources scroll to calculators section
      const isCalculator = result.title.toLowerCase().includes('calculator') || result.title.toLowerCase().includes('visibility test');

      onScrollToSection(isCalculator ? 'calculators' : 'resources');
    }
  }, [onSelectExperiment, onSelectEvidence, onScrollToSection]);


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setFocused(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && results[highlightedIndex]) {
      e.preventDefault();
      handleSelect(results[highlightedIndex]);
    }
  };

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[data-search-item]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleGlobalKey);
    return () => document.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const typeIcon = (type: SearchResultType) => {
    switch (type) {
      case 'experiment':
        return <FlaskConical className="w-4 h-4 text-blue-500 flex-shrink-0" />;
      case 'evidence':
        return <BookOpen className="w-4 h-4 text-cyan-500 flex-shrink-0" />;
      case 'resource':
        return <Wrench className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
    }
  };

  const typeLabel = (type: SearchResultType) => {
    switch (type) {
      case 'experiment': return 'Experiment';
      case 'evidence': return 'Evidence';
      case 'resource': return 'Resource';
    }
  };

  const typeBadgeColor = (type: SearchResultType) => {
    switch (type) {
      case 'experiment': return 'bg-blue-100 text-blue-600';
      case 'evidence': return 'bg-cyan-100 text-cyan-600';
      case 'resource': return 'bg-emerald-100 text-emerald-600';
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div
        className={`flex items-center gap-2 transition-all duration-300 rounded-lg ${
          focused
            ? scrolled
              ? 'bg-white ring-2 ring-cyan-400/50 shadow-lg w-64 sm:w-80'
              : 'bg-white/20 backdrop-blur-md ring-2 ring-white/30 w-64 sm:w-80'
            : scrolled
              ? 'bg-gray-100/70 hover:bg-gray-100 w-44 sm:w-56'
              : 'bg-white/[0.07] hover:bg-white/[0.12] w-44 sm:w-56'
        }`}
      >
        <Search className={`w-4 h-4 ml-3 flex-shrink-0 transition-colors ${
          focused
            ? scrolled ? 'text-cyan-500' : 'text-white'
            : scrolled ? 'text-gray-400' : 'text-gray-400/70'
        }`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          className={`w-full bg-transparent border-none outline-none text-sm py-2 pr-2 placeholder-current transition-colors ${
            focused
              ? scrolled ? 'text-gray-900 placeholder:text-gray-400' : 'text-white placeholder:text-white/50'
              : scrolled ? 'text-gray-500 placeholder:text-gray-400' : 'text-gray-300/70 placeholder:text-gray-400/50'
          }`}
        />
        {!query && !focused && (
          <kbd className={`hidden sm:inline-flex items-center gap-0.5 mr-2 px-1.5 py-0.5 rounded text-[10px] font-medium flex-shrink-0 ${
            scrolled
              ? 'bg-gray-200/70 text-gray-400 border border-gray-300/50'
              : 'bg-white/10 text-gray-400/60 border border-white/10'
          }`}>
            <span className="text-[9px]">⌘</span>K
          </kbd>
        )}
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className={`mr-2 p-0.5 rounded-full flex-shrink-0 transition-colors ${
              scrolled ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 sm:w-96 sm:left-auto sm:right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
          {results.length > 0 ? (
            <div ref={listRef} className="max-h-80 overflow-y-auto py-1">
              {results.map((result, idx) => (
                <button
                  key={result.id}
                  data-search-item
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                    highlightedIndex === idx
                      ? 'bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {typeIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {highlightQuery(result.title, query)}
                      </span>
                    </div>
                    {result.subtitle && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{result.subtitle}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeBadgeColor(result.type)}`}>
                    {typeLabel(result.type)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <Search className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-500 font-medium">No results found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try searching for experiment or evidence titles
              </p>
            </div>
          )}

          {/* Footer hint */}
          <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between">
            <span className="text-[10px] text-gray-400">
              {results.length > 0 ? `${results.length} result${results.length !== 1 ? 's' : ''}` : ''}
            </span>
            <div className="flex items-center gap-3 text-[10px] text-gray-400">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-gray-100 rounded text-[9px] font-mono">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Highlight matching text in the result title */
function highlightQuery(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span className="text-cyan-600 font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}
