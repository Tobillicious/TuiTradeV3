// src/components/modals/AuthModal.js
import { useState, useEffect } from 'react';
import { Mail, Lock, X, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../ui/Loaders';

const AuthModal = ({ isOpen, onClose }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { showNotification } = useNotification();

    useEffect(() => {
        if (isOpen) {
            setIsSignIn(true);
            setIsForgotPassword(false);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isForgotPassword) {
                await sendPasswordResetEmail(auth, email);
                setSuccess('Password reset email sent! Check your inbox.');
                showNotification('Password reset email sent!', 'success');
            } else if (isSignIn) {
                await signInWithEmailAndPassword(auth, email, password);
                showNotification('Welcome back!', 'success');
                onClose();
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    createdAt: new Date(),
                    profile: {
                        displayName: email.split('@')[0],
                        avatar: null
                    }
                });
                showNotification('Account created successfully!', 'success');
                onClose();
            }
        } catch (error) {
            console.error('Auth error:', error);
            setError(error.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError('');
        setSuccess('');
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            // Check if user doc exists, if not, create it
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    email: user.email,
                    createdAt: new Date(),
                    profile: {
                        displayName: user.displayName || user.email.split('@')[0],
                        avatar: user.photoURL || null
                    }
                });
            }
            showNotification('Signed in with Google!', 'success');
            onClose();
        } catch (error) {
            setError(error.message || 'Google sign-in failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {isForgotPassword ? 'Reset Password' : isSignIn ? 'Sign In' : 'Sign Up'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <ErrorMessage message={error} />}
                    {success && <SuccessMessage message={success} />}

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center mb-2"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                        Continue with Google
                    </button>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                placeholder="Enter your email"
                                required
                            />
                        </div>
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {!isSignIn && !isForgotPassword && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            isForgotPassword ? 'Send Reset Email' : isSignIn ? 'Sign In' : 'Sign Up'
                        )}
                    </button>

                    <div className="text-center space-y-2">
                        {isForgotPassword ? (
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center w-full"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Back to Sign In
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsSignIn(!isSignIn)}
                                    className="text-green-600 hover:text-green-700 font-medium"
                                >
                                    {isSignIn ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                                </button>
                                {isSignIn && (
                                    <button
                                        type="button"
                                        onClick={() => setIsForgotPassword(true)}
                                        className="text-gray-600 hover:text-gray-700 text-sm"
                                    >
                                        Forgot your password?
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
