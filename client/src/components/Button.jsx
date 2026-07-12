import './Button.css';

/**
 * Reusable submit/action button with loading state.
 */
export default function Button({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  id,
}) {
  return (
    <button
      id={id}
      type={type}
      className={`btn btn--${variant} ${fullWidth ? 'btn--full' : ''} ${loading ? 'btn--loading' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <span className="btn-spinner">
          <svg className="btn-spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="31.42 31.42" />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
