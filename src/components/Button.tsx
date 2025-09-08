// src/components/Button.tsx
// Enhanced Button component with size and variant support
import { ReactNode } from 'react';

type ButtonProps = {
  label?: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export default function Button({ 
  label, 
  icon,
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
    } else if (variant === 'danger') {
      className += ' btn-danger';
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
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon && <span>{icon}</span>}
        {label && <span>{label}</span>}
      </span>
    </button>
  );
}