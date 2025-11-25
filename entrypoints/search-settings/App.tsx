import { useEffect, useState } from "react";

interface HighlightPattern {
  id: string;
  pattern: string;
  color: string;
  description: string;
  enabled: boolean;
  category: "default" | "important" | "favorite";
}

export default function SearchSettingsPage() {
  const [patterns, setPatterns] = useState<HighlightPattern[]>([]);
  const [searchActive, setSearchActive] = useState(true);
  const [promptStyle, setPromptStyle] = useState<"short" | "medium" | "long">("short");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // Load highlight patterns from local storage
    const savedPatterns = localStorage.getItem("samai-highlight-patterns");
    if (savedPatterns) {
      try {
        const parsed = JSON.parse(savedPatterns);
        setPatterns(parsed.map((p: any) => ({ 
          ...p, 
          category: p.category || "default" 
        })));
      } catch (error) {
        console.error("Error parsing patterns:", error);
        setPatterns([]);
      }
    } else {
      setPatterns([]);
    }
  };

  const saveSettings = async () => {
    try {
      localStorage.setItem("samai-highlight-patterns", JSON.stringify(patterns));
      window.postMessage({ type: "SAMAI_SEARCH_SETTINGS_UPDATED" }, "*");
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings");
    }
  };

  const addPattern = (category: HighlightPattern["category"] = "default") => {
    const newPattern: HighlightPattern = {
      id: Date.now().toString(),
      pattern: "",
      color: category === "default" ? "#4f46e5" : category === "important" ? "#dc2626" : "#059669",
      description: "",
      enabled: true,
      category,
    };
    setPatterns([...patterns, newPattern]);
  };

  const updatePattern = (id: string, updates: Partial<HighlightPattern>) => {
    setPatterns(patterns.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const removePattern = (id: string) => {
    setPatterns(patterns.filter(p => p.id !== id));
  };

  const getIconForCategory = (category: HighlightPattern["category"]) => {
    switch (category) {
      case "default": return "☆";
      case "important": return "★";
      case "favorite": return "⭐";
      default: return "☆";
    }
  };

  const getColorForCategory = (category: HighlightPattern["category"]) => {
    switch (category) {
      case "default": return "#4f46e5";
      case "important": return "#dc2626";
      case "favorite": return "#059669";
      default: return "#4f46e5";
    }
  };

  return (
    <div className="min-w-[400px] p-8 bg-gray-900 text-gray-100 rounded-lg mx-auto">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">
          Search Enhancement Settings
        </h1>
      </div>

      <div className="space-y-8">
        {/* Quick Add Buttons */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-300">
            Quick Add Patterns
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => addPattern("default")}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              ☆ Add Default (Blue)
            </button>
            <button
              onClick={() => addPattern("important")}
              className="px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700"
            >
              ★ Add Important (Red)
            </button>
            <button
              onClick={() => addPattern("favorite")}
              className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              ⭐ Add Favorite (Green)
            </button>
          </div>
        </div>

        {/* Current Patterns */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-300">
              Active Patterns ({patterns.length})
            </h2>
            <button
              onClick={saveSettings}
              className="px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700"
            >
              Save Settings
            </button>
          </div>

          {patterns.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <p className="mb-2 text-lg">No patterns added yet</p>
              <p className="text-sm">Use the buttons above to add highlight patterns</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div key={pattern.id} className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getIconForCategory(pattern.category)}</span>
                      <span className="text-sm text-gray-400">({pattern.category})</span>
                    </div>
                    <button
                      onClick={() => removePattern(pattern.id)}
                      className="text-red-400 transition-colors hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Domain or pattern (e.g., wikipedia.org, github.com)"
                    value={pattern.pattern}
                    onChange={(e) => updatePattern(pattern.id, { pattern: e.target.value })}
                    className="w-full p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-4 bg-gray-800 border border-gray-600 rounded-lg">
          <h3 className="mb-2 text-sm font-semibold text-gray-300">How it works:</h3>
          <ul className="space-y-1 text-sm text-gray-400">
            <li>• <strong>☆ (Default)</strong> - General highlights in blue</li>
            <li>• <strong>★ (Important)</strong> - Important sites in red</li>
            <li>• <strong>⭐ (Favorite)</strong> - Favorite sites in green</li>
            <li>• <strong>X button</strong> - Hide domains directly on search results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}