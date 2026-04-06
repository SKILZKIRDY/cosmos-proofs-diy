import { useState } from 'react';
import { Download, Wrench, BookOpen, Video, Users, FileSpreadsheet, ExternalLink, CheckCircle2, Clock } from 'lucide-react';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Download,
  Tool: Wrench,
  Reference: BookOpen,
  Media: Video,
  Discussion: Users,
  Template: FileSpreadsheet,
};

// ──────────────────────────────────────────────────────────────
// RESOURCE DATA — edit titles, descriptions, and URLs here
// Set `url` to a valid URL string to make the card clickable.
// Set `url` to `null` (or remove it) to show a "Coming Soon" badge.
// ──────────────────────────────────────────────────────────────
interface Resource {
  title: string;
  type: string;
  description: string;
  icon: string;
  url: string | null;
}

const resources: Resource[] = [
  {
    title: 'Experiment Guide PDF',
    type: 'Download',
    description: 'Complete guide with all 12 experiments, materials lists, and step-by-step procedures.',
    icon: 'Download',
    url: null,
  },
  {
    title: 'Measurement Calculator',
    type: 'Tool',
    description: 'Interactive tool to calculate expected vs observed distances, curvature, and angles.',
    icon: 'Tool',
    url: null,
  },
  {
    title: 'Equipment List',
    type: 'Reference',
    description: 'Recommended tools, cameras, lasers, and measurement devices with purchase links.',
    icon: 'Reference',
    url: 'https://en.wikipedia.org/wiki/Surveying#Equipment',
  },
  {
    title: 'Video Tutorials',
    type: 'Media',
    description: 'Step-by-step video demonstrations of each experiment with real-world results.',
    icon: 'Media',
    url: 'https://www.youtube.com/results?search_query=flat+earth+experiments',
  },
  {
    title: 'Community Forum',
    type: 'Discussion',
    description: 'Share your results, ask questions, and collaborate with other independent researchers.',
    icon: 'Discussion',
    url: 'https://www.reddit.com/r/flatearth/',
  },
  {
    title: 'Data Templates',
    type: 'Template',
    description: 'Spreadsheet templates to record your observations systematically and share data.',
    icon: 'Template',
    url: null,
  },
  {
    title: 'Curvature Reference Chart',
    type: 'Reference',
    description: 'Quick-reference chart showing expected curvature drop at various distances.',
    icon: 'Reference',
    url: 'https://dizzib.github.io/earth/curve-calc/?d0=30&h0=10&unit=imperial',
  },
  {
    title: 'Photography Guide',
    type: 'Media',
    description: 'How to properly photograph long-distance observations with correct lens settings.',
    icon: 'Media',
    url: 'https://photographylife.com/landscapes/long-distance-photography',
  },
];

const typeColors: Record<string, string> = {
  Download: 'bg-emerald-600',
  Tool: 'bg-purple-600',
  Reference: 'bg-blue-600',
  Media: 'bg-rose-600',
  Discussion: 'bg-amber-600',
  Template: 'bg-cyan-600',
};

export default function ResourcesSection() {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim() && subscribedEmail.includes('@')) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setSubscribedEmail('');
      }, 4000);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            Research Toolkit
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Resources & Tools</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Everything you need to conduct your own independent research and document your findings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {resources.map((resource, idx) => {
            const Icon = iconMap[resource.icon] || BookOpen;
            const hasUrl = !!resource.url;

            // ── Clickable card (has a real URL) ──
            if (hasUrl) {
              return (
                <a
                  key={idx}
                  href={resource.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 no-underline"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className={`px-2.5 py-1 ${typeColors[resource.type] || 'bg-gray-600'} text-white text-xs font-semibold rounded-full`}>
                      {resource.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-cyan-700 transition-colors">{resource.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">{resource.description}</p>
                  <div className="flex items-center gap-1 text-sm text-cyan-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </a>
              );
            }

            // ── Disabled card (no URL yet) ──
            return (
              <div
                key={idx}
                className="group bg-white/70 p-6 rounded-xl border border-gray-200 opacity-75 cursor-default select-none"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-gray-100">
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-500 text-xs font-semibold rounded-full">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-500 mb-2">{resource.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-3">{resource.description}</p>
              </div>
            );
          })}
        </div>

        {/* Newsletter / Stay Updated */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-center text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-3">Stay Updated</h3>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Get notified when new experiments, evidence entries, and calculation tools are added to the platform.
          </p>
          {isSubscribed ? (
            <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-5 h-5" />
              <span>Thanks for subscribing! You'll receive updates soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent backdrop-blur-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-cyan-500/25"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
