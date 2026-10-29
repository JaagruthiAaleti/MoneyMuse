import React from 'react';
import * as Icons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  color?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-4 h-4',
  color,
  size,
}) => {
  // Grab the icon component from Lucide
  const IconComponent = (Icons as Record<string, any>)[name] || Icons.CircleDollarSign;

  return (
    <IconComponent
      className={className}
      style={{ color: color || undefined }}
      size={size}
    />
  );
};
