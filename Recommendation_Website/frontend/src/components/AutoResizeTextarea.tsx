'use client';

import { useEffect, useRef } from 'react';

interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    value: string;
}

export default function AutoResizeTextarea({ value, ...props }: AutoResizeTextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        resize();
    }, [value]);

    return (
        <textarea
            {...props}
            ref={textareaRef}
            value={value}
            style={{ resize: 'none', overflow: 'hidden' }}
            className={`w-full bg-background border border-cards p-3 rounded-lg focus:outline-none focus:border-accent transition-all duration-200 ${props.className || ''}`}
        />
    );
}
