import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createSubmission } from '@/lib/submissionService';
import { experiments } from '@/data/experiments';
import { X, Upload, Loader2, CheckCircle2, FlaskConical, Trash2, ImagePlus, AlertCircle } from 'lucide-react';

interface SubmissionFormProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedExperimentId?: string;
  onSubmitted?: () => void;
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE_MB = 5;

export default function SubmissionForm({ isOpen, onClose, preselectedExperimentId, onSubmitted }: SubmissionFormProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [experimentId, setExperimentId] = useState(preselectedExperimentId || '');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');

  // Reset experiment ID when preselected changes
  useEffect(() => {
    if (preselectedExperimentId) {
      setExperimentId(preselectedExperimentId);
    }
  }, [preselectedExperimentId]);

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

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    setError('');

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user || !experimentId || submitting) return;

    if (!notes.trim() && photos.length === 0) {
      setError('Please add notes or at least one photo to your submission.');
      return;
    }

    if (!notes.trim()) {
      setError('Please describe your results or observations.');
      return;
    }

    setSubmitting(true);
    setError('');
    setUploadProgress(photos.length > 0 ? `Uploading ${photos.length} photo${photos.length > 1 ? 's' : ''}...` : 'Saving...');

    const { submission, error: subError } = await createSubmission({
      userId: user.id,
      experimentId,
      notes: notes.trim(),
      photos,
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
    setExperimentId(preselectedExperimentId || '');
    setNotes('');
    setPhotos([]);
    setPhotoPreviews([]);
    setSubmitting(false);
    setSubmitted(false);
    setError('');
    setUploadProgress('');
  };

  const handleClose = () => {
    if (submitting) return; // Don't close while submitting
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const selectedExperiment = experiments.find(e => e.id === experimentId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-start justify-center p-4 pt-8 overflow-y-auto" onClick={handleClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full my-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Submit Your Results</h2>
              <p className="text-xs text-gray-500">Share your findings with the community</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {submitted ? (
          /* ─── Success State ─── */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submission Published!</h3>
            <p className="text-gray-500 text-sm">
              Your results are now visible on the experiment page and your public profile.
            </p>
          </div>
        ) : (
          /* ─── Form ─── */
          <div className="p-6 space-y-5">
            {/* Experiment selector */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Experiment <span className="text-red-400">*</span>
              </label>
              {preselectedExperimentId && selectedExperiment ? (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <img src={selectedExperiment.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{selectedExperiment.title}</p>
                    <p className="text-xs text-gray-500">{selectedExperiment.category} · {selectedExperiment.difficulty}</p>
                  </div>
                </div>
              ) : (
                <select
                  value={experimentId}
                  onChange={(e) => setExperimentId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">Select an experiment...</option>
                  {experiments.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} ({exp.category})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Notes / Results */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                Your Results / Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe what you observed, measured, and concluded. Include any relevant details like equipment used, weather conditions, location, etc."
                rows={5}
                maxLength={2000}
                disabled={submitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-none transition-all disabled:opacity-50 disabled:bg-gray-50"
              />
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400">Be specific — include measurements, times, and conditions</p>
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

              {/* Photo grid */}
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
                      <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-black/50 rounded text-white text-[10px] font-medium">
                        {(photos[i]?.size / 1024 / 1024).toFixed(1)} MB
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={submitting}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImagePlus className="w-6 h-6" />
                  <span className="font-medium">
                    {photos.length === 0 ? 'Add Photos' : `Add More (${photos.length}/${MAX_PHOTOS})`}
                  </span>
                  <span className="text-xs text-gray-400">JPEG, PNG, WebP, or GIF · Max {MAX_FILE_SIZE_MB} MB each</span>
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
              disabled={submitting || !experimentId || !notes.trim()}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold transition-all ${
                submitting
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : !experimentId || !notes.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 active:translate-y-0'
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
                  Publish Results
                </>
              )}
            </button>

            {/* Privacy note */}
            <p className="text-[11px] text-gray-400 text-center leading-relaxed">
              Your submission will be publicly visible. Your display name and profile photo will be shown.
              No email or private information is shared.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
