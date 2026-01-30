import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [gender, setGender] = useState('female');
    const [error, setError] = useState('');
    const { login, register, signInWithGoogle } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, { nickname, gender });
                setRegistrationSuccess(true);
            }
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    const handleGoogleSignIn = async () => {
        setError('');
        try {
            await signInWithGoogle();
        } catch (err) {
            setError(err.message.replace('Firebase: ', ''));
        }
    };

    if (registrationSuccess) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FFFBFA] via-[#FFF9E6] to-[#E6F3FF]">
                <div className="w-full max-w-md glass-card text-center space-y-6 animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">註冊成功！</h2>
                    <p className="text-gray-600 leading-relaxed">
                        我們已經發送了一封驗證郵件至：<br />
                        <span className="font-bold text-rose-400">{email}</span><br />
                        請前往您的信箱查看並點擊驗證連結，<br />
                        否則您的帳號功能將受到限制唷。
                    </p>
                    <button
                        onClick={() => {
                            setRegistrationSuccess(false);
                            setIsLogin(true);
                        }}
                        className="btn-primary w-full py-4 text-lg"
                    >
                        返回登入
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#FFFBFA] via-[#FFF9E6] to-[#E6F3FF]">
            <div className="w-full max-w-md">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-pink-500 mb-2">
                        來了嗎 V2.0
                    </h1>
                    <p className="text-gray-500 font-medium">您的私人雲端健康伴侶</p>
                </header>

                <div className="glass-card">
                    <div className="flex bg-pink-50 rounded-xl p-1 mb-8 border border-pink-100/50">
                        <button
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${isLogin ? 'bg-white text-rose-500 shadow-md' : 'text-gray-400 hover:text-gray-500'}`}
                            onClick={() => setIsLogin(true)}
                        >
                            登入
                        </button>
                        <button
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${!isLogin ? 'bg-white text-rose-500 shadow-md' : 'text-gray-400 hover:text-gray-500'}`}
                            onClick={() => setIsLogin(false)}
                        >
                            註冊
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">暱稱</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none" size={18} />
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        className="w-full bg-white/50 border border-pink-100 rounded-xl py-3 pl-11 pr-4 focus:border-rose-400 focus:bg-white outline-none transition-all placeholder:text-gray-300 text-gray-700"
                                        placeholder="妳的稱呼"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">電子郵件</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/50 border border-pink-100 rounded-xl py-3 pl-11 pr-4 focus:border-rose-400 focus:bg-white outline-none transition-all placeholder:text-gray-300 text-gray-700"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">密碼</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300 pointer-events-none" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/50 border border-pink-100 rounded-xl py-3 pl-11 pr-4 focus:border-rose-400 focus:bg-white outline-none transition-all placeholder:text-gray-300 text-gray-700"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">性別</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setGender('female')}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${gender === 'female' ? 'bg-rose-400 border-rose-400 text-white shadow-lg shadow-rose-200/50' : 'bg-white border-pink-100 text-gray-400'}`}
                                    >
                                        女生
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setGender('male')}
                                        className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${gender === 'male' ? 'bg-blue-400 border-blue-400 text-white shadow-lg shadow-blue-200/50' : 'bg-white border-blue-50 text-gray-400'}`}
                                    >
                                        男生
                                    </button>
                                </div>
                            </div>
                        )}

                        <button type="submit" className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                            {isLogin ? '立即登入' : '開始註冊'}
                            <ArrowRight size={18} />
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-pink-100"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#FFFAF8] px-4 text-gray-400 font-bold tracking-wider">或使用其他方式</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-pink-100 hover:border-rose-300 hover:bg-rose-50/30 text-gray-600 font-bold py-3 rounded-xl transition-all active:scale-95 shadow-sm"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        使用 Google 帳號繼續
                    </button>

                    <p className="mt-8 text-center text-xs text-gray-400 font-medium">
                        開始使用即代表您同意我們的
                        <br />
                        <span className="text-rose-400 underline cursor-pointer hover:text-rose-500 transition-colors">服務條款</span> 與 <span className="text-rose-400 underline cursor-pointer hover:text-rose-500 transition-colors">隱私政策</span>
                    </p>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-sm text-gray-400 font-bold">
                        免費試用 100 次 | NT$ 19 每月
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
