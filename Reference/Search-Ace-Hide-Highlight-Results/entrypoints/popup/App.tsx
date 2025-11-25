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

  const toggleSuspended = async () => {
    await store.setValue({
      ...state,
      suspended: !state.suspended,
    });
    // Reload the active tab after updating the store
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      if (tabs[0]) {
        browser.tabs.reload(tabs[0].id);
      }
    });
  };

  const openHiddenPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    browser.tabs.create({ url: browser.runtime.getURL("/hidden.html") });
  };

  const openHighlightPage = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    browser.tabs.create({ url: browser.runtime.getURL("/highlight.html") });
  };

  return (
    <div className="p-6 text-gray-100 bg-zinc-800 rounded-lg shadow-md min-w-[400px] font-sans">
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-700">
        <h1 className="mx-auto text-2xl font-bold text-white">
          Search Results Manager
        </h1>
      </div>
      <div className="flex flex-col gap-4 mb-4">
        <a
          href="#"
          onClick={openHiddenPage}
          className="block w-full px-4 py-2 text-base font-semibold text-center text-white transition-colors duration-200 bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
          aria-label="Open Hidden Results page"
        >
          Hidden Results
        </a>
        <a
          href="#"
          onClick={openHighlightPage}
          className="block w-full px-4 py-2 text-base font-semibold text-center text-white transition-colors duration-200 bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
          aria-label="Open Highlighted Results page"
        >
          Highlighted Results
        </a>
      </div>
      <div className="flex flex-col gap-4">
        <button
          onClick={toggleSuspended}
          className={`px-4 py-2 rounded-md text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-opacity-75 ${
            state.suspended
              ? "bg-green-500 hover:bg-green-600"
              : "bg-amber-500 hover:bg-amber-600"
          } text-white w-full`}
          aria-label={state.suspended ? "Resume extension" : "Suspend extension"}
        >
          {state.suspended ? "Resume" : "Suspend"}
        </button>
        <a
          href="https://ko-fi.com/adamdracon"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full px-4 py-2 text-base font-semibold text-center text-white transition-colors duration-200 bg-purple-500 rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
          aria-label="Donate to support the developer"
        >
          Donate
        </a>
      </div>
    </div>
  );
}

export default App;
