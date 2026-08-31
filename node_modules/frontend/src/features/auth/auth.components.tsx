import React from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthCard: React.FC<AuthCardProps> = ({ title, subtitle, children }) => {
  return (
    <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl"></div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-black tracking-tight text-white mb-2">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>

      {children}
    </div>
  );
};

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, ...props }) => {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
      />
    </div>
  );
};

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450',
    error: 'bg-rose-500/10 border-rose-500/20 text-rose-450',
    info: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  return (
    <div className={`p-4 rounded-xl border text-xs font-semibold ${styles[type]}`}>
      {message}
    </div>
  );
};

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({ loading, children, ...props }) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
    >
      {loading ? (
        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      ) : (
        children
      )}
    </button>
  );
};
