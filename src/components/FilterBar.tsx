interface FilterBarProps {
  selectedCategory: string;
  selectedDifficulty: string;
  onCategoryChange: (category: string) => void;
  onDifficultyChange: (difficulty: string) => void;
}

export default function FilterBar({
  selectedCategory,
  selectedDifficulty,
  onCategoryChange,
  onDifficultyChange,
}: FilterBarProps) {
  const categories = ['All', 'Horizon', 'Water Level', 'Perspective', 'Celestial', 'Motion', 'Altitude'];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Difficulty select */}
      <div className="ml-auto">
        <select
          value={selectedDifficulty}
          onChange={(e) => onDifficultyChange(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:border-gray-300 transition-colors"
        >
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff === 'All' ? 'All Levels' : diff}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
