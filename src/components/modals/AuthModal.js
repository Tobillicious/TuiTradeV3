// src/components/modals/AuthModal.js
import { useState, useEffect } from 'react';
import { Mail, Lock, X, ArrowLeft, MapPin, Home, User } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { useNotification } from '../../context/NotificationContext';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../ui/Loaders';

const AuthModal = ({ isOpen, onClose }) => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [signupStep, setSignupStep] = useState(1); // 1: Basic info, 2: Address info
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState({
        street: '',
        suburb: '',
        city: '',
        region: '',
        postcode: '',
        country: 'New Zealand'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { showNotification } = useNotification();

    // Function to determine neighborhood/community from address
    const determineNeighborhood = (userAddress) => {
        const { suburb, city, region } = userAddress;
        // Create a unique community identifier based on suburb or city
        const communityId = suburb ? 
            `${suburb.toLowerCase().replace(/\s+/g, '-')}-${city.toLowerCase().replace(/\s+/g, '-')}` :
            `${city.toLowerCase().replace(/\s+/g, '-')}-${region.toLowerCase().replace(/\s+/g, '-')}`;
        
        const communityName = suburb ? `${suburb}, ${city}` : `${city}, ${region}`;
        
        return {
            id: communityId,
            name: communityName,
            suburb,
            city,
            region,
            type: suburb ? 'suburb' : 'city'
        };
    };

    useEffect(() => {
        if (isOpen) {
            setIsSignIn(true);
            setIsForgotPassword(false);
            setSignupStep(1);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFullName('');
            setPhoneNumber('');
            setAddress({
                street: '',
                suburb: '',
                city: '',
                region: '',
                postcode: '',
                country: 'New Zealand'
            });
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Handle multi-step signup
        if (!isSignIn && !isForgotPassword && signupStep === 1) {
            // Validate step 1
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (!fullName.trim()) {
                setError('Please enter your full name');
                return;
            }
            // Move to step 2 (address collection)
            setSignupStep(2);
            return;
        }

        setIsLoading(true);

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
                // Step 2: Create account with full profile
                if (!address.street || !address.city || !address.region) {
                    setError('Please complete your address information');
                    return;
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const neighborhood = determineNeighborhood(address);
                
                // Create comprehensive user profile
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: email,
                    createdAt: new Date(),
                    profile: {
                        displayName: fullName.trim(),
                        fullName: fullName.trim(),
                        phoneNumber: phoneNumber.trim(),
                        avatar: null
                    },
                    address: address,
                    community: neighborhood,
                    joinedCommunity: new Date(),
                    settings: {
                        communityNotifications: true,
                        localEvents: true,
                        marketplaceAlerts: true,
                        newsletter: true
                    },
                    onboardingComplete: true
                });

                // Add user to their neighborhood community
                await setDoc(doc(db, 'communities', neighborhood.id), {
                    name: neighborhood.name,
                    type: neighborhood.type,
                    suburb: neighborhood.suburb,
                    city: neighborhood.city,
                    region: neighborhood.region,
                    memberCount: 1,
                    createdAt: new Date(),
                    settings: {
                        moderatorElections: true,
                        publicEvents: true,
                        businessListings: true
                    }
                }, { merge: true });

                // Add user to community members
                await setDoc(doc(db, 'communities', neighborhood.id, 'members', userCredential.user.uid), {
                    joinedAt: new Date(),
                    role: 'member',
                    displayName: fullName.trim(),
                    verified: false
                });

                showNotification(`Welcome to TuiTrade! You've been added to the ${neighborhood.name} community 🏘️`, 'success');
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
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isForgotPassword ? 'Reset Password' : 
                             isSignIn ? 'Sign In' : 
                             signupStep === 1 ? 'Create Account' : 'Complete Your Profile'}
                        </h2>
                        {!isSignIn && !isForgotPassword && (
                            <p className="text-sm text-gray-500 mt-1">
                                Step {signupStep} of 2 • Join your local community
                            </p>
                        )}
                    </div>
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

                    {/* Signup Step 1: Personal Information */}
                    {!isSignIn && !isForgotPassword && signupStep === 1 && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="mr-2 text-green-600" size={20} />
                                    Personal Information
                                </h3>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number (optional)
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                    placeholder="0800 123 456"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Helps with local community verification
                                </p>
                            </div>
                        </>
                    )}

                    {/* Signup Step 2: Address for Community Assignment */}
                    {!isSignIn && !isForgotPassword && signupStep === 2 && (
                        <>
                            <div className="border-t pt-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                                    <Home className="mr-2 text-green-600" size={20} />
                                    Your Address
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    We'll automatically add you to your local community page where you can connect with neighbors, discover local events, and support local businesses.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Street Address *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            value={address.street}
                                            onChange={(e) => setAddress(prev => ({...prev, street: e.target.value}))}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            placeholder="123 Queen Street"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Suburb
                                        </label>
                                        <input
                                            type="text"
                                            value={address.suburb}
                                            onChange={(e) => setAddress(prev => ({...prev, suburb: e.target.value}))}
                                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            placeholder="CBD"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Postcode
                                        </label>
                                        <input
                                            type="text"
                                            value={address.postcode}
                                            onChange={(e) => setAddress(prev => ({...prev, postcode: e.target.value}))}
                                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            placeholder="1010"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <select
                                            value={address.city}
                                            onChange={(e) => setAddress(prev => ({...prev, city: e.target.value}))}
                                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        >
                                            <option value="">Select City</option>
                                            <option value="Auckland">Auckland</option>
                                            <option value="Wellington">Wellington</option>
                                            <option value="Christchurch">Christchurch</option>
                                            <option value="Hamilton">Hamilton</option>
                                            <option value="Tauranga">Tauranga</option>
                                            <option value="Dunedin">Dunedin</option>
                                            <option value="Palmerston North">Palmerston North</option>
                                            <option value="Nelson">Nelson</option>
                                            <option value="Rotorua">Rotorua</option>
                                            <option value="New Plymouth">New Plymouth</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Region *
                                        </label>
                                        <select
                                            value={address.region}
                                            onChange={(e) => setAddress(prev => ({...prev, region: e.target.value}))}
                                            className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                            required
                                        >
                                            <option value="">Select Region</option>
                                            <option value="Auckland">Auckland</option>
                                            <option value="Wellington">Wellington</option>
                                            <option value="Canterbury">Canterbury</option>
                                            <option value="Waikato">Waikato</option>
                                            <option value="Bay of Plenty">Bay of Plenty</option>
                                            <option value="Otago">Otago</option>
                                            <option value="Manawatu-Wanganui">Manawatu-Wanganui</option>
                                            <option value="Nelson">Nelson</option>
                                            <option value="Taranaki">Taranaki</option>
                                            <option value="Northland">Northland</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex">
                                        <Home className="flex-shrink-0 w-5 h-5 text-green-600 mt-0.5" />
                                        <div className="ml-3">
                                            <h4 className="text-sm font-medium text-green-800">
                                                🏘️ Community Features
                                            </h4>
                                            <p className="text-sm text-green-700 mt-1">
                                                You'll automatically join your local community page featuring:
                                            </p>
                                            <ul className="text-xs text-green-600 mt-2 space-y-1">
                                                <li>• Democratic town hall discussions</li>
                                                <li>• Local event announcements</li>
                                                <li>• Neighborhood marketplace listings</li>
                                                <li>• Small business directory</li>
                                                <li>• Community moderator elections</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Back button for step 2 */}
                            <button
                                type="button"
                                onClick={() => setSignupStep(1)}
                                className="text-green-600 hover:text-green-700 font-medium flex items-center"
                            >
                                <ArrowLeft size={16} className="mr-2" />
                                Back to Personal Information
                            </button>
                        </>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            isForgotPassword ? 'Send Reset Email' : 
                            isSignIn ? 'Sign In' : 
                            signupStep === 1 ? 'Continue to Address →' : '🏘️ Create Account & Join Community'
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
