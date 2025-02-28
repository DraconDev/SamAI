interface ToggleButtonProps {
  isEnabled: boolean;
  onToggle: () => void;
  ariaLabel: string;
}

export function ToggleButton({ isEnabled, onToggle, ariaLabel }: ToggleButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200 
                 ${isEnabled ? 'bg-[#4f46e5] ring-2 ring-[#4f46e5]/50' : 'bg-gray-600'} 
                 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] hover:opacity-90`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 
                   ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}
