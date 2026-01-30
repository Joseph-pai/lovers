import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabase';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const { user } = useAuth();
    const [isSoundEnabled, setIsSoundEnabled] = useState(false);
    // Persistent audio object to handle iOS autoplay policy
    const audioRef = useRef(new Audio('/notification.mp3'));

    useEffect(() => {
        // Subscribe to real-time message updates
        if (!user) return;

        // Listen to all message changes in the table
        const channel = supabase
            .channel('global-messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const message = payload.new;

                    if (message) {
                        // Play sound ONLY if it's a new message from the partner (not looking at my own messages)
                        // AND sound is enabled by user
                        if (message.receiver_id === user.uid && message.sender_id !== user.uid) {
                            if (isSoundEnabled) {
                                console.log('Global notification triggered');
                                // Reset time to 0 to allow replay
                                audioRef.current.currentTime = 0;
                                audioRef.current.volume = 1.0;
                                audioRef.current.play().catch(e => console.error("Error playing sound (global):", e));
                            }
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, isSoundEnabled]);

    const toggleSound = () => {
        const newState = !isSoundEnabled;
        setIsSoundEnabled(newState);

        if (newState) {
            // "Unlock" the persistent audio object on iOS/Browsers
            // We play it, then immediately reset it
            audioRef.current.volume = 0.5;
            audioRef.current.play()
                .then(() => {
                    // Optional: we can reset volume here if needed
                })
                .catch(e => console.error("Audio unlock failed:", e));
        }
    };

    const value = {
        isSoundEnabled,
        toggleSound
    };

    return (
        <SoundContext.Provider value={value}>
            {children}
        </SoundContext.Provider>
    );
};
