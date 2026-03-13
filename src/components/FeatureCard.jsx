import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';

const FeatureCard = ({ title, description, icon: Icon, iconBg, dotColor, link, disabled }) => {
  const CardComponent = disabled ? 'div' : Link;
  
  return (
    <CardComponent 
      to={disabled ? undefined : link} 
      className={`group relative bg-transparent backdrop-blur-xs border border-white/10 rounded-[32px] p-6 transition-all duration-700 flex flex-col h-full overflow-hidden 
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 hover:border-indigo-500/30 hover:translate-y-[-8px] hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)]'}`}
    >
      {/* Disabled Overlay / Lock */}
      {disabled && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-zinc-800/80 p-2 rounded-xl border border-white/5 backdrop-blur-md">
            <FiLock className="w-4 h-4 text-zinc-500" />
          </div>
        </div>
      )}

      {/* Icon Section */}
      <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center mb-8 relative overflow-hidden transition-transform duration-500 ${!disabled && 'group-hover:scale-110'}`}>
        <div className={`absolute inset-0 opacity-20 ${disabled ? 'bg-zinc-600' : iconBg}`} />
        <div className={`absolute inset-0 blur-xl opacity-30 ${disabled ? 'bg-zinc-600' : iconBg}`} />
        <Icon className={`w-5 h-5 z-10 ${disabled ? 'text-zinc-500' : 'text-white'}`} />
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className={`text-xl font-bold mb-3 tracking-tight transition-colors duration-300 ${disabled ? 'text-zinc-500' : 'text-white group-hover:text-indigo-400'}`}>
          {title}
        </h3>
        <p className={`text-[13px] leading-relaxed font-medium ${disabled ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {description}
        </p>
      </div>

      {/* Decorative Accent Icon */}
      {!disabled && (
        <div className={`absolute bottom-4 right-4 opacity-40 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110 group-hover:rotate-12`}>
          <Icon className={`w-3.5 h-3.5 ${dotColor.replace('bg-', 'text-')}`} />
        </div>
      )}
    </CardComponent>
  );
};

export default FeatureCard;
