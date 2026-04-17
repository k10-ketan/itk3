import Spinner from './Spinner.jsx';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const variantClass = {
    primary: 'btn-primary',
    success: 'btn-success',
    danger: 'btn-danger',
    ghost: 'btn-ghost',
  }[variant] || 'btn-primary';

  const sizeClass = { sm: 'btn-sm', lg: 'btn-lg', icon: 'btn-icon' }[size] || '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
};

export default Button;
