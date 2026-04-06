import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Hero from './Hero';
import FilterBar from './FilterBar';
import ExperimentCard from './ExperimentCard';
import ExperimentModal from './ExperimentModal';
import EvidenceSection from './EvidenceSection';
import ResourcesSection from './ResourcesSection';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import GlobalSearch from './GlobalSearch';
import SubmissionForm from './SubmissionForm';
import CommunityStatsBar from './CommunityStatsBar';
import ObservationCalculator from './ObservationCalculator';

import { experiments, Experiment } from '../data/experiments';
import { EvidenceItem } from '../data/evidence';
import { getFeaturedContributors, ContributorProfile } from '@/lib/communityService';
import { Menu, X, LogIn, FlaskConical, CheckCircle2, Users, Plus, Loader2, MapPin, FileText, Award, Star, TrendingUp, UserPlus, Trophy, Zap, Eye, ExternalLink, Calculator, ArrowRight, Flame } from 'lucide-react';


export default function AppLayout() {
  const navigate = useNavigate();
  const {
    user,
    completedExperiments,
    toggleExperimentComplete,
    experimentNotes,
    updateExperimentNotes
  } = useAuth();
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [submissionFormOpen, setSubmissionFormOpen] = useState(false);
  const [featuredContributors, setFeaturedContributors] = useState<ContributorProfile[]>([]);
  const [loadingContributors, setLoadingContributors] = useState(false);

  // Global search: evidence selection
  const [externalSelectedEvidence, setExternalSelectedEvidence] = useState<EvidenceItem | null>(null);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    loadFeaturedContributors();
  }, []);
  const loadFeaturedContributors = async () => {
    setLoadingContributors(true);
    const data = await getFeaturedContributors(6);
    setFeaturedContributors(data);
    setLoadingContributors(false);
  };
  const filteredExperiments = experiments.filter(exp => {
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || exp.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });
  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  };

  // Global search handlers
  const handleSearchSelectExperiment = useCallback((experiment: Experiment) => {
    setSelectedExperiment(experiment);
  }, []);
  const handleSearchSelectEvidence = useCallback((evidence: EvidenceItem) => {
    setExternalSelectedEvidence(evidence);
  }, []);
  const handleClearExternalEvidence = useCallback(() => {
    setExternalSelectedEvidence(null);
  }, []);
  const navLinks = [{
    label: 'Experiments',
    id: 'experiments'
  }, {
    label: 'Community',
    id: 'community'
  }, {
    label: 'Calculators',
    id: 'calculators'
  }, {
    label: 'Evidence',
    id: 'evidence'
  }, {
    label: 'Resources',
    id: 'resources'
  }];
  const completedCount = completedExperiments.size;
  const totalExperiments = experiments.length;
  return <div className="min-h-screen bg-gray-50">
      {/* Sticky Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${scrolled ? 'bg-cyan-500' : 'bg-cyan-500/80'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className={`font-bold text-lg hidden sm:inline ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                TrueCosmology
              </span>
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => <button key={link.id} onClick={() => scrollTo(link.id)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${scrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
                  {link.label}
                </button>)}
            </div>

            <div className="flex items-center gap-3">
              {/* Global Search */}
              <GlobalSearch scrolled={scrolled} onSelectExperiment={handleSearchSelectExperiment} onSelectEvidence={handleSearchSelectEvidence} onScrollToSection={scrollTo} />

              {user && completedCount > 0 && <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${scrolled ? 'bg-green-50 text-green-700' : 'bg-white/10 text-green-300'}`} data-mixed-content="true" data-mixed-content="true">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {completedCount}/{totalExperiments}
                </div>}

              {user ? <UserMenu scrolled={scrolled} /> : <button onClick={() => setAuthModalOpen(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${scrolled ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 hover:shadow-lg hover:shadow-cyan-500/30' : 'bg-white/15 backdrop-blur-sm text-white border border-white/25 hover:bg-white/25'}`}>
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(link => <button key={link.id} onClick={() => scrollTo(link.id)} className="block w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 font-medium">
                  {link.label}
                </button>)}
              {!user && <button onClick={() => {
            setMobileMenuOpen(false);
            setAuthModalOpen(true);
          }} className="block w-full text-left px-4 py-3 rounded-lg text-cyan-600 hover:bg-cyan-50 font-semibold">
                  Sign In / Create Account
                </button>}
              {user && <div className="px-4 py-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FlaskConical className="w-4 h-4" />
                    <span data-mixed-content="true" data-mixed-content="true">{completedCount} of {totalExperiments} experiments completed</span>
                  </div>
                </div>}
            </div>
          </div>}
      </nav>

      <Hero />
      
      {/* Experiments Section */}
      <div id="experiments" className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            </svg>
            Hands-On Science
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Experiments You Can Perform</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">All experiments are designed to be repeatable by anyone, anywhere, with commonly available equipment</p>
          
          {user && <div className="mt-6 max-w-md mx-auto">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Your Progress</span>
                <span className="font-semibold text-gray-700" data-mixed-content="true">{completedCount} / {totalExperiments} completed</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500" style={{
              width: `${completedCount / totalExperiments * 100}%`
            }} />
              </div>
            </div>}
        </div>

        {/* ═══ Featured: Observation Calculator ═══ */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/calculator')}
            className="group relative w-full text-left overflow-hidden rounded-2xl border-2 border-cyan-200 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5"
          >
            {/* Animated glow ring */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 opacity-20 group-hover:opacity-30 blur-sm transition-opacity" />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-8">
              {/* Icon */}
              <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wide border border-amber-500/30">
                    <Flame className="w-3 h-3" />
                    Most Used by Researchers
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 text-cyan-200 rounded-full text-xs font-semibold">
                    <Eye className="w-3 h-3" />
                    Featured Tool
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1.5 group-hover:text-cyan-100 transition-colors">
                  Run the Visibility Test
                </h3>
                <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl">
                  Enter your measurements and see what should be visible. Calculate horizon distance, hidden height, and viewing angle — all in one compact tool.
                </p>


                {/* Feature pills */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {['Horizon Distance', 'Hidden Height', 'Viewing Angle', 'Visual Diagram'].map(
                    (feat) => (
                      <span
                        key={feat}
                        className="px-2.5 py-1 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-medium"
                      >
                        {feat}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* CTA arrow */}
              <div className="hidden sm:flex flex-shrink-0 items-center justify-center w-12 h-12 rounded-xl bg-white/10 group-hover:bg-cyan-500/20 transition-colors">
                <ArrowRight className="w-5 h-5 text-cyan-300 group-hover:translate-x-0.5 transition-transform" />
              </div>

              {/* Mobile CTA */}
              <div className="sm:hidden flex items-center gap-2 text-cyan-300 text-sm font-semibold">
                Open Calculator
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </button>
        </div>

        <FilterBar selectedCategory={selectedCategory} selectedDifficulty={selectedDifficulty} onCategoryChange={setSelectedCategory} onDifficultyChange={setSelectedDifficulty} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExperiments.map(experiment => <ExperimentCard key={experiment.id} experiment={experiment} onClick={() => setSelectedExperiment(experiment)} isCompleted={completedExperiments.has(experiment.id)} onToggleComplete={() => {
            if (!user) {
              setAuthModalOpen(true);
              return;
            }
            toggleExperimentComplete(experiment.id);
          }} />)}
        </div>


        {filteredExperiments.length === 0 && <div className="text-center py-12">
            <p className="text-xl text-gray-600">No experiments match your filters. Try adjusting your selection.</p>
          </div>}
      </div>


      {/* ===== COMMUNITY SECTION ===== */}
      <div id="community" className="bg-gradient-to-br from-slate-50 via-white to-indigo-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-20">
          {/* Community Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              <Users className="w-4 h-4" />
              Real Community
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Real Research</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto"> Every contribution is from a real member. No fake testimonials, no inflated stats — just authentic community activity.</p>
          </div>

          {/* Real Activity Counters */}
          <CommunityStatsBar className="mb-16" />

          {/* Top Contributors */}
          <div>
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-4">
                <Trophy className="w-4 h-4" />
                Top Contributors
              </div>
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Community Leaders
              </h3>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Members making the most impact through submissions, verified experiments, and community engagement.
              </p>
            </div>

            {loadingContributors ? <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              </div> : featuredContributors.length === 0 ? <div className="max-w-2xl mx-auto">

                <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm">
                  {/* Decorative gradient top bar */}
                  <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  
                  <div className="p-8 sm:p-10 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
                      <TrendingUp className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">
                      Be the First Contributor
                    </h4>
                    <p className="text-gray-500 max-w-md mx-auto mb-8">
                      Submit your first experiment result to appear on the leaderboard. 
                      Every field report, comment, and reaction builds your score.
                    </p>

                    {/* Scoring breakdown */}
                    <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <FileText className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
                        <div className="text-lg font-bold text-gray-900">10</div>
                        <div className="text-xs text-gray-400">per report</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <Users className="w-5 h-5 text-green-500 mx-auto mb-1.5" />
                        <div className="text-lg font-bold text-gray-900">3</div>
                        <div className="text-xs text-gray-400">per comment</div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <Star className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                        <div className="text-lg font-bold text-gray-900">2</div>
                        <div className="text-xs text-gray-400">per reaction</div>
                      </div>
                    </div>

                    {user ? <button onClick={() => setSubmissionFormOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:-translate-y-0.5">
                        <Plus className="w-4 h-4" />
                        Submit Your First Result
                      </button> : <button onClick={() => setAuthModalOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/25 transition-all hover:-translate-y-0.5">
                        <UserPlus className="w-4 h-4" />
                        Join & Start Contributing
                      </button>}
                  </div>
                </div>
              </div> : (/* Contributors grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredContributors.map((contributor, index) => {
              const displayName = contributor.display_name || 'Anonymous';
              const initials = displayName.slice(0, 2).toUpperCase();

              // Rank styling
              const rankStyles = [{
                gradient: 'from-amber-400 to-yellow-500',
                ring: 'ring-amber-200',
                badge: 'bg-amber-500 text-white',
                label: '1st'
              }, {
                gradient: 'from-gray-300 to-gray-400',
                ring: 'ring-gray-200',
                badge: 'bg-gray-400 text-white',
                label: '2nd'
              }, {
                gradient: 'from-orange-400 to-amber-600',
                ring: 'ring-orange-200',
                badge: 'bg-orange-500 text-white',
                label: '3rd'
              }];
              const rank = index < 3 ? rankStyles[index] : {
                gradient: 'from-indigo-400 to-purple-500',
                ring: 'ring-indigo-200',
                badge: 'bg-indigo-100 text-indigo-700',
                label: `#${index + 1}`
              };
              return <button key={contributor.id} onClick={() => navigate(`/profile/${contributor.id}`)} className={`group relative bg-white rounded-2xl border text-left hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${index === 0 ? 'border-amber-200 shadow-md shadow-amber-100/50' : 'border-gray-200 hover:border-indigo-200'}`}>
                      {/* Top accent for #1 */}
                      {index === 0 && <div className="h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400" />}

                      <div className={`p-5 ${index === 0 ? '' : 'pt-5'}`}>
                        <div className="flex items-start gap-4">
                          {/* Avatar with rank badge */}
                          <div className="relative flex-shrink-0">
                            <div className={`w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br ${rank.gradient} ${rank.ring} ring-2 flex items-center justify-center`}>
                              {contributor.avatar_url ? <img src={contributor.avatar_url} alt={displayName} className="w-full h-full object-cover" /> : <span className="text-white text-lg font-bold">{initials}</span>}
                            </div>
                            <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center shadow-sm text-xs font-bold ${rank.badge}`}>
                              {rank.label}
                            </div>
                          </div>

                          {/* Name & location */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate text-[15px]">
                              {displayName}
                            </h4>
                            {contributor.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{contributor.location}</span>
                              </p>}
                            {contributor.bio && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{contributor.bio}</p>}
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-2.5 py-2">
                            <FileText className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-bold text-purple-700">{contributor.submission_count}</div>
                              <div className="text-[10px] text-purple-400 leading-none">Reports</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-2.5 py-2">
                            <FlaskConical className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-bold text-blue-700">{contributor.unique_experiments}</div>
                              <div className="text-[10px] text-blue-400 leading-none">Experiments</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 bg-indigo-50 rounded-lg px-2.5 py-2">
                            <Zap className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                            <div>
                              <div className="text-sm font-bold text-indigo-700">{contributor.contribution_score}</div>
                              <div className="text-[10px] text-indigo-400 leading-none">Score</div>
                            </div>
                          </div>
                        </div>

                        {/* Founding member badge */}
                        {contributor.is_founding_member && <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold">
                            <Award className="w-3 h-3" />
                            Founding Contributor
                          </div>}
                      </div>
                    </button>;
            })}
              </div>)}

            {/* Submit CTA for logged-in users when there are contributors */}
            {featuredContributors.length > 0 && user && <div className="text-center mt-8">
                <button onClick={() => setSubmissionFormOpen(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                  <Plus className="w-4 h-4" />
                  Submit Your Results
                </button>
              </div>}
          </div>

          {/* Join CTA (for non-logged-in users) */}
          {!user && <div className="mt-16 relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-center">
              <div className="absolute inset-0 opacity-[0.05]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
              <div className="relative">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                  Join the Research Community
                </h3>
                <p className="text-gray-300 max-w-xl mx-auto mb-8">
                  Create your free account to submit experiment results, react to field reports, 
                  join discussions, and build your researcher profile. No spam, no fake engagement — 
                  just real science.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button onClick={() => setAuthModalOpen(true)} className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all hover:-translate-y-0.5">
                    <UserPlus className="w-5 h-5" />
                    Create Free Account
                  </button>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Free forever
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      No spam
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      Privacy first
                    </span>
                  </div>
                </div>
              </div>
            </div>}
        </div>
      </div>

      {/* Calculators Section */}
      <div id="calculators" className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <Flame className="w-3.5 h-3.5" />
              Most Used by Researchers
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Run the Visibility Test</h2>
            <p className="text-gray-500 max-w-lg mx-auto text-sm">
              Enter your measurements and see what should be visible
            </p>
          </div>


          {/* Unified Observation Calculator */}
          <ObservationCalculator />

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/calculator')}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-cyan-600 transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in full page
            </button>
          </div>


        </div>
      </div>



      {/* Evidence Section */}
      <EvidenceSection onSignInClick={() => setAuthModalOpen(true)} externalSelectedEvidence={externalSelectedEvidence} onClearExternalSelection={handleClearExternalEvidence} />

      {/* Resources Section */}
      <div id="resources">
        <ResourcesSection />
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-bold text-lg text-white">TrueCosmology</span>
              </div>
              <p className="text-sm leading-relaxed mb-4">
                An open-source research platform dedicated to empirical observation and repeatable experiments. 
                Question everything. Verify everything.
              </p>
              {!user && <button onClick={() => setAuthModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm font-medium transition-colors">
                  <LogIn className="w-4 h-4" />
                  Sign in to save progress
                </button>}
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                {navLinks.map(link => <li key={link.id}>
                    <button onClick={() => scrollTo(link.id)} className="text-sm hover:text-cyan-400 transition-colors">
                      {link.label}
                    </button>
                  </li>)}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Evidence Categories</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Horizon & Visibility</button></li>
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Water & Level</button></li>
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Celestial Observations</button></li>
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Motion & Physics</button></li>
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Navigation & Mapping</button></li>
                <li><button onClick={() => scrollTo('evidence')} className="hover:text-cyan-400 transition-colors">Photography & Optics</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Our Principles</h4>
              <ul className="space-y-3 text-sm">
                {['Empirical observation over authority', 'Repeatable experiments anyone can do', 'Open data and transparent methods', 'Question everything, verify everything'].map(principle => <li key={principle} className="flex items-start gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                    {principle}
                  </li>)}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              TrueCosmology Research Platform. Knowledge through observation.
            </p>
            <button onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
              <span>Back to top</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

      {/* Experiment Modal */}
      <ExperimentModal experiment={selectedExperiment} onClose={() => setSelectedExperiment(null)} isCompleted={selectedExperiment ? completedExperiments.has(selectedExperiment.id) : false} onToggleComplete={() => selectedExperiment && toggleExperimentComplete(selectedExperiment.id)} notes={selectedExperiment ? experimentNotes[selectedExperiment.id] || '' : ''} onUpdateNotes={notes => selectedExperiment && updateExperimentNotes(selectedExperiment.id, notes)} isLoggedIn={!!user} onSignInClick={() => setAuthModalOpen(true)} />

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      {/* Submission Form Modal */}
      <SubmissionForm isOpen={submissionFormOpen} onClose={() => setSubmissionFormOpen(false)} onSubmitted={() => {
      loadFeaturedContributors();
    }} />
    </div>;
}