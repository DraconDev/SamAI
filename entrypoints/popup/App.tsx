import { useState } from "react";
import reactLogo from "@/assets/react.svg";
import wxtLogo from "/wxt.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div className="p-6 w-[400px] bg-gradient-to-br from-indigo-100 via-white to-purple-100">
        <div className="flex justify-center gap-6 mb-6">
          <a
            href="https://wxt.dev"
            target="_blank"
            className="hover:scale-110 transition-transform duration-300 hover:drop-shadow-lg"
          >
            <img src={wxtLogo} className="h-12 w-12" alt="WXT logo" />
          </a>
          <a
            href="https://react.dev"
            target="_blank"
            className="hover:scale-110 transition-transform duration-300 hover:drop-shadow-lg"
          >
            <img
              src={reactLogo}
              className="h-12 w-12 animate-spin-slow"
              alt="React logo"
            />
          </a>
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          WXT + React
        </h1>
        <div className="text-center space-y-4">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full 
                     font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                     transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Count: {count}
          </button>
          <p className="text-gray-600 text-sm">
            Edit{" "}
            <code className="bg-white/50 px-2 py-0.5 rounded-md font-mono text-purple-600">
              src/App.tsx
            </code>{" "}
            and save to test HMR
          </p>
        </div>
        <p className="text-gray-500 text-sm text-center mt-6">
          Click on the logos to learn more
        </p>
      </div>
    </>
  );
}

export default App;
