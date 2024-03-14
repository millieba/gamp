type ButtonProps = {
  label: string;
  clickHandler: () => void;
  isDisabled?: boolean;
  styles?: string;
  children?: React.ReactNode;
};

const Button = ({ label, clickHandler, isDisabled, styles, children }: ButtonProps) => {
  return (
    <button
      onClick={clickHandler}
      className={`mt-2 mb-4 px-4 py-2 rounded-full ${
        isDisabled
          ? "bg-DarkNeutral400 text-DarkNeutral700 cursor-not-allowed"
          : "text-DarkNeutral1100 bg-Magenta600 hover:bg-pink-600"
      } ${styles}`}
      disabled={isDisabled}
    >
      {children}
      {label}
    </button>
  );
};

export default Button;
