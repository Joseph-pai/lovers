import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { supabase } from '../services/supabase';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch profile from Supabase
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', firebaseUser.uid)
                    .maybeSingle();

                if (error) {
                    console.error('Supabase fetch error:', {
                        message: error.message,
                        details: error.details,
                        hint: error.hint,
                        code: error.code
                    });
                }

                // Fetch linked partners from partner_links
                const { data: links } = await supabase
                    .from('partner_links')
                    .select('female_id, male_id')
                    .or(`female_id.eq.${firebaseUser.uid},male_id.eq.${firebaseUser.uid}`);

                const linkedPartners = [];
                if (links && links.length > 0) {
                    for (const link of links) {
                        const partnerId = profile.gender === 'female' ? link.male_id : link.female_id;
                        const { data: partnerData } = await supabase
                            .from('profiles')
                            .select('id, nickname')
                            .eq('id', partnerId)
                            .maybeSingle();
                        if (partnerData) {
                            linkedPartners.push(partnerData);
                        }
                    }
                }

                setUser({ ...firebaseUser, ...profile, linked_partners: linkedPartners });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

    const register = async (email, password, profileData) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        const { user: firebaseUser } = result;

        await (await import('firebase/auth')).sendEmailVerification(firebaseUser);

        const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
                id: firebaseUser.uid,
                email: email,
                nickname: profileData.nickname,
                gender: profileData.gender,
                usage_count: 0,
                is_subscribed: false,
                cycle_length: 28,
                period_length: 5,
                last_period_date: null,
                updated_at: new Date().toISOString(),
            });

        if (upsertError) {
            console.error('Supabase registration upsert error:', upsertError);
            alert(`資料同步失敗: ${upsertError.message}`);
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', firebaseUser.uid)
            .maybeSingle();

        setUser({ ...firebaseUser, ...profile });
        return result;
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const { user: firebaseUser } = result;

        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', firebaseUser.uid)
            .maybeSingle();

        if (fetchError) {
            console.error('Google Sign-in: Fetch profile error:', fetchError);
        }

        if (!profile) {
            console.log('No profile found for Google user, manual setup required or auto-init via UI.');
        }

        return result;
    };

    const logout = () => signOut(auth);

    const reloadUser = async () => {
        if (auth.currentUser) {
            await auth.currentUser.reload();
            const firebaseUser = auth.currentUser;
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', firebaseUser.uid)
                .maybeSingle();

            if (error) console.error('Reload user profile error:', error);
            // Fetch linked partners from partner_links
            const { data: links } = await supabase
                .from('partner_links')
                .select('female_id, male_id')
                .or(`female_id.eq.${firebaseUser.uid},male_id.eq.${firebaseUser.uid}`);

            const linkedPartners = [];
            if (links && links.length > 0) {
                for (const link of links) {
                    const partnerId = profile.gender === 'female' ? link.male_id : link.female_id;
                    const { data: partnerData } = await supabase
                        .from('profiles')
                        .select('id, nickname')
                        .eq('id', partnerId)
                        .maybeSingle();
                    if (partnerData) {
                        linkedPartners.push(partnerData);
                    }
                }
            }

            setUser({ ...firebaseUser, ...profile, linked_partners: linkedPartners });
        }
    };

    const initializeProfile = async (nickname) => {
        if (!auth.currentUser) return;
        const firebaseUser = auth.currentUser;

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                nickname: nickname || firebaseUser.displayName || '新用戶',
                gender: 'female', // Default to female
                usage_count: 0,
                is_subscribed: false,
                cycle_length: 28,
                period_length: 5,
                last_period_date: null,
                updated_at: new Date().toISOString(),
            });

        if (error) {
            console.error('❌ Manual initialization error - Full details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code,
                fullError: error
            });
            throw new Error(`Supabase Error: ${error.message} | Details: ${error.details} | Hint: ${error.hint}`);
        }

        await reloadUser();
    };


    const updateProfile = async (updates) => {
        if (!auth.currentUser) return;
        const firebaseUser = auth.currentUser;

        const { error } = await supabase
            .from('profiles')
            .update({
                ...updates,
                updated_at: new Date().toISOString(),
            })
            .eq('id', firebaseUser.uid);

        if (error) {
            console.error('Update profile error:', error);
            throw new Error(error.message);
        }

        await reloadUser();
    };

    const updateNickname = async (nickname) => {
        return updateProfile({ nickname });
    };

    const value = {
        user,
        login,
        register,
        signInWithGoogle,
        logout,
        reloadUser,
        initializeProfile,
        updateNickname,
        updateProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
