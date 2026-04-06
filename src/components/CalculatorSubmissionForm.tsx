import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSubmission, type CalculationData } from '@/lib/submissionService';
import { X, Upload, Loader2, CheckCircle2, Trash2, ImagePlus, AlertCircle, Eye, Mountain, Ruler, Send } from 'lucide-react';

// The experiment ID for "Horizon Distance Observation"
const CALCULATOR_EXPERIMENT_ID = '1';

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_MB = 5;

interface CalculatorSubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  calculationData: CalculationData;
  onSubmitted?: () => void;
}

export default function CalculatorSubmissionForm({
  isOpen,
  onClose,
  calculationData,
  onSubmitted,
}: CalculatorSubmissionFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return `"${file.name}" is not a supported image format. Use JPEG, PNG, WebP, or GIF.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `"${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is ${MAX_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos per submission. You can add ${MAX_PHOTOS - photos.length} more.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    setPhotos(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || submitting) return;

    if (!notes.trim()) {
      setError('Please describe your observation — what did you see? Where were you?');
      return;
    }

    setSubmitting(true);
    setError('');
    setUploadProgress(photos.length > 0 ? `Uploading ${photos.length} photo${photos.length > 1 ? 's' : ''}...` : 'Saving...');

    const { submission, error: subError } = await createSubmission({
      userId: user.id,
      experimentId: CALCULATOR_EXPERIMENT_ID,
      notes: notes.trim(),
      photos,
      calculationData,
    });

    if (!submission && subError) {
      setError(subError);
      setSubmitting(false);
      setUploadProgress('');
    } else {
      setUploadProgress('');
      setSubmitted(true);
      onSubmitted?.();
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    }
  };

  const resetForm = () => {
    setNotes('');
    setPhotos([]);
    setPhotoPreviews([]);
    setSubmitting(false);
    setSubmitted(false);
    setError('');
    setUploadProgress('');
  };

  const handleClose = () => {
    if (submitting) return;
    resetForm();
    onClose();
  };

  // Format helpers
  const obsLabel = `${calculationData.observerHeight} ${calculationData.observerUnit === 'feet' ? 'ft' : 'm'}`;
  const tgtLabel = `${calculationData.targetHeight} ${calculationData.targetUnit === 'feet' ? 'ft' : 'm'}`;
  const distLabel = `${calculationData.distance} ${calculationData.distanceUnit === 'miles' ? 'mi' : 'km'}`;
  const verdictLabel = calculationData.fullyVisible
    ? 'Fully Visible'
    : calculationData.fullyHidden
    ? 'Fully Hidden'
    : 'Partially Hidden';
  const verdictColor = calculationData.fullyVisible
    ? 'text-green-600 bg-green-50 border-green-200'
    : calculationData.fullyHidden
    ? 'text-red-600 bg-red-50 border-red-200'
    : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full my-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Submit Observation</h2>
                <p className="text-cyan-100 text-xs">Share your real-world visibility test with the community</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={submitting}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {submitted ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Observation Published!</h3>
            <p className="text-gray-500 text-sm">
              Your result is now visible in the Community Results section below the calculator.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Pre-filled Calculation Data (read-only) */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Calculation Data</label>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                {/* Input values */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Eye className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] text-gray-400 font-medium uppercase">Observer</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{obsLabel}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Mountain className="w-3 h-3 text-green-500" />
                      <span className="text-[10px] text-gray-400 font-medium uppercase">Target</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{tgtLabel}</span>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <Ruler className="w-3 h-3 text-purple-500" />
                      <span className="text-[10px] text-gray-400 font-medium uppercase">Distance</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{distLabel}</span>
                  </div>
                </div>

                {/* Calculated results */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white rounded-lg border border-gray-200 px-2 py-1.5 text-center">
                    <div className="text-[9px] text-gray-400 font-medium uppercase">Horizon</div>
                    <div className="text-xs font-bold text-gray-700">{calculationData.horizonMi.toFixed(2)} mi</div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-2 py-1.5 text-center">
                    <div className="text-[9px] text-gray-400 font-medium uppercase">Hidden</div>
                    <div className="text-xs font-bold text-gray-700">
                      {calculationData.fullyVisible ? '0 ft' : `${calculationData.hiddenFt.toFixed(1)} ft`}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 px-2 py-1.5 text-center">
                    <div className="text-[9px] text-gray-400 font-medium uppercase">Angle</div>
                    <div className="text-xs font-bold text-gray-700">{calculationData.angleDeg.toFixed(4)}&deg;</div>
                  </div>
                </div>

                {/* Verdict */}
                <div className={`text-center px-3 py-1.5 rounded-lg border text-xs font-semibold ${verdictColor}`}>
                  {verdictLabel}
                </div>
              </div>
            </div>

            {/* Notes / Description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Your Observation Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you actually observed. Where were you? What equipment did you use? Did the target appear visible or hidden? Include weather conditions, time of day, etc."
                rows={4}
                maxLength={2000}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm resize-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">Compare what you saw vs. the calculated prediction</p>
                <p className={`text-xs ${notes.length > 1800 ? 'text-amber-500 font-medium' : 'text-gray-400'}`}>
                  {notes.length}/2,000
                </p>
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Photos <span className="text-gray-400 font-normal text-xs">(optional, max {MAX_PHOTOS})</span>
              </label>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photoPreviews.map((preview, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={preview} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                      <button
                        onClick={() => removePhoto(i)}
                        disabled={submitting}
                        className="absolute top-1.5 right-1.5 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-400 hover:text-cyan-600 hover:bg-cyan-50/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImagePlus className="w-5 h-5" />
                  <span className="font-medium text-xs">
                    {photos.length === 0 ? 'Add Photos of Your Observation' : `Add More (${photos.length}/${MAX_PHOTOS})`}
                  </span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleAddPhotos}
                className="hidden"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Upload progress */}
            {uploadProgress && (
              <div className="flex items-center gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />
                <p className="text-sm text-blue-600">{uploadProgress}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !notes.trim()}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
                submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : !notes.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 active:translate-y-0'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit Observation
                </>
              )}
            </button>

            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Your observation will be publicly visible under Community Results.
              Your display name and profile photo will be shown.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
