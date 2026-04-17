const Spinner = ({ size = 'md', variant = 'default' }) => {
  const sizeClass = size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : '';
  const variantClass = variant === 'primary' ? 'spinner-primary' : '';
  return <span className={`spinner ${sizeClass} ${variantClass}`} role="status" aria-label="Loading" />;
};

export default Spinner;
