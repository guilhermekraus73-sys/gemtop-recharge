interface ContinueButtonProps {
  onClick: () => void;
}

const ContinueButton = ({ onClick }: ContinueButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="w-full btn-primary-gradient py-3.5 rounded-lg text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
    >
      Continuar
    </button>
  );
};

export default ContinueButton;
