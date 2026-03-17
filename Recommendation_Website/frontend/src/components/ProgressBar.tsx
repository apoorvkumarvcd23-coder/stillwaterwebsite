import { motion } from 'framer-motion';

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
}

export default function ProgressBar({ progress, className = '' }: ProgressBarProps) {
    return (
        <div className={`w-full h-2 bg-cards rounded-full overflow-hidden ${className}`}>
            <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            />
        </div>
    );
}
