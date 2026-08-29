export const Input = ({
  label,
  error,
  helper,
  className = "",
  id,
  fullWidth = true,
  rightElement,
  leftIcon, // 1. Destructure leftIcon
  rightIcon, // 2. Destructure rightIcon
  ...props
}) => {
  const baseStyles =
    "rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-2 text-neutral-800 placeholder-neutral-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50";

  // Check if we have a right element or right icon for padding purposes
  const hasRightContent = rightElement || rightIcon;

  return (
    <div className={`${fullWidth ? "w-full" : ""} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {/* Render Left Icon */}
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          className={`
            ${baseStyles}
            ${fullWidth ? "w-full" : ""}
            ${leftIcon ? "pl-10" : ""}
            ${hasRightContent ? "pr-10" : ""}
            ${
              error ? "border-error focus:border-error focus:ring-error/20" : ""
            }
          `}
          {...props}
        />

        {/* Render Right Icon or Right Element */}
        {hasRightContent && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightIcon || rightElement}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-error">{error}</p>}

      {helper && !error && (
        <p className="mt-1 text-sm text-neutral-500">{helper}</p>
      )}
    </div>
  );
};
