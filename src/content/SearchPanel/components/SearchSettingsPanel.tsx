import type { OutputFormat } from "@/utils/page-content";
import { searchSettingsStore } from "@/utils/store";
import React, { useEffect, useState } from "react";

interface HighlightPattern {
  id: string;
  pattern: string;
  type: "favorite" | "hide";
  description: string;
  enabled: boolean;
}

interface SearchSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchSettingsPanel({
  isOpen,
  onClose,
}: SearchSettingsPanelProps) {
  const [patterns, setPatterns] = useState<HighlightPattern[]>([]);
  const [searchActive, setSearchActive] = useState(true);
  const [promptStyle, setPromptStyle] = useState<"short" | "medium" | "long">(
    "short"
  );
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("text");
  const [autoHighlight, setAutoHighlight] = useState(true);
  const [highlightOpacity, setHighlightOpacity] = useState(0.3);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const settings = await searchSettingsStore.getValue();
      setSearchActive(settings.searchActive ?? true);
      setPromptStyle(settings.promptStyle ?? "short");
      setOutputFormat(settings.outputFormat ?? "text");

      // Load highlight patterns from local storage or default
      const savedPatterns = localStorage.getItem("samai-highlight-patterns");
      if (savedPatterns) {
        setPatterns(JSON.parse(savedPatterns));
      } else {
        // Default patterns
        setPatterns([
          {
            id: "1",
            pattern: "wikipedia.org",
            type: "favorite",
            description: "Wikipedia articles",
            enabled: true,
          },
          {
            id: "2",
            pattern: "github.com",
            type: "favorite",
            description: "GitHub repositories",
            enabled: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading search settings:", error);
    }
  };

  const saveSettings = async () => {
    try {
      await searchSettingsStore.setValue({
        searchActive,
        promptStyle,
        outputFormat,
        showFloatingIcon: true,
      });

      // Save patterns to local storage
      localStorage.setItem(
        "samai-highlight-patterns",
        JSON.stringify(patterns)
      );

      // Trigger re-highlighting of search results
      window.postMessage({ type: "SAMAI_SEARCH_SETTINGS_UPDATED" }, "*");
    } catch (error) {
      console.error("Error saving search settings:", error);
    }
  };

  const addPattern = () => {
    const newPattern: HighlightPattern = {
      id: Date.now().toString(),
      pattern: "",
      type: "favorite",
      description: "",
      enabled: true,
    };
    setPatterns([...patterns, newPattern]);
  };

  const updatePattern = (id: string, updates: Partial<HighlightPattern>) => {
    setPatterns(patterns.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const removePattern = (id: string) => {
    setPatterns(patterns.filter((p) => p.id !== id));
  };

  const togglePattern = (id: string) => {
    setPatterns(
      patterns.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const exportSettings = () => {
    const exportData = {
      patterns,
      searchActive,
      promptStyle,
      outputFormat,
      autoHighlight,
      highlightOpacity,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `samai-search-settings-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.patterns) setPatterns(data.patterns);
        if (data.searchActive !== undefined) setSearchActive(data.searchActive);
        if (data.promptStyle) setPromptStyle(data.promptStyle);
        if (data.outputFormat) setOutputFormat(data.outputFormat);
        if (data.autoHighlight !== undefined)
          setAutoHighlight(data.autoHighlight);
        if (data.highlightOpacity !== undefined)
          setHighlightOpacity(data.highlightOpacity);
      } catch (error) {
        console.error("Error importing settings:", error);
        alert("Invalid settings file");
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm search-settings-panel">
      <div className="w-[600px] max-h-[80vh] bg-gradient-to-br from-[#1a1b2e] to-[#0D0E16] border border-[#2E2F3E]/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2E2F3E]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4f46e5] to-[#818cf8] flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <circle cx="11" cy="11" r="3" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-transparent bg-gradient-to-r from-[#818cf8] via-[#6366f1] to-[#4f46e5] bg-clip-text">
                Search Enhancement Settings
              </h2>
              <p className="text-xs text-gray-400">
                Customize your search experience
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#2E2F3E]/50 rounded-lg transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Search Behavior Settings */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span className="text-[#4f46e5]">⚙️</span>
              Search Behavior
            </h3>

            <div className="space-y-4">
              <label className="block mb-3 text-xs font-bold tracking-wider text-gray-300 uppercase">
                Response Style
              </label>
              <div className="grid grid-cols-3 gap-2">
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
                    className={`group relative flex flex-col items-center p-3 rounded-xl border transition-all duration-300
                              hover:transform hover:scale-105 hover:shadow-xl
                              ${
                                promptStyle === value
                                  ? "border-[#4f46e5] bg-gradient-to-br from-[#4f46e5]/25 to-[#818cf8]/15 shadow-xl shadow-[#4f46e5]/30"
                                  : "border-[#2E2F3E]/60 hover:border-[#4f46e5]/60 hover:bg-[#4f46e5]/10"
                              }`}
                  >
                    <span className="mb-1 text-lg transition-transform transform group-hover:scale-110">
                      {icon}
                    </span>
                    <span
                      className={`text-xs font-medium mb-0.5
                                   ${
                                     promptStyle === value
                                       ? "text-[#818cf8]"
                                       : "text-gray-400 group-hover:text-[#818cf8]"
                                   }
                                   transition-colors`}
                    >
                      {label}
                    </span>
                    <span className="text-[10px] text-gray-500 transition-colors group-hover:text-gray-400">
                      {desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
              <div>
                <label className="text-sm font-medium text-gray-200">
                  Enable Search Enhancement
                </label>
                <p className="text-xs text-gray-400">
                  Toggle AI-powered search assistance
                </p>
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

          {/* Highlight Patterns */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                <span className="text-[#4f46e5]">🎨</span>
                Highlight Patterns
              </h3>
              <button
                onClick={addPattern}
                className="px-3 py-1.5 text-xs font-medium bg-[#4f46e5]/20 hover:bg-[#4f46e5]/30 text-[#818cf8] border border-[#4f46e5]/30 rounded-lg transition-all duration-200"
              >
                + Add Pattern
              </button>
            </div>

            <div className="space-y-3">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30"
                >
                  <div className="grid items-center grid-cols-12 gap-3">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={pattern.enabled}
                        onChange={() => togglePattern(pattern.id)}
                        className="w-4 h-4 text-[#4f46e5] bg-[#0D0E16] border-[#2E2F3E]/50 rounded focus:ring-[#4f46e5]/50"
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        value={pattern.type}
                        onChange={(e) =>
                          updatePattern(pattern.id, {
                            type: e.target.value as "favorite" | "hide",
                          })
                        }
                        className="w-full h-8 bg-[#0D0E16] border border-[#2E2F3E]/50 rounded text-sm text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/50"
                      >
                        <option value="favorite">⭐ Favorite</option>
                        <option value="hide">🚫 Hide</option>
                      </select>
                    </div>
                    <div className="col-span-7">
                      <input
                        type="text"
                        placeholder="Domain or pattern (e.g., wikipedia.org, github.com, *.edu)"
                        value={pattern.pattern}
                        onChange={(e) =>
                          updatePattern(pattern.id, { pattern: e.target.value })
                        }
                        className="w-full p-2 bg-[#0D0E16] border border-[#2E2F3E]/50 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#4f46e5]/50"
                      />
                    </div>
                    <div className="col-span-1">
                      <button
                        onClick={() => removePattern(pattern.id)}
                        className="p-2 text-red-400 transition-colors rounded hover:text-red-300 hover:bg-red-900/20"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {patterns.length === 0 && (
              <div className="py-8 text-center text-gray-500">
                <p className="text-sm">No highlight patterns added yet</p>
                <p className="text-xs">
                  Add patterns to automatically highlight search results
                </p>
              </div>
            )}
          </div>

          {/* Highlight Settings */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span className="text-[#4f46e5]">🎯</span>
              Highlight Settings
            </h3>

            <div className="flex items-center justify-between p-4 bg-[#0D0E16]/30 rounded-xl border border-[#2E2F3E]/30">
              <div>
                <label className="text-sm font-medium text-gray-200">
                  Auto-highlight results
                </label>
                <p className="text-xs text-gray-400">
                  Automatically apply highlights to search results
                </p>
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
              <label className="block mb-2 text-xs font-medium text-gray-400">
                Highlight Opacity: {Math.round(highlightOpacity * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={highlightOpacity}
                onChange={(e) =>
                  setHighlightOpacity(parseFloat(e.target.value))
                }
                className="w-full h-2 bg-[#2E2F3E] rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Import/Export */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-300">
              <span className="text-[#4f46e5]">💾</span>
              Settings Management
            </h3>

            <div className="flex gap-3">
              <button
                onClick={exportSettings}
                className="flex-1 p-3 bg-[#059669]/20 hover:bg-[#059669]/30 border border-[#059669]/30 text-[#34d399] rounded-xl text-sm font-medium transition-all duration-200"
              >
                📤 Export Settings
              </button>
              <label className="flex-1 p-3 bg-[#4f46e5]/20 hover:bg-[#4f46e5]/30 border border-[#4f46e5]/30 text-[#818cf8] rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-center">
                📥 Import Settings
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-[#2E2F3E]/30">
          <button
            onClick={() => {
              localStorage.removeItem("samai-highlight-patterns");
              setPatterns([]);
            }}
            className="px-4 py-2 text-sm font-medium text-red-400 transition-colors rounded-lg hover:text-red-300 hover:bg-red-900/20"
          >
            Reset to Defaults
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2E2F3E]/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                saveSettings();
                onClose();
              }}
              className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-[#4f46e5] to-[#818cf8] text-white rounded-lg hover:shadow-xl hover:shadow-[#4f46e5]/30 transition-all duration-300"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
