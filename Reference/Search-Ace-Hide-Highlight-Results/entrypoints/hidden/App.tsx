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

  const addHiddenPattern = (pattern: string) => {
    store.setValue({
      ...state,
      hiddenResults: { ...state.hiddenResults, [pattern]: true },
    });
  };

  const removeHiddenPattern = (pattern: string) => {
    const { [pattern]: _, ...rest } = state.hiddenResults;
    store.setValue({
      ...state,
      hiddenResults: rest,
    });
  };

  return (
    <div className="p-8 mx-auto text-gray-100 bg-gray-900 my- min-w-screen">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">
          Manage Hidden Search Results
        </h1>
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-300">
          Add a Pattern to Hide
        </h2>
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            id="hiddenPattern"
            placeholder="Enter URL pattern to hide"
            className="flex-1 p-3 text-white placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            onKeyPress={(event) => {
              if (event.key === "Enter") {
                const input = document.getElementById(
                  "hiddenPattern"
                ) as HTMLInputElement;
                if (input.value) {
                  addHiddenPattern(input.value);
                  input.value = "";
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById(
                "hiddenPattern"
              ) as HTMLInputElement;
              if (input.value) {
                addHiddenPattern(input.value);
                input.value = "";
              }
            }}
            className="px-5 py-3 text-white transition-colors duration-200 bg-red-600 rounded-md hover:bg-red-700"
          >
            Add
          </button>
        </div>
        <h2 className="mb-3 text-lg font-semibold text-gray-300">
          Currently Hidden Patterns
        </h2>
        <ul className="space-y-3">
          {Object.keys(state.hiddenResults).map((pattern) => (
            <li
              key={pattern}
              className="flex items-center justify-between p-3 transition-colors bg-gray-700 rounded-lg shadow-sm hover:bg-gray-600"
            >
              <span className="font-mono text-base text-gray-100">
                {pattern}
              </span>
              <button
                onClick={() => removeHiddenPattern(pattern)}
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
