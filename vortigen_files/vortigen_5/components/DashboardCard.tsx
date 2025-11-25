import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-slate-900 rounded-lg border border-slate-800 p-6 ${className}`}>
      <h2 className="font-bold text-lg mb-4">{title}</h2>
      {children}
    </div>
  );
};

export default DashboardCard;