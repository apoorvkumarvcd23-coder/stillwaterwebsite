import { HTMLAttributes, forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {
    glowOnHover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', glowOnHover = false, children, ...props }, ref) => {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={glowOnHover ? { y: -5, boxShadow: "0 20px 25px -5px rgba(30, 210, 198, 0.1), 0 8px 10px -6px rgba(30, 210, 198, 0.1)" } : {}}
                className={`glass-panel p-6 sm:p-8 ${className}`}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';
export default Card;
