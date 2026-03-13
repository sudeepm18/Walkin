import React, { useState, useEffect, useContext } from 'react';
import { FiX, FiSearch, FiUserPlus, FiUserMinus, FiShield, FiLoader } from 'react-icons/fi';
import DomoApi from '../API/domoAPI';
import { UserContext } from '../API/UserContext';
import domo from 'ryuu.js';

const AccessControl = ({ isOpen, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allUsers, setAllUsers] = useState([]);
    const [authorizedUsers, setAuthorizedUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        console.log("AccessControl: Starting data fetch...");
        
        try {
            // Fetch Domo Users separately so it doesn't block on 404s from AppDB
            try {
                const usersResponse = await DomoApi.GetAllUser();
                console.log("AccessControl: Domo Users Raw:", usersResponse);
                
                let users = [];
                if (Array.isArray(usersResponse)) {
                    users = usersResponse;
                } else if (usersResponse && typeof usersResponse === 'object') {
                    users = usersResponse.users || usersResponse.data || [];
                }
                console.log("AccessControl: Processed Users:", users.length);
                setAllUsers(users);
            } catch (userError) {
                console.error("AccessControl: Failed to fetch Domo users:", userError);
            }

            // Fetch Authorized list separately
            try {
                const authResponse = await DomoApi.ListDocuments('Authorised_users');
                console.log("AccessControl: Authorized List:", authResponse);
                setAuthorizedUsers(authResponse || []);
            } catch (authError) {
                console.warn("AccessControl: Authorized list missing or 404. This is normal if the collection is new.", authError);
                setAuthorizedUsers([]); // Fallback to empty
            }

        } catch (error) {
            console.error("AccessControl: Unexpected fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (user) => {
        setActionLoading(user.id);
        console.log("AccessControl: Attempting to add user. Full object:", user);
        
        try {
            // Robust email detection
            const email = 
                user.userEmail || 
                user.email || 
                user.detail?.email || 
                user.mailingAddress ||
                (user.emails && user.emails[0]) ||
                "unknown@domo.com";

            const name = user.displayName || user.userName || user.name || "Unknown User";

            const newDoc = {
                Name: name,
                email: email
            };
            
            console.log("AccessControl: Creating doc with content:", newDoc);
            await DomoApi.CreateDocument('Authorised_users', newDoc);
            await fetchData();
        } catch (error) {
            console.error("AccessControl: Error adding user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleRemoveUser = async (docId) => {
        setActionLoading(docId);
        try {
            await DomoApi.DeleteDocument('Authorised_users', docId);
            await fetchData();
        } catch (error) {
            console.error("Error removing user:", error);
        } finally {
            setActionLoading(null);
        }
    };

    const isAuthorized = (user) => {
        const email = user.userEmail || user.email;
        return authorizedUsers.some(au => au.content.email === email);
    };

    const filteredUsers = allUsers.filter(user => {
        if (!user) return false;
        const uEmail = (user.userEmail || user.email || "").toLowerCase();
        const uName = (user.displayName || user.userName || user.name || "").toLowerCase();
        const search = searchTerm.toLowerCase();
        return uName.includes(search) || uEmail.includes(search);
    }).slice(0, 10);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0a0c10] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                            <FiShield className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Access Control</h2>
                            <p className="text-zinc-500 text-xs font-medium">Manage authorized portal users</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                    >
                        <FiX className="w-6 h-6 text-zinc-500 group-hover:text-white" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Search with Dropdown Suggestions */}
                    <div className="relative mb-8">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search Domo users by name or email..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />

                        {/* Suggestions Dropdown */}
                        {searchTerm && filteredUsers.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#12151c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Suggestions</h3>
                                    </div>
                                    {filteredUsers.map(user => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer group ${isAuthorized(user) ? 'opacity-60 grayscale-[0.5]' : 'hover:bg-white/5'}`}
                                            onClick={() => {
                                                if (!isAuthorized(user) && actionLoading !== user.id) {
                                                    handleAddUser(user);
                                                    setSearchTerm('');
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden">
                                                    {user.avatarKey ? (
                                                        <img src={user.avatarKey} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-bold text-zinc-500">{(user.displayName || user.userName || "?").charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{user.displayName || user.userName}</p>
                                                    <p className="text-[10px] text-zinc-500">{user.userEmail || user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {isAuthorized(user) ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Authorized</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                        {actionLoading === user.id ? <FiLoader className="animate-spin" /> : <FiUserPlus className="w-3 h-3" />}
                                                        <span>Grant Access</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                <FiLoader className="w-8 h-8 text-indigo-500 animate-spin" />
                                <p className="text-zinc-500 text-sm font-medium">Loading data...</p>
                            </div>
                        ) : (
                            <>
                                {allUsers.length === 0 && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl mb-4">
                                        <p className="text-amber-400 text-xs font-medium text-center">
                                            No Domo users found. Please check sync or permissions.
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Currently Authorized</h3>
                                    {authorizedUsers.length === 0 ? (
                                        <div className="text-center py-8 bg-white/2 rounded-2xl border border-dashed border-white/10">
                                            <p className="text-zinc-600 text-xs font-medium">No users authorized yet</p>
                                        </div>
                                    ) : (
                                        authorizedUsers.map(au => (
                                            <div key={au.id} className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-indigo-400">{au.content.Name?.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white">{au.content.Name}</p>
                                                        <p className="text-[11px] text-zinc-500">{au.content.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    disabled={actionLoading === au.id}
                                                    onClick={() => handleRemoveUser(au.id)}
                                                    className="flex items-center gap-2 text-xs font-bold text-rose-400 hover:text-rose-300 disabled:opacity-50"
                                                >
                                                    {actionLoading === au.id ? <FiLoader className="animate-spin" /> : <FiUserMinus />}
                                                    Revoke
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccessControl;
