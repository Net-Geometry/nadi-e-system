
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral' | 'warning';
  iconBgColor?: string;
  additionalInfo?: React.ReactNode;
  className?: string;
  customValueColorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  customValueColorClass,
  changeType = 'increase',
  iconBgColor = 'bg-blue-100',
  additionalInfo,
  className = ''
}) => {
  // Determine text color based on changeType
  const getChangeTypeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      case 'neutral':
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white dark:border dark:border-gray-700 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <p className={`text-2xl font-bold mt-1 ${customValueColorClass}`}>{value}</p>
          
          {change && (
            <p className={`text-xs mt-1 ${getChangeTypeColor()}`}>
              {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : ''} {change}
            </p>
          )}
        </div>
        
        { icon && (
          <div className={`${iconBgColor} dark:bg-opacity-20 p-3 rounded-full`}>
            {icon}
          </div>
        )}
      </div>
      
      {additionalInfo && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          {additionalInfo}
        </div>
      )}
    </div>
  );
};

export default StatCard;
