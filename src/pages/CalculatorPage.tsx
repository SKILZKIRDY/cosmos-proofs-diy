import { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ObservationCalculator from '@/components/ObservationCalculator';
import CalculatorSubmissionForm from '@/components/CalculatorSubmissionForm';
import CommunityResults from '@/components/CommunityResults';
import AuthModal from '@/components/AuthModal';
import { ArrowLeft, Eye } from 'lucide-react';
import type { CalculationData } from '@/lib/submissionService';

export default function CalculatorPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const defaultObserverHeight = searchParams.get('observer') || undefined;
  const defaultTargetHeight = searchParams.get('target') || undefined;
  const defaultDistance = searchParams.get('distance') || undefined;

  // Submission form state
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [pendingCalcData, setPendingCalcData] = useState<CalculationData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmitResult = useCallback((data: CalculationData) => {
    setPendingCalcData(data);
    setShowSubmissionForm(true);
  }, []);

  const handleSignInClick = useCallback(() => {
    setShowAuthModal(true);
  }, []);

  const handleSubmitted = useCallback(() => {
    // Refresh community results after a successful submission
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center">
              <Eye className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">TrueCosmology</span>
          </div>
        </div>
      </nav>

      {/* Calculator */}
      <div className="px-4 py-6 sm:py-10">
        <ObservationCalculator
          defaultObserverHeight={defaultObserverHeight}
          defaultTargetHeight={defaultTargetHeight}
          defaultDistance={defaultDistance}
          onSubmitResult={handleSubmitResult}
          isLoggedIn={!!user}
          onSignInClick={handleSignInClick}
        />
      </div>

      {/* Community Results */}
      <div className="px-4 pb-12">
        <CommunityResults refreshTrigger={refreshTrigger} />
      </div>

      {/* Submission Form Modal */}
      {pendingCalcData && (
        <CalculatorSubmissionForm
          isOpen={showSubmissionForm}
          onClose={() => {
            setShowSubmissionForm(false);
            setPendingCalcData(null);
          }}
          calculationData={pendingCalcData}
          onSubmitted={handleSubmitted}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}
