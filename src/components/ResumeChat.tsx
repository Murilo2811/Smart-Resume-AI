import React, { useState, useRef, useEffect } from 'react';
import { useTranslations } from '../contexts/LanguageContext';
import { ChatTurn } from '../types';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { EyeIcon } from './icons';

interface ResumeChatProps {
    history: ChatTurn[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

const ResumeChat: React.FC<ResumeChatProps> = ({ history, onSendMessage, isLoading }) => {
    const { t } = useTranslations();
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-4 space-y-4 max-h-72">
                {history.map((turn, index) => (
                    <div key={index} className={`flex items-start gap-3 ${turn.role === 'user' ? 'justify-end' : ''}`}>
                        {turn.role === 'model' && (
                             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                <EyeIcon className="w-5 h-5 text-primary" />
                            </div>
                        )}
                        <div className={`max-w-xs md:max-w-md p-3 rounded-lg text-sm ${
                            turn.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                        }`}>
                            <p>{turn.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <EyeIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="max-w-xs md:max-w-md p-3 rounded-lg text-sm bg-muted">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
                                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-center border-t pt-4">
                <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t('chat.placeholder')}
                    className="flex-grow resize-none min-h-[40px]"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !message.trim()}>
                    {t('chat.button')}
                </Button>
            </form>
        </div>
    );
};

export default ResumeChat;
