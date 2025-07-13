// Community Page - Democratic Neighborhood System
// Local community hub with town hall features, events, and member listings

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Users, MapPin, Calendar, MessageSquare, Vote,
    Star, ChevronRight, Clock, Heart, Share2,
    Plus, Filter, Search, ExternalLink, Shield,
    Home, Briefcase, Award, Bell, ThumbsUp, ThumbsDown
} from 'lucide-react';
import {
    collection, query, where, orderBy, limit, getDocs,
    doc, getDoc, setDoc, updateDoc, increment, addDoc, serverTimestamp, runTransaction
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { db } from '../../lib/firebase';
import { getBilingualText } from '../../lib/nzLocalizationEnhanced';
import { useTeReo, TeReoText } from '../ui/TeReoToggle';

// NewDiscussionForm Component
const NewDiscussionForm = ({ communityId, onDiscussionCreated }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            showNotification('Please sign in to create a discussion', 'info');
            return;
        }

        if (!title.trim() || !content.trim()) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const discussionData = {
                title: title.trim(),
                content: content.trim(),
                authorId: currentUser.uid,
                authorName: currentUser.displayName || currentUser.email,
                createdAt: serverTimestamp(),
                upvotes: 0,
                downvotes: 0,
                replyCount: 0,
                upvotedBy: [],
                downvotedBy: []
            };

            await addDoc(collection(db, 'communities', communityId, 'discussions'), discussionData);

            setTitle('');
            setContent('');
            showNotification('Discussion created successfully!', 'success');
            onDiscussionCreated();
        } catch (error) {
            console.error('Error creating discussion:', error);
            showNotification('Failed to create discussion', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-green-600" />
                Start a Discussion
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter discussion title..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        maxLength={100}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share your thoughts..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        maxLength={1000}
                    />
                </div>
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !title.trim() || !content.trim()}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSubmitting ? 'Posting...' : 'Post Discussion'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// DiscussionCard component for displaying a single discussion
const DiscussionCard = ({ discussion, onVote, currentUserId }) => {
    const handleVote = (voteType) => {
        onVote(discussion.id, voteType);
    };

    const userVote = discussion.upvotedBy?.includes(currentUserId)
        ? 'up'
        : discussion.downvotedBy?.includes(currentUserId)
        ? 'down'
        : null;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 flex space-x-4 hover:shadow-md transition-shadow duration-300">
            <div className="flex flex-col items-center space-y-1">
                <button
                    onClick={() => handleVote('up')}
                    className={`p-1 transition-colors ${userVote === 'up'
                        ? 'text-green-600'
                        : 'text-gray-400 hover:text-green-500'
                        }`}
                >
                    <ThumbsUp size={18} />
                </button>
                <span className="font-bold text-gray-800 text-lg">
                    {discussion.upvotes - discussion.downvotes}
                </span>
                <button
                    onClick={() => handleVote('down')}
                    className={`p-1 transition-colors ${userVote === 'down'
                        ? 'text-red-600'
                        : 'text-gray-400 hover:text-red-500'
                        }`}
                >
                    <ThumbsDown size={18} />
                </button>
            </div>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900 text-lg mb-1">{discussion.title}</h4>
                <p className="text-gray-700 text-sm mb-2 line-clamp-2">{discussion.content}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Posted by <span className="font-medium text-gray-700">{discussion.authorName}</span>
                    </span>
                    <div className="flex items-center space-x-4">
                        <span>{new Date(discussion.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        <span className="flex items-center">
                            <MessageSquare size={12} className="mr-1" />
                            {discussion.replyCount || 0} comments
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// MemberCard component
const MemberCard = ({ member }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-lg font-semibold text-gray-600">
                    {member.displayName?.charAt(0).toUpperCase() || 'U'}
                </span>
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{member.displayName}</p>
                <p className="text-sm text-gray-500">Joined: {new Date(member.joinedAt.seconds * 1000).toLocaleDateString()}</p>
            </div>
            {member.role === 'moderator' && (
                <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Moderator</span>
            )}
        </div>
    );
};

// EventCard component
const EventCard = ({ event }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
                <p className="font-semibold text-gray-900">{event.title}</p>
                <p className="text-sm text-gray-500">{new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
                <p className="text-sm text-gray-500 flex items-center mt-1">
                    <MapPin size={12} className="mr-1" /> {event.location}
                </p>
            </div>
        </div>
    );
};

const CommunityPage = ({ communityId, onNavigate }) => {
    const { currentUser } = useAuth();
    const { showNotification } = useNotification();

    const [community, setCommunity] = useState(null);
    const [members, setMembers] = useState([]);
    const [discussions, setDiscussions] = useState([]);
    const [events, setEvents] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [listings, setListings] = useState([]);
    const [moderators, setModerators] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [userRole, setUserRole] = useState('member');
    const [isMember, setIsMember] = useState(false);

    const loadCommunityData = useCallback(async () => {
        if (!communityId) return;

        setIsLoading(true);
        try {
            const communityDoc = await getDoc(doc(db, 'communities', communityId));
            if (!communityDoc.exists()) {
                showNotification('Community not found', 'error');
                return;
            }
            setCommunity({ id: communityDoc.id, ...communityDoc.data() });

            const membersQuery = query(collection(db, 'communities', communityId, 'members'), orderBy('joinedAt', 'desc'), limit(20));
            const membersSnapshot = await getDocs(membersQuery);
            const membersData = membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMembers(membersData);

            if (currentUser) {
                const userMember = membersData.find(member => member.id === currentUser.uid);
                setIsMember(!!userMember);
                setUserRole(userMember?.role || 'member');
            }

            setModerators(membersData.filter(member => member.role === 'moderator' || member.role === 'admin'));

            const discussionsQuery = query(collection(db, 'communities', communityId, 'discussions'), orderBy('createdAt', 'desc'), limit(10));
            const discussionsSnapshot = await getDocs(discussionsQuery);
            setDiscussions(discussionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() })));

            const eventsQuery = query(collection(db, 'communities', communityId, 'events'), where('date', '>=', new Date()), orderBy('date', 'asc'), limit(5));
            const eventsSnapshot = await getDocs(eventsQuery);
            setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), date: doc.data().date?.toDate() })));

        } catch (error) {
            console.error('Error loading community data:', error);
            showNotification('Error loading community data', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [communityId, currentUser, showNotification]);

    useEffect(() => {
        loadCommunityData();
    }, [loadCommunityData]);

    const handleVote = async (discussionId, voteType) => {
        if (!currentUser) {
            showNotification('You must be logged in to vote.', 'error');
            return;
        }
    
        const discussionRef = doc(db, 'communities', communityId, 'discussions', discussionId);
    
        try {
            await runTransaction(db, async (transaction) => {
                const discussionDoc = await transaction.get(discussionRef);
                if (!discussionDoc.exists()) {
                    throw "Document does not exist!";
                }
    
                const data = discussionDoc.data();
                const upvotedBy = data.upvotedBy || [];
                const downvotedBy = data.downvotedBy || [];
                const userId = currentUser.uid;
    
                let newUpvotedBy = [...upvotedBy];
                let newDownvotedBy = [...downvotedBy];
    
                if (voteType === 'up') {
                    if (upvotedBy.includes(userId)) {
                        newUpvotedBy = upvotedBy.filter(id => id !== userId);
                    } else {
                        newUpvotedBy = [...upvotedBy, userId];
                        newDownvotedBy = downvotedBy.filter(id => id !== userId);
                    }
                } else if (voteType === 'down') {
                    if (downvotedBy.includes(userId)) {
                        newDownvotedBy = downvotedBy.filter(id => id !== userId);
                    } else {
                        newDownvotedBy = [...downvotedBy, userId];
                        newUpvotedBy = upvotedBy.filter(id => id !== userId);
                    }
                }
    
                transaction.update(discussionRef, {
                    upvotedBy: newUpvotedBy,
                    downvotedBy: newDownvotedBy,
                    upvotes: newUpvotedBy.length,
                    downvotes: newDownvotedBy.length
                });
            });
            
            setDiscussions(prevDiscussions => 
                prevDiscussions.map(d => {
                    if (d.id === discussionId) {
                        return { ...d, upvotes: d.upvotes + 1 };
                    }
                    return d;
                })
            );
    
        } catch (error) {
            console.error("Error voting on discussion: ", error);
            showNotification('There was an error casting your vote.', 'error');
        }
    };

    const renderDiscussionsTab = () => (
        <div className="space-y-6">
            <NewDiscussionForm 
                communityId={communityId} 
                onDiscussionCreated={loadCommunityData} 
            />
            <div className="space-y-4">
                {discussions.length > 0 ? (
                    discussions.map(discussion => (
                        <DiscussionCard key={discussion.id} discussion={discussion} onVote={handleVote} currentUserId={currentUser?.uid} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                        <p className="text-gray-500">Be the first to start a conversation in your community!</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderMembersTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Community Members ({members.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {members.map(member => (
                        <MemberCard key={member.id} member={member} />
                    ))}
                </div>
            </div>
        </div>
    );

    const renderEventsTab = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Upcoming Events ({events.length})
                </h2>
                <div className="space-y-4">
                    {events.length > 0 ? (
                        events.map(event => (
                            <EventCard key={event.id} event={event} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                            <p className="text-gray-500">Check back soon for local events!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!community) {
        return <div>Community not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold text-gray-900">{community.name}</h1>
                    <p className="text-gray-600">{community.region}</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex space-x-8">
                        <button onClick={() => setActiveTab('overview')} className={`py-4 px-1 border-b-2 ${activeTab === 'overview' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Overview</button>
                        <button onClick={() => setActiveTab('discussions')} className={`py-4 px-1 border-b-2 ${activeTab === 'discussions' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Discussions</button>
                        <button onClick={() => setActiveTab('members')} className={`py-4 px-1 border-b-2 ${activeTab === 'members' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Members</button>
                        <button onClick={() => setActiveTab('events')} className={`py-4 px-1 border-b-2 ${activeTab === 'events' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Events</button>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'overview' && <div>Overview Content</div>}
                {activeTab === 'discussions' && renderDiscussionsTab()}
                {activeTab === 'members' && renderMembersTab()}
                {activeTab === 'events' && renderEventsTab()}
            </div>
        </div>
    );
};

export default CommunityPage;
