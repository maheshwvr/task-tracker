// src/components/Button.tsx
// Enhanced Button component with size and variant support
type ButtonProps = {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export default function Button({ 
  label, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  type = 'button',
  disabled = false 
}: ButtonProps) {
  const getClassName = () => {
    let className = 'btn-base';
    
    // Add variant class
    if (variant === 'primary') {
      className += ' btn-primary';
    } else {
      className += ' btn-secondary';
    }
    
    // Add size class
    if (size === 'small') {
      className += ' btn-small';
    } else if (size === 'large') {
      className += ' btn-large';
    }
    
    return className;
  };

  return (
    <button 
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={getClassName()}
    >
      {label}
    </button>
  );
}