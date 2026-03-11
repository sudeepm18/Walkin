import React from 'react';
import { Link } from 'react-router-dom';

const FeatureCard = ({ title, description, icon: Icon, iconBg, dotColor, link }) => {
  return (
    <Link to={link} className="group relative bg-transparent backdrop-blur-xs border border-white/10 rounded-[32px] p-6 transition-all duration-700 hover:bg-white/5 hover:border-indigo-500/30 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] flex flex-col h-full overflow-hidden">
      {/* Icon Section */}
      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center mb-8 relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
        <div className={`absolute inset-0 opacity-20 ${iconBg}`} />
        <div className={`absolute inset-0 blur-xl opacity-30 ${iconBg}`} />
        <Icon className={`w-5 h-5 z-10 text-white`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight group-hover:text-indigo-400 transition-colors duration-300">
          {title}
        </h3>
        <p className="text-zinc-400 text-[13px] leading-relaxed font-medium">
          {description}
        </p>
      </div>

      {/* Decorative Accent Icon */}
      <div className={`absolute bottom-4 right-4 opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
        <Icon className={`w-3.5 h-3.5 ${dotColor.replace('bg-', 'text-')}`} />
      </div>
    </Link>
  );
};

export default FeatureCard;
