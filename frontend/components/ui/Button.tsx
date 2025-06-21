// Reusable button component with variants and states

'use client';

import React, { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'select-none',
    ];

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white border border-blue-600',
        'hover:bg-blue-700 hover:border-blue-700',
        'focus:ring-blue-500',
        'active:bg-blue-800',
      ],
      secondary: [
        'bg-gray-600 text-white border border-gray-600',
        'hover:bg-gray-700 hover:border-gray-700',
        'focus:ring-gray-500',
        'active:bg-gray-800',
      ],
      outline: [
        'bg-transparent text-gray-300 border border-gray-600',
        'hover:text-white hover:border-gray-500',
        'focus:ring-gray-500',
        'active:opacity-80',
      ],
      ghost: [
        'bg-transparent text-gray-300 border border-transparent',
        'hover:bg-gray-800',
        'focus:ring-gray-500',
        'active:bg-gray-700',
      ],
      danger: [
        'bg-red-600 text-white border border-red-600',
        'hover:bg-red-700 hover:border-red-700',
        'focus:ring-red-500',
        'active:bg-red-800',
      ],
      success: [
        'bg-green-600 text-white border border-green-600',
        'hover:bg-green-700 hover:border-green-700',
        'focus:ring-green-500',
        'active:bg-green-800',
      ],
    };

    const sizeClasses = {
      xs: 'px-2 py-1 text-xs min-h-[24px]',
      sm: 'px-3 py-1.5 text-sm min-h-[32px]',
      md: 'px-4 py-2 text-sm min-h-[40px]',
      lg: 'px-6 py-3 text-base min-h-[48px]',
      xl: 'px-8 py-4 text-lg min-h-[56px]',
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      {
        'w-full': fullWidth,
        'cursor-not-allowed opacity-50': disabled || loading,
      },
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && leftIcon && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}
        
        {children}
        
        {!loading && rightIcon && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;