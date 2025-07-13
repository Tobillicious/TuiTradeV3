// src/components/pages/ProfilePage.js
import { Mail, Calendar, Edit } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useState, useEffect } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, getDoc, setDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { LoadingSpinner, ErrorMessage, SuccessMessage } from '../ui/Loaders';

const ProfilePage = () => {
    const { currentUser } = useAppContext();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [orders, setOrders] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!currentUser) return;
            
            // Load user profile
            try {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUserProfile(userDoc.data());
                    setAvatarPreview(userDoc.data().profile?.avatar || null);
                } else {
                    setUserProfile(null);
                }
            } catch (error) {
                console.log('User profile not accessible:', error);
                setUserProfile(null);
            }
            
            // Load orders
            try {
                const q = query(collection(db, 'orders'), where('buyerId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.log('Orders not accessible or don\'t exist yet:', error);
                setOrders([]);
            }
        };
        fetchUserData();
    }, [currentUser]);

    // Fetch current profile info on open
    const handleEditOpen = () => {
        setError('');
        setSuccess('');
        setIsEditOpen(true);
        if (currentUser) {
            const profile = userProfile?.profile || {};
            setDisplayName(profile?.displayName || currentUser.email?.split('@')[0] || '');
            setAvatarPreview(profile?.avatar || null);
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        setAvatar(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setAvatarPreview(null);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            let avatarUrl = avatarPreview;
            if (avatar) {
                try {
                    const avatarRef = ref(storage, `avatars/${currentUser.uid}_${Date.now()}`);
                    await uploadBytes(avatarRef, avatar);
                    avatarUrl = await getDownloadURL(avatarRef);
                } catch (uploadError) {
                    console.log('Avatar upload failed:', uploadError);
                    setError('Failed to upload avatar. Profile saved without avatar.');
                    avatarUrl = null;
                }
            }
            
            // Try to update or create user document
            const newProfileData = {
                displayName,
                avatar: avatarUrl || null
            };
            
            try {
                await updateDoc(doc(db, 'users', currentUser.uid), {
                    profile: newProfileData
                });
            } catch (updateError) {
                // If document doesn't exist, create it
                await setDoc(doc(db, 'users', currentUser.uid), {
                    email: currentUser.email,
                    createdAt: new Date(),
                    profile: newProfileData
                });
            }
            
            // Update local state
            setUserProfile(prev => ({
                ...prev,
                profile: newProfileData
            }));
            
            setSuccess('Profile updated successfully!');
            setIsEditOpen(false);
        } catch (err) {
            console.error('Profile update error:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mr-6 overflow-hidden">
                        {userProfile?.profile?.avatar ? (
                            <img src={userProfile.profile.avatar} alt="Avatar" className="w-20 h-20 object-cover rounded-full" />
                        ) : (
                            currentUser?.email?.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-gray-600">Manage your account information</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{currentUser?.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                                <p className="text-sm text-gray-500">Member since</p>
                                <p className="font-medium">
                                    {currentUser?.metadata?.creationTime
                                        ? new Date(currentUser.metadata.creationTime).toLocaleDateString()
                                        : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <button onClick={handleEditOpen} className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                            <Edit className="w-5 h-5 mr-2" />
                            Edit Profile
                        </button>
                        {success && <SuccessMessage message={success} />}
                        {error && <ErrorMessage message={error} />}
                    </div>
                </div>
            </div>
            {/* Order History Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mt-8">
                <h2 className="text-xl font-bold mb-4">Order History</h2>
                {orders.length === 0 ? (
                    <p className="text-gray-500">You have not placed any orders yet.</p>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold">Order #{order.id.slice(-6)}</span>
                                    <span className="text-sm text-gray-500">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : ''}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded">
                                            <img src={item.imageUrl} alt={item.title} className="w-8 h-8 object-cover rounded" />
                                            <span className="text-sm">{item.title}</span>
                                            <span className="text-green-600 font-semibold text-sm">{formatPrice(item.price)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Total:</span>
                                    <span className="font-bold text-green-600">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Edit Profile Modal */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-fade-in-up p-6">
                        <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
                                <input type="file" accept="image/*" onChange={handleAvatarChange} />
                                {avatarPreview && (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-20 h-20 object-cover rounded-full mt-2" />
                                )}
                            </div>
                            {error && <ErrorMessage message={error} />}
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold">Cancel</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50">
                                    {loading ? <LoadingSpinner /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;