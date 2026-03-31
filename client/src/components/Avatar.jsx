// FILE: client/src/components/Avatar.jsx
// Reusable avatar — shows image or colored initials fallback

import { stringToColor, getInitials } from "../utils/helpers";

const Avatar = ({ name = "", src = "", size = "md", online = false }) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-14 h-14 text-lg",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5 border",
    sm: "w-2 h-2 border",
    md: "w-2.5 h-2.5 border-2",
    lg: "w-3 h-3 border-2",
    xl: "w-3.5 h-3.5 border-2",
  };

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white overflow-hidden flex-shrink-0`}
        style={{ backgroundColor: src ? "transparent" : stringToColor(name) }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.parentElement.style.backgroundColor = stringToColor(name);
              e.target.parentElement.textContent = getInitials(name);
            }}
          />
        ) : (
          getInitials(name)
        )}
      </div>

      {/* Online indicator dot */}
      {online && (
        <span
          className={`${dotSizes[size]} absolute bottom-0 right-0 rounded-full bg-emerald-500 border-[#0f1117]`}
        />
      )}
    </div>
  );
};

export default Avatar;
