import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop with extreme blur and subtle tint */}
            <div 
                className="absolute inset-0 bg-[#020617]/60 backdrop-blur-3xl animate-fade-in" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div
                className={`card-premium relative w-full ${sizeClasses[size]} p-0 overflow-hidden border-white/10 shadow-[0_0_50px_rgba(30,41,59,0.5)] animate-scale-in z-10`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with gradient edge */}
                <div className="relative flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight leading-tight">{title}</h2>
                        <div className="h-0.5 w-12 bg-blue-600 mt-2" />
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 group"
                    >
                        <span className="text-xl group-hover:rotate-90 transition-transform duration-500">✕</span>
                    </button>
                </div>
                
                {/* Body with subtle grain or glow */}
                <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
