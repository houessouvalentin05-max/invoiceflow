type LogoProps = {
  variant?: "light" | "dark";
  showWordmark?: boolean;
  className?: string;
};

/**
 * Logo InvoiceFlow — monogramme "IF" avec flèche intégrée.
 * variant="light" → fond clair (icône bleue sur blanc)
 * variant="dark"  → fond sombre (icône bleue sur navy)
 */
export function Logo({ variant = "light", showWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="InvoiceFlow logo"
      >
        <rect width="32" height="32" rx="8" fill="#2563EB" />
        <path
          d="M9 8H12V24H9V8Z"
          fill="white"
        />
        <path
          d="M14 8H22L19 13H22L14.5 21V15H14V8Z"
          fill="white"
        />
      </svg>
      {showWordmark && (
        <span
          className={`text-lg font-bold tracking-tight ${
            variant === "dark" ? "text-white" : "text-[#111827]"
          }`}
        >
          Invoice<span className="text-[#2563EB]">Flow</span>
        </span>
      )}
    </div>
  );
}