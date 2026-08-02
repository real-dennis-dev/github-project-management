// IconWrapper.jsx
export const IconWrapper = ({
  icon: Icon,
  size = "md",
  color = "currentColor",
  className = "",
  onClick,
  ...props
}) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
    "2xl": "h-10 w-10",
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center
        ${onClick ? "cursor-pointer hover:opacity-70 transition-opacity" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      <Icon className={`${sizes[size]} ${color}`} {...props} />
    </div>
  );
};
