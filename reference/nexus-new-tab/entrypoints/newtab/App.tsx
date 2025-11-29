import HomeIcons from "@/components/icons/HomeIcons";
import DonationLink from "@/components/ui/DonationLink";
import Settings from "@/components/ui/Settings";

import Background from "@/components/layout/Background";
import "@/styles/globals.css";

function App() {
    return (
        <div className="flex flex-col justify-between min-h-screen font-sans antialiased">
            <main className="relative flex-1 px-2 py-2 mx-auto">
                <Background />
                <HomeIcons />
            </main>
        </div>
    );
}

export default App;
