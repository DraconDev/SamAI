"use client";

const Spinner = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-48 h-48">
        <div className="absolute w-full h-full rounded-full border-4 border-gray-700/20"></div>
        <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-indigo-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default Spinner;
