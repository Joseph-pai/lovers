import { useState, useCallback } from 'react';
import { supabase } from '../services/supabase';

export const useSupabase = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async (table, query = '*') => {
        setLoading(true);
        const { data, error } = await supabase.from(table).select(query);
        setLoading(false);
        if (error) setError(error);
        return data;
    }, []);

    const upsertData = useCallback(async (table, payload) => {
        setLoading(true);
        const { data, error } = await supabase.from(table).upsert(payload);

        if (!error && table === 'records') {
            // Increment usage count for health records
            const { data: profile } = await supabase
                .from('profiles')
                .select('id, usage_count, is_subscribed')
                .eq('id', payload.user_id)
                .single();

            if (profile && !profile.is_subscribed) {
                if (profile.usage_count >= 100) {
                    setLoading(false);
                    alert('您的免費試用次數（100次）已達上限，請前往「伴侶頁面」訂閱以繼續使用唷！');
                    return null;
                }

                await supabase
                    .from('profiles')
                    .update({ usage_count: (profile.usage_count || 0) + 1 })
                    .eq('id', payload.user_id);
            }
        }

        setLoading(false);
        if (error) setError(error);
        return data;
    }, []);

    return { loading, error, fetchData, upsertData };
};
