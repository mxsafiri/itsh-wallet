import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'medium', linkTo = null, className = '' }) => {
  // Size classes
  const sizes = {
    small: {
      container: 'h-8',
      text1: 'text-xl',
      text2: 'text-xl',
      tagline: 'text-[8px]'
    },
    medium: {
      container: 'h-12',
      text1: 'text-3xl',
      text2: 'text-3xl',
      tagline: 'text-xs'
    },
    large: {
      container: 'h-16',
      text1: 'text-4xl',
      text2: 'text-4xl',
      tagline: 'text-sm'
    }
  };

  const sizeClass = sizes[size] || sizes.medium;
  
  const LogoContent = () => (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center">
        <div className={`font-bold ${sizeClass.text1} text-[#00A67D]`}>
          NEDA
        </div>
        <div className={`font-bold ${sizeClass.text2} bg-[#333333] text-white px-2`}>
          PAY
        </div>
      </div>
      <div className={`text-text-secondary ${sizeClass.tagline} -mt-1`}>
        Tanzania's Digital Payment Solution
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="no-underline">
        <LogoContent />
      </Link>
    );
  }

  return <LogoContent />;
};

export default Logo;
