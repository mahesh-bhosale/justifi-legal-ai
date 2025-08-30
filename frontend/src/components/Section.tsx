import React from 'react';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

export default function Section({
  children,
  className = '',
  padding = 'lg',
  maxWidth = '7xl',
}: SectionProps) {
  const paddingClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20'
  };
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
    'full': 'max-w-full'
  };
  
  const classes = `w-full mx-auto px-4 ${paddingClasses[padding]} ${maxWidthClasses[maxWidth]} ${className}`;
  
  return (
    <section className={classes}>
      {children}
    </section>
  );
}
