"use client";

const DonationLink = () => {
    return (
        <a
            href="https://ko-fi.com/adamdracon"
            target="_blank"
            rel="noreferrer"
            className="fixed bottom-1 right-1 transition-transform hover:scale-110 z-[9999] bg-gray-800/90 p-2 rounded-full hover:bg-gray-700/90  backdrop-blur-sm"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-6 h-6 fill-gray-200 hover:fill-red-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
        </a>
    );
};

export default DonationLink;
