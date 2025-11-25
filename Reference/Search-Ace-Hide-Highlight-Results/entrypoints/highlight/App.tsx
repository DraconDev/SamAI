import { useState, useEffect } from "react";
import { Store } from "@/types/types";
import { store } from "@/utils/store";

function App() {
  const [state, setState] = useState<Store | null>(null);

  useEffect(() => {
    if (!state) {
      (async () => {
        const currentState = await store.getValue();
        setState(currentState);
      })();
    }
    store.watch((newValue) => {
      if (newValue) {
        setState(newValue);
      }
    });
  }, []);

  if (!state) return <div>Loading...</div>;

  const addHighlightedPattern = (pattern: string, color: string) => {
    store.setValue({
      ...state,
      highlightedResults: { ...state.highlightedResults, [pattern]: color },
    });
  };

  const removeHighlightedPattern = (pattern: string) => {
    const { [pattern]: _, ...rest } = state.highlightedResults;
    store.setValue({
      ...state,
      highlightedResults: rest,
    });
  };

  const updateDefaultColor = (color: string) => {
    store.setValue({
      ...state,
      defaultHighlightColor: color,
    });
  };

  return (
    <div className="min-w-[400px] p-8 bg-gray-900 text-gray-100 rounded-lg  mx-auto ">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">
          Manage Highlighted Search Results
        </h1>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-300">
          Add a Pattern to Highlight
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            id="highlightPattern"
            placeholder="Enter URL pattern to highlight"
            className="flex-1 p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                const patternInput = document.getElementById(
                  "highlightPattern"
                ) as HTMLInputElement;
                const colorInput = document.getElementById(
                  "highlightColor"
                ) as HTMLInputElement;
                if (patternInput.value) {
                  addHighlightedPattern(patternInput.value, colorInput.value);
                  patternInput.value = "";
                }
              }
            }}
          />
          <input
            type="color"
            id="highlightColor"
            value={state.defaultHighlightColor}
            onChange={(e) => updateDefaultColor(e.target.value)}
            className="w-10 h-10 overflow-hidden rounded-md cursor-pointer"
          />
          <button
            onClick={() => {
              const patternInput = document.getElementById(
                "highlightPattern"
              ) as HTMLInputElement;
              const colorInput = document.getElementById(
                "highlightColor"
              ) as HTMLInputElement;
              if (patternInput.value) {
                addHighlightedPattern(patternInput.value, colorInput.value);
                patternInput.value = "";
              }
            }}
            className="px-5 py-3 text-white transition-colors duration-200 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Add
          </button>
        </div>
        <h2 className="mb-3 text-lg font-semibold text-gray-300">
          Currently Highlighted Patterns
        </h2>
        <ul className="space-y-3">
          {Object.entries(state.highlightedResults).map(([pattern, color]) => (
            <li
              key={pattern}
              className="flex items-center justify-between p-3 transition-colors bg-gray-700 rounded-lg shadow-sm hover:bg-gray-600"
            >
              <div className="flex items-center gap-3">
                <span
                  className="inline-block w-8 h-8 border-2 border-gray-500 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-mono text-base text-gray-100">
                  {pattern}
                </span>
              </div>
              <button
                onClick={() => removeHighlightedPattern(pattern)}
                className="px-3 py-1 text-sm text-red-400 transition-colors rounded-md hover:bg-red-900 hover:text-red-200"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
