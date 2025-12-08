interface ContinueButtonProps {
  onClick: () => void;
  className?: string;
}

const ContinueButton = ({ onClick, className }: ContinueButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-destructive hover:bg-destructive/90 text-white py-3.5 rounded-lg text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${className || ''}`}
    >
      Continuar
    </button>
  );
};

export default ContinueButton;
