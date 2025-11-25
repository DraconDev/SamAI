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
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [highlightOpacity, setHighlightOpacity] = useState(0.3);
  const [enableHighlighting, setEnableHighlighting] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load highlight patterns from localStorage (same as SearchHighlighter)
      const savedPatterns = localStorage.getItem("samai-highlight-patterns");
      if (savedPatterns) {
        const parsed = JSON.parse(savedPatterns);
        setPatterns(parsed.map((p: any) => ({
          ...p,
          category: p.category || "default"
        })));
      } else {
        setPatterns([]);
      }

      // Load other settings
      setSearchActive(localStorage.getItem("samai-search-active") !== "false");
      setPromptStyle((localStorage.getItem("samai-prompt-style") as any) || "short");
      setAutoHighlight(localStorage.getItem("samai-auto-highlight") !== "false");
      setHighlightOpacity(parseFloat(localStorage.getItem("samai-highlight-opacity") || "0.3"));
      setEnableHighlighting(localStorage.getItem("samai-enable-highlighting") !== "false");
      
      console.log("[Search Settings] Loaded patterns:", patterns.length);
    } catch (error) {
      console.error("Error loading search settings:", error);
      setPatterns([]);
    }
  };

  const saveSettings = async () => {
    try {
      // Save patterns to local storage
      localStorage.setItem("samai-highlight-patterns", JSON.stringify(patterns));
      
      // Save other settings
      localStorage.setItem("samai-search-active", searchActive.toString());
      localStorage.setItem("samai-prompt-style", promptStyle);
      localStorage.setItem("samai-auto-highlight", autoHighlight.toString());
      localStorage.setItem("samai-highlight-opacity", highlightOpacity.toString());
      localStorage.setItem("samai-enable-highlighting", enableHighlighting.toString());
      
      // Trigger re-highlighting of search results
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
      case "default": return "🔵"; // Blue
      case "important": return "🔴"; // Red
      case "favorite": return "🟢"; // Green
      default: return "🔵";
    }
  };

  const getColorForCategory = (category: HighlightPattern["category"]) => {
    switch (category) {
      case "default": return "#4f46e5"; // Blue
      case "important": return "#dc2626"; // Red
      case "favorite": return "#059669"; // Green
      default: return "#4f46e5";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] text-gray-100">
      <div className="max-w-4xl p-8 mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-8 mb-8 border-b border-[#2E2F3E]/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] shadow-xl shadow-[#4f46e5]/50">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <circle cx="11" cy="11" r="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text">
                Search Enhancement Settings
              </h1>
              <p className="text-sm text-gray-400">Customize your search experience</p>
            </div>
          </div>
          <button
            onClick={saveSettings}
            className="px-6 py-3 text-sm font-bold bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-xl hover:shadow-xl hover:shadow-[#4f46e5]/30 transition-all duration-300 transform hover:scale-[1.02] border border-[#4f46e5]/30"
          >
            Save Settings
          </button>
        </div>

        <div className="space-y-8">
          {/* Search Behavior Settings */}
          <div className="p-6 bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl border border-[#2E2F3E]/50 shadow-xl">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-300">
              <span className="text-[#4f46e5]">⚙️</span>
              Search Behavior
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block mb-4 text-sm font-bold tracking-wider text-gray-300 uppercase">
                  Response Style
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      value: "short",
                      label: "Short",
                      icon: "⚡",
                      desc: "Quick & concise",
                    },
                    {
                      value: "medium",
                      label: "Medium",
                      icon: "⚖️",
                      desc: "Balanced info",
                    },
                    {
                      value: "long",
                      label: "Long",
                      icon: "📚",
                      desc: "In-depth analysis",
                    },
                  ].map(({ value, label, icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPromptStyle(value as any)}
                      className={`group relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300
                                hover:transform hover:scale-105 hover:shadow-xl
                                ${
                                  promptStyle === value
                                    ? "border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/25 to-[#818cf8]/15 shadow-xl shadow-[#4f46e5]/30"
                                    : "border-[#2E2F3E]/60 hover:border-[#4f46e5]/60 hover:bg-[#4f46e5]/10"
                                }`}
                    >
                      <span className="mb-2 text-xl transition-transform transform group-hover:scale-110">
                        {icon}
                      </span>
                      <span
                        className={`text-sm font-medium mb-1
                                     ${
                                       promptStyle === value
                                         ? "text-[#818cf8]"
                                         : "text-gray-400 group-hover:text-[#818cf8]"
                                     }
                                     transition-colors`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-gray-500 transition-colors group-hover:text-gray-400">
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
                <div>
                  <label className="text-sm font-medium text-gray-200">Enable Search Enhancement</label>
                  <p className="text-xs text-gray-400">Toggle AI-powered search assistance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={searchActive}
                    onChange={(e) => setSearchActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2E2F3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Highlight Patterns */}
          <div className="p-6 bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl border border-[#2E2F3E]/50 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-300">
                <span className="text-[#4f46e5]">🎨</span>
                Highlight Patterns
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addPattern("default")}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  Add Blue
                </button>
                <button
                  onClick={() => addPattern("important")}
                  className="px-3 py-1.5 text-xs font-medium bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Add Red
                </button>
                <button
                  onClick={() => addPattern("favorite")}
                  className="px-3 py-1.5 text-xs font-medium bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 rounded-lg transition-all duration-200 flex items-center gap-2"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Add Green
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {patterns.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p className="mb-2 text-sm">No patterns added yet</p>
                  <p className="text-xs">Use the buttons above to add highlight patterns</p>
                </div>
              ) : (
                patterns.map((pattern) => (
                  <div key={pattern.id} className="p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getIconForCategory(pattern.category)}</span>
                        <span className="text-sm text-gray-400">({pattern.category})</span>
                      </div>
                      <button
                        onClick={() => removePattern(pattern.id)}
                        className="p-2 text-red-400 transition-colors rounded-lg hover:text-red-300 hover:bg-red-900/20"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="grid items-center grid-cols-12 gap-3">
                      <div className="col-span-1">
                        <input
                          type="checkbox"
                          checked={pattern.enabled}
                          onChange={(e) => updatePattern(pattern.id, { enabled: e.target.checked })}
                          className="w-4 h-4 text-[#4f46e5] bg-[#0D0E16] border-[#2E2F3E]/50 rounded focus:ring-[#4f46e5]/50"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="color"
                          value={pattern.color}
                          onChange={(e) => updatePattern(pattern.id, { color: e.target.value })}
                          className="w-full h-8 rounded border border-[#2E2F3E]/50"
                        />
                      </div>
                      <div className="col-span-9">
                        <input
                          type="text"
                          placeholder="Domain or pattern (e.g., wikipedia.org, github.com)"
                          value={pattern.pattern}
                          onChange={(e) => updatePattern(pattern.id, { pattern: e.target.value })}
                          className="w-full p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-[#4f46e5]"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Highlight Settings */}
          <div className="p-6 bg-gradient-to-br from-[#1E1F2E] to-[#16172a] rounded-2xl border border-[#2E2F3E]/50 shadow-xl">
            <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-300">
              <span className="text-[#4f46e5]">🎯</span>
              Highlight Settings
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
                <div>
                  <label className="text-sm font-medium text-gray-200">Enable Highlighting</label>
                  <p className="text-xs text-gray-400">Show highlight buttons and controls</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableHighlighting}
                    onChange={(e) => setEnableHighlighting(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2E2F3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
                <div>
                  <label className="text-sm font-medium text-gray-200">Auto-highlight results</label>
                  <p className="text-xs text-gray-400">Automatically apply highlights to search results</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoHighlight}
                    onChange={(e) => setAutoHighlight(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#2E2F3E] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4f46e5]"></div>
                </label>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-400">
                  Highlight Opacity: {Math.round(highlightOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={highlightOpacity}
                  onChange={(e) => setHighlightOpacity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#2E2F3E] rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-[#0D0E16]/20 border border-[#2E2F3E]/30 rounded-2xl">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">How it works:</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 mt-1 bg-blue-500 rounded-full"></div>
                <span><strong>Blue</strong> - General highlights for informational sites</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 mt-1 bg-red-500 rounded-full"></div>
                <span><strong>Red</strong> - Highlight important or trusted sites</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-3 h-3 mt-1 bg-green-500 rounded-full"></div>
                <span><strong>Green</strong> - Highlight your favorite or frequently used sites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-gray-400">✕</span>
                <span><strong>Hide button</strong> - Hide domains directly from search results</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CSS for slider styling is in index.html */}
    </div>
  );
}