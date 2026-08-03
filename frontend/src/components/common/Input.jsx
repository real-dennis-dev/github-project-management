export const Input = ({
  label,
  error,
  helper,
  className = "",
  id,
  fullWidth = true,
  rightElement,
  ...props
}) => {
  const baseStyles =
    "rounded-lg border border-neutral-300 bg-neutral-100 px-4 py-2 text-neutral-800 placeholder-neutral-400 transition-all duration-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50";

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
        <input
          id={id}
          className={`
            ${baseStyles}
            ${fullWidth ? "w-full" : ""}
            ${rightElement ? "pr-10" : ""}
            ${
              error ? "border-error focus:border-error focus:ring-error/20" : ""
            }
          `}
          {...props}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
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
