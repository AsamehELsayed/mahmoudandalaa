import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Users, 
    Heart, 
    Calendar, 
    Music, 
    Plus, 
    Trash2, 
    Edit, 
    Search, 
    Upload, 
    Volume2, 
    Save, 
    Copy,
    CheckCircle2,
    Clock,
    BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import ElegantWishModal from '@/components/ElegantWishModal';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Guest {
    id: number;
    name: string;
    created_at: string;
}

interface Wish {
    id: number;
    name: string;
    message: string;
    created_at: string;
}

interface WeddingSetting {
    id: number;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    venue_name: string;
    venue_city: string;
    venue_address: string;
    venue_maps_url: string;
    ceremony_time: string;
    reception_time: string;
    music_path: string | null;
}

interface DashboardProps {
    settings: WeddingSetting;
    guests: Guest[];
    wishes: Wish[];
}

export default function Dashboard({ settings, guests, wishes }: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'wishes' | 'settings'>('overview');
    
    // Guest search & dialog states
    const [guestSearch, setGuestSearch] = useState('');
    const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
    const [isBatchAddOpen, setIsBatchAddOpen] = useState(false);
    const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
    const [selectedWish, setSelectedWish] = useState<any | null>(null);
    const [isKeepsakeOpen, setIsKeepsakeOpen] = useState(false);

    // Guest Forms
    const addGuestForm = useForm({
        name: '',
    });

    const editGuestForm = useForm({
        name: '',
    });

    const batchGuestForm = useForm({
        names_list: '',
    });

    // Settings Form (handling file upload)
    const settingsForm = useForm({
        bride_name: settings?.bride_name || 'Alaa',
        groom_name: settings?.groom_name || 'Mahmoud',
        wedding_date: settings?.wedding_date || '2026-08-15 18:00:00',
        venue_name: settings?.venue_name || 'Four Seasons Hotel',
        venue_city: settings?.venue_city || 'San Stefano, Alexandria',
        venue_address: settings?.venue_address || '399 El Geish Road, San Stefano, Alexandria, Egypt',
        venue_maps_url: settings?.venue_maps_url || '',
        ceremony_time: settings?.ceremony_time || "Six o'clock in the evening",
        reception_time: settings?.reception_time || "Eight o'clock in the evening",
        music_file: null as File | null,
    });

    // Date Countdown logic for overview
    const getDaysRemaining = () => {
        if (!settings?.wedding_date) return 0;
        const weddingTime = new Date(settings.wedding_date.replace(' ', 'T')).getTime();
        const diff = weddingTime - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    // Form handlers
    const handleAddGuest = (e: React.FormEvent) => {
        e.preventDefault();
        addGuestForm.post('/dashboard/guests', {
            onSuccess: () => {
                addGuestForm.reset();
                setIsAddGuestOpen(false);
            }
        });
    };

    const handleEditGuest = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGuest) return;
        editGuestForm.put(`/dashboard/guests/${editingGuest.id}`, {
            onSuccess: () => {
                setEditingGuest(null);
            }
        });
    };

    const handleBatchAddGuests = (e: React.FormEvent) => {
        e.preventDefault();
        batchGuestForm.post('/dashboard/guests/batch', {
            onSuccess: () => {
                batchGuestForm.reset();
                setIsBatchAddOpen(false);
            }
        });
    };

    const handleDeleteGuest = (id: number) => {
        if (confirm('Are you sure you want to delete this guest?')) {
            router.delete(`/dashboard/guests/${id}`);
        }
    };

    const handleDeleteWish = (id: number) => {
        if (confirm('Are you sure you want to delete this wish?')) {
            router.delete(`/dashboard/wishes/${id}`);
        }
    };

    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are uploading file, we MUST use direct POST to avoid PUT issues with multipart data in Laravel
        settingsForm.post('/dashboard/settings', {
            forceFormData: true,
            onSuccess: () => {
                settingsForm.setData('music_file', null); // Clear file selection on success
                alert('Wedding settings updated successfully!');
            }
        });
    };

    const filteredGuests = (guests || []).filter(guest => 
        guest.name.toLowerCase().includes(guestSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wedding Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6 overflow-y-auto no-scrollbar max-w-7xl mx-auto w-full">
                
                {/* Dashboard Header & Hero Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-950 p-6 md:p-8 text-white shadow-xl border border-stone-850">
                    {/* Background elegant circles */}
                    <div className="absolute right-0 top-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-gradient-to-br from-amber-500/10 to-rose-500/10 blur-3xl pointer-events-none" />
                    <div className="absolute left-1/3 bottom-0 -mb-20 w-60 h-60 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <span className="text-[10px] font-sans font-extrabold tracking-widest text-amber-400 uppercase">NJM Solutions Wedding Suite</span>
                            <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-100 tracking-tight flex items-center gap-3 mt-1.5">
                                Wedding Control Center <Heart className="w-7 h-7 text-rose-450 fill-rose-500/40 animate-pulse" />
                            </h1>
                            <p className="text-stone-300 text-sm mt-2 max-w-xl font-light leading-relaxed">
                                Manage your guests, wishes, dates, and background music for the celebration of <span className="capitalize font-semibold text-amber-300">{settings?.bride_name} & {settings?.groom_name}</span>.
                            </p>
                        </div>
                        
                        <Button asChild className="rounded-full font-serif bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 border-0 text-white shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-300 px-6 py-5.5 text-xs tracking-wider uppercase font-semibold">
                            <a href="/" target="_blank" className="flex items-center gap-2">
                                View Live Invitation <span className="text-sm font-sans">&rarr;</span>
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Dashboard Statistics Overview */}
                <div className="grid gap-6 sm:grid-cols-3">
                    {/* Stat Card 1: Total Invitees */}
                    <Card className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(245,158,11,0.05)] hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 bottom-0 -mb-6 -mr-6 w-24 h-24 rounded-full bg-amber-500/5 group-hover:bg-amber-500/10 transition-all duration-300 blur-xl pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                            <CardTitle className="text-xs uppercase tracking-widest font-sans font-bold text-stone-400 dark:text-stone-500">Total Invitees</CardTitle>
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 text-amber-600 dark:text-amber-400">
                                <Users className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                            <div className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100">{guests?.length || 0}</div>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Confirmed guests in database
                            </p>
                        </CardContent>
                    </Card>

                    {/* Stat Card 2: Wishes */}
                    <Card className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(244,63,94,0.05)] hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 bottom-0 -mb-6 -mr-6 w-24 h-24 rounded-full bg-rose-500/5 group-hover:bg-rose-500/10 transition-all duration-300 blur-xl pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                            <CardTitle className="text-xs uppercase tracking-widest font-sans font-bold text-stone-400 dark:text-stone-500">Wedding Wishes</CardTitle>
                            <div className="bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl group-hover:bg-rose-500 group-hover:text-white transition-all duration-300 text-rose-600 dark:text-rose-400">
                                <BookOpen className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                            <div className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100">{wishes?.length || 0}</div>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Messages left in digital guestbook</p>
                        </CardContent>
                    </Card>

                    {/* Stat Card 3: Days Remaining */}
                    <Card className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/80 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl relative overflow-hidden group hover:shadow-[0_20px_50px_rgba(99,102,241,0.05)] hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute right-0 bottom-0 -mb-6 -mr-6 w-24 h-24 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-all duration-300 blur-xl pointer-events-none" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-5">
                            <CardTitle className="text-xs uppercase tracking-widest font-sans font-bold text-stone-400 dark:text-stone-500">Days Remaining</CardTitle>
                            <div className="bg-indigo-50 dark:bg-indigo-950/30 p-2.5 rounded-xl group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 text-indigo-600 dark:text-indigo-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                            <div className="text-4xl font-serif font-bold text-stone-800 dark:text-stone-100">{getDaysRemaining()}</div>
                            <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Until the grand celebration</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Elegant Capsule Tabs */}
                <div className="bg-stone-100/80 dark:bg-stone-900/50 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-stone-200/50 dark:border-stone-800 max-w-fit shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-5 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-xl ${
                            activeTab === 'overview'
                                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]'
                                : 'text-stone-400 hover:text-stone-600 dark:text-stone-505 dark:hover:text-stone-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('guests')}
                        className={`py-2 px-5 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-xl ${
                            activeTab === 'guests'
                                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]'
                                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
                        }`}
                    >
                        Guests ({guests?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('wishes')}
                        className={`py-2 px-5 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-xl ${
                            activeTab === 'wishes'
                                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]'
                                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
                        }`}
                    >
                        Wishes ({wishes?.length || 0})
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`py-2 px-5 text-xs font-serif tracking-widest uppercase transition-all duration-300 rounded-xl ${
                            activeTab === 'settings'
                                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)]'
                                : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
                        }`}
                    >
                        Settings & Music
                    </button>
                </div>

                {/* Tab content */}
                <div className="flex-1 mt-2">
                    
                    {/* TAB 1: OVERVIEW */}
                    {activeTab === 'overview' && (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Live Wedding Status Card */}
                            <Card className="border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                                <CardHeader className="border-b border-stone-100 dark:border-stone-800/80 p-5 bg-stone-50/50 dark:bg-stone-900/30">
                                    <CardTitle className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">Wedding Overview</CardTitle>
                                    <CardDescription className="dark:text-stone-400">Quick view of the dynamic invitation settings.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-5 p-5">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 p-3 rounded-xl hover:border-amber-200/50 transition-all duration-300">
                                            <span className="text-[10px] uppercase text-stone-400 dark:text-stone-505 font-bold tracking-widest block">Bride</span>
                                            <span className="text-stone-800 dark:text-stone-200 capitalize font-serif font-bold text-base mt-0.5 block">{settings?.bride_name}</span>
                                        </div>
                                        <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 p-3 rounded-xl hover:border-amber-200/50 transition-all duration-300">
                                            <span className="text-[10px] uppercase text-stone-400 dark:text-stone-550 font-bold tracking-widest block">Groom</span>
                                            <span className="text-stone-800 dark:text-stone-200 capitalize font-serif font-bold text-base mt-0.5 block">{settings?.groom_name}</span>
                                        </div>
                                        <div className="col-span-2 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 p-4.5 rounded-xl">
                                            <span className="text-[10px] uppercase text-stone-400 dark:text-stone-500 font-bold tracking-widest block">Wedding Date & Time</span>
                                            <span className="text-stone-800 dark:text-stone-200 font-medium flex items-center gap-2 mt-1.5 font-mono text-xs">
                                                <Clock className="w-4 h-4 text-amber-500" />
                                                {settings?.wedding_date}
                                            </span>
                                        </div>
                                        <div className="col-span-2 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800 p-4.5 rounded-xl">
                                            <span className="text-[10px] uppercase text-stone-400 dark:text-stone-500 font-bold tracking-widest block mb-1">Celebration Venue</span>
                                            <span className="text-stone-800 dark:text-stone-200 font-serif font-bold text-sm block mt-0.5">{settings?.venue_name}</span>
                                            <span className="text-stone-500 dark:text-stone-400 text-xs italic block mt-0.5">{settings?.venue_city}</span>
                                        </div>
                                    </div>
                                    
                                    <Separator className="dark:bg-stone-800" />
                                    
                                    <div>
                                        <span className="text-[10px] uppercase text-stone-400 dark:text-stone-500 font-bold tracking-widest block mb-2">Active Background Track</span>
                                        {settings?.music_path ? (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 p-3.5 bg-gradient-to-tr from-stone-50 to-stone-100/20 dark:from-stone-900 dark:to-stone-800 border rounded-xl border-stone-200/60 dark:border-stone-800 shadow-sm relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-16 h-16 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-md transition-all duration-300" />
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400 relative">
                                                        <Volume2 className="w-5 h-5" />
                                                        <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-serif text-stone-800 dark:text-stone-200 truncate font-bold">Custom MP3 Track Loaded</p>
                                                        <p className="text-[9px] text-stone-400 dark:text-stone-500 truncate">Saved in secure public disk</p>
                                                    </div>
                                                </div>
                                                <audio controls src={settings.music_path} className="w-full sm:w-44 h-8 scale-90 sm:ml-auto focus:outline-none dark:invert opacity-85 hover:opacity-100 transition-opacity" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3.5 p-4 bg-stone-50 dark:bg-stone-900/50 border border-dashed rounded-xl border-stone-200 dark:border-stone-800">
                                                <div className="bg-stone-100 dark:bg-stone-800 p-2.5 rounded-lg text-stone-400 dark:text-stone-500">
                                                    <Music className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-stone-600 dark:text-stone-400 font-bold font-serif italic">Default Canon in D Active</p>
                                                    <p className="text-[9px] text-stone-400 dark:text-stone-500">Upload a custom MP3 in settings to make it personal</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-stone-50/50 dark:bg-stone-900/20 flex justify-between border-t border-stone-100 dark:border-stone-800/80 p-4">
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-wide">Live Database Link Active</span>
                                    <Button size="sm" variant="ghost" className="text-xs font-serif hover:bg-stone-200/40 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 rounded-full h-8" onClick={() => setActiveTab('settings')}>
                                        Edit Details &rarr;
                                    </Button>
                                </CardFooter>
                            </Card>

                            {/* Recent wishes block */}
                            <Card className="border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                                <CardHeader className="border-b border-stone-100 dark:border-stone-800/80 p-5 bg-stone-50/50 dark:bg-stone-900/30">
                                    <CardTitle className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">Latest Guestbook Messages</CardTitle>
                                    <CardDescription className="dark:text-stone-400">Most recent wishes submitted by public invitation guests.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 p-5 max-h-[340px] overflow-y-auto no-scrollbar">
                                    {wishes && wishes.length > 0 ? (
                                        wishes.slice(0, 4).map((wish) => (
                                            <div key={wish.id} className="p-4 bg-stone-50 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/70 rounded-xl relative group hover:border-amber-300 transition-all duration-300 hover:shadow-sm">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="text-xs font-serif font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                                                        <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                                                        {wish.name}
                                                    </h4>
                                                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono">{new Date(wish.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif leading-relaxed">"{wish.message}"</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-16 text-stone-400 dark:text-stone-500 text-xs italic font-serif">
                                            No messages left by guests yet.
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-stone-50/50 dark:bg-stone-900/20 flex justify-between border-t border-stone-100 dark:border-stone-800/80 p-4">
                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans tracking-wide">Showing latest 4 entries</span>
                                    <Button size="sm" variant="ghost" className="text-xs font-serif hover:bg-stone-200/40 text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200 rounded-full h-8" onClick={() => setActiveTab('wishes')}>
                                        Moderate Wishes &rarr;
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    )}

                    {/* TAB 2: GUEST LIST */}
                    {activeTab === 'guests' && (
                        <Card className="border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 dark:border-stone-850 p-5 bg-stone-50/40 dark:bg-stone-900/20">
                                <div>
                                    <CardTitle className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">Invitation Guest List</CardTitle>
                                    <CardDescription className="dark:text-stone-400">Add, update, or import guests allowed to search their names on the wedding page.</CardDescription>
                                </div>
                                
                                <div className="flex gap-2 font-serif">
                                    {/* Dialog Add Guest */}
                                    <Dialog open={isAddGuestOpen} onOpenChange={setIsAddGuestOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="bg-stone-900 hover:bg-stone-850 dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 text-white rounded-full font-serif px-4 py-2 flex items-center gap-1.5 shadow-sm text-xs">
                                                <Plus className="w-4 h-4" /> Add Guest
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] rounded-2xl border-stone-200 dark:border-stone-800">
                                            <form onSubmit={handleAddGuest}>
                                                <DialogHeader>
                                                    <DialogTitle className="font-serif text-stone-900 dark:text-stone-100 text-lg">Add New Guest</DialogTitle>
                                                    <DialogDescription className="text-xs text-stone-450 dark:text-stone-500">
                                                        Enter the full name of the guest or family to allow them to access their personalized invitation card.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4.5">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-stone-450">Full Name / Label (e.g. Ahmed & Family)</Label>
                                                        <Input 
                                                            id="name" 
                                                            value={addGuestForm.data.name} 
                                                            onChange={e => addGuestForm.setData('name', e.target.value)}
                                                            placeholder="Ahmed & Family" 
                                                            className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500 text-sm"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" disabled={addGuestForm.processing} className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 text-white rounded-full font-serif px-5">
                                                        {addGuestForm.processing ? 'Adding...' : 'Add Guest'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    {/* Dialog Batch Add Guests */}
                                    <Dialog open={isBatchAddOpen} onOpenChange={setIsBatchAddOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="rounded-full border-stone-300 dark:border-stone-850 gap-1.5 text-stone-600 dark:text-stone-400 font-serif px-4 hover:bg-stone-100/50 dark:hover:bg-stone-800/50 text-xs">
                                                <Copy className="w-4 h-4" /> Batch Import
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px] rounded-2xl border-stone-200 dark:border-stone-800">
                                            <form onSubmit={handleBatchAddGuests}>
                                                <DialogHeader>
                                                    <DialogTitle className="font-serif text-stone-900 dark:text-stone-100 text-lg">Batch Import Guests</DialogTitle>
                                                    <DialogDescription className="text-xs text-stone-450 dark:text-stone-500">
                                                        Paste a list of names. Separate names with a new line (Enter key) to import multiple guests instantly.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4.5">
                                                    <div className="grid gap-2">
                                                        <Label htmlFor="names_list" className="text-xs font-bold uppercase tracking-wider text-stone-450">Paste Guest Names (one per line)</Label>
                                                        <textarea 
                                                            id="names_list" 
                                                            value={batchGuestForm.data.names_list} 
                                                            onChange={e => batchGuestForm.setData('names_list', e.target.value)}
                                                            className="w-full h-[180px] bg-stone-50/50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 dark:text-stone-200"
                                                            placeholder="Dr. Ahmed Ibrahim&#10;Sarah Aly & Guest&#10;Mostafa Mansour&#10;Laila Kamel"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button type="submit" disabled={batchGuestForm.processing} className="bg-stone-900 hover:bg-stone-850 dark:bg-stone-200 dark:hover:bg-stone-300 dark:text-stone-900 text-white rounded-full font-serif px-5">
                                                        {batchGuestForm.processing ? 'Importing...' : 'Bulk Import'}
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 p-5">
                                {/* Search Bar */}
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
                                    <Input
                                        type="text"
                                        placeholder="Search guests by name..."
                                        value={guestSearch}
                                        onChange={e => setGuestSearch(e.target.value)}
                                        className="pl-10 rounded-xl bg-stone-50/30 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                {/* Guests list table */}
                                <div className="border border-stone-150 dark:border-stone-800 rounded-2xl overflow-hidden bg-white dark:bg-stone-900/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
                                    <div className="grid grid-cols-12 bg-stone-50/80 dark:bg-stone-900/70 p-3.5 border-b border-stone-150 dark:border-stone-800 text-[10px] font-sans uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold">
                                        <div className="col-span-9 md:col-span-10">Guest Name</div>
                                        <div className="col-span-3 md:col-span-2 text-right">Actions</div>
                                    </div>
                            
                                    <div className="divide-y divide-stone-100 dark:divide-stone-800/80 max-h-[450px] overflow-y-auto no-scrollbar">
                                        {filteredGuests && filteredGuests.length > 0 ? (
                                            filteredGuests.map((guest) => (
                                                <div key={guest.id} className="grid grid-cols-12 p-3.5 items-center text-sm hover:bg-stone-50/40 dark:hover:bg-stone-800/30 transition-colors">
                                                    
                                                    {/* Name Column */}
                                                    <div className="col-span-9 md:col-span-10 font-medium text-stone-800 dark:text-stone-200 pr-2">
                                                        {editingGuest?.id === guest.id ? (
                                                            <Input 
                                                                value={editGuestForm.data.name}
                                                                onChange={e => editGuestForm.setData('name', e.target.value)}
                                                                className="h-9 max-w-xs text-sm rounded-lg focus:ring-amber-500/20 focus:border-amber-500"
                                                            />
                                                        ) : (
                                                            guest.name
                                                        )}
                                                    </div>

                                                    {/* Actions Column */}
                                                    <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-1.5">
                                                        {editingGuest?.id === guest.id ? (
                                                            <>
                                                                <Button 
                                                                    size="sm" 
                                                                    className="h-8 bg-stone-900 text-white dark:bg-stone-200 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-300 text-xs px-3 rounded-lg"
                                                                    onClick={handleEditGuest}
                                                                    disabled={editGuestForm.processing}
                                                                >
                                                                    {editGuestForm.processing ? 'Saving...' : 'Save'}
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    className="h-8 text-xs px-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg"
                                                                    onClick={() => setEditingGuest(null)}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="w-8.5 h-8.5 rounded-full hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/20 dark:hover:text-amber-400 text-stone-450 dark:text-stone-500 transition-colors"
                                                                    onClick={() => {
                                                                        setEditingGuest(guest);
                                                                        editGuestForm.setData({
                                                                            name: guest.name,
                                                                        });
                                                                    }}
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                </Button>
                                                                <Button 
                                                                    size="icon" 
                                                                    variant="ghost" 
                                                                    className="w-8.5 h-8.5 rounded-full hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-450 text-stone-455 dark:text-stone-500 transition-colors"
                                                                    onClick={() => handleDeleteGuest(guest.id)}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-24 text-stone-400 dark:text-stone-500 text-xs italic font-serif">
                                                No guests found matching your search criteria.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 3: WISHES MODERATION */}
                    {activeTab === 'wishes' && (
                        <Card className="border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                            <CardHeader className="border-b border-stone-100 dark:border-stone-850 p-5 bg-stone-50/40 dark:bg-stone-900/20">
                                <CardTitle className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">Received Wedding Wishes</CardTitle>
                                <CardDescription className="dark:text-stone-400">View, moderate, and remove wishes left by guests on the public welcome page.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {wishes && wishes.length > 0 ? (
                                        wishes.map((wish) => (
                                            <Card key={wish.id} className="border border-stone-150 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/30 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl flex flex-col justify-between">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/2 blur-lg rounded-full pointer-events-none" />
                                                
                                                <CardHeader className="p-4 pb-2.5 flex flex-row justify-between items-start gap-2">
                                                    <div>
                                                        <h4 className="text-xs font-sans font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                                                            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                                                            {wish.name}
                                                        </h4>
                                                        <span className="text-[9px] text-stone-400 dark:text-stone-500 font-mono mt-1 block">{new Date(wish.created_at).toLocaleDateString()}</span>
                                                    </div>
                                                    
                                                    {/* Delete wish trigger */}
                                                    <Button 
                                                        size="icon" 
                                                        variant="ghost" 
                                                        className="w-8.5 h-8.5 rounded-full text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 dark:hover:text-rose-450 transition-colors"
                                                        onClick={() => handleDeleteWish(wish.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </CardHeader>
                                                <CardContent className="p-4 pt-0 flex-1">
                                                    <p className="text-xs text-stone-600 dark:text-stone-400 italic font-serif leading-relaxed">"{wish.message}"</p>
                                                </CardContent>
                                                <CardFooter className="p-3 border-t border-stone-100 dark:border-stone-850 bg-stone-50/30 dark:bg-stone-900/40 flex justify-end">
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        className="text-[10px] tracking-widest uppercase font-sans font-bold text-amber-600 hover:text-amber-800 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/20 rounded-full h-8 px-4 border border-amber-250/50 hover:border-amber-300 transition-all duration-300"
                                                        onClick={() => {
                                                            setSelectedWish(wish);
                                                            setIsKeepsakeOpen(true);
                                                        }}
                                                    >
                                                        Create Keepsake &rarr;
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="col-span-full text-center py-24 text-stone-400 dark:text-stone-500 text-xs italic font-serif">
                                            No wedding wishes submitted yet.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* TAB 4: SETTINGS & MUSIC */}
                    {activeTab === 'settings' && (
                        <Card className="border border-stone-200/80 dark:border-stone-800 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl overflow-hidden bg-white dark:bg-stone-900">
                            <CardHeader className="border-b border-stone-100 dark:border-stone-850 p-5 bg-stone-50/40 dark:bg-stone-900/20">
                                <CardTitle className="font-serif text-lg font-bold text-stone-800 dark:text-stone-100">Wedding Configuration & Music Control</CardTitle>
                                <CardDescription className="dark:text-stone-400">Customize couple details, wedding date & time, venue text, and upload site background audio.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleSaveSettings}>
                                <CardContent className="space-y-8 p-6">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        
                                        {/* Left Side: General Wedding Details Form */}
                                        <div className="space-y-5">
                                            <h3 className="font-serif font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                                                <Heart className="w-4 h-4" /> General Wedding Settings
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="bride_name" className="text-xs font-bold uppercase tracking-wider text-stone-500">Bride's Name</Label>
                                                    <Input 
                                                        id="bride_name" 
                                                        value={settingsForm.data.bride_name} 
                                                        onChange={e => settingsForm.setData('bride_name', e.target.value)}
                                                        className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="groom_name" className="text-xs font-bold uppercase tracking-wider text-stone-500">Groom's Name</Label>
                                                    <Input 
                                                        id="groom_name" 
                                                        value={settingsForm.data.groom_name} 
                                                        onChange={e => settingsForm.setData('groom_name', e.target.value)}
                                                        className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="wedding_date" className="text-xs font-bold uppercase tracking-wider text-stone-505">Wedding Date & Time (YYYY-MM-DD HH:MM:SS)</Label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-505" />
                                                    <Input 
                                                        id="wedding_date" 
                                                        value={settingsForm.data.wedding_date} 
                                                        onChange={e => settingsForm.setData('wedding_date', e.target.value)}
                                                        placeholder="2026-08-15 18:00:00"
                                                        className="pl-10 font-mono text-xs rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required
                                                    />
                                                </div>
                                                <span className="text-[10px] text-stone-400 dark:text-stone-500 italic">Adjust this to set the live countdown date. Make sure the format is exact.</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="ceremony_time" className="text-xs font-bold uppercase tracking-wider text-stone-500">Ceremony Time</Label>
                                                    <Input 
                                                        id="ceremony_time" 
                                                        value={settingsForm.data.ceremony_time} 
                                                        onChange={e => settingsForm.setData('ceremony_time', e.target.value)}
                                                        placeholder="Six o'clock in the evening"
                                                        className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required
                                                    />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="reception_time" className="text-xs font-bold uppercase tracking-wider text-stone-500">Reception Time</Label>
                                                    <Input 
                                                        id="reception_time" 
                                                        value={settingsForm.data.reception_time} 
                                                        onChange={e => settingsForm.setData('reception_time', e.target.value)}
                                                        placeholder="Eight o'clock in the evening"
                                                        className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="venue_name" className="text-xs font-bold uppercase tracking-wider text-stone-500">Venue Name</Label>
                                                <Input 
                                                    id="venue_name" 
                                                    value={settingsForm.data.venue_name} 
                                                    onChange={e => settingsForm.setData('venue_name', e.target.value)}
                                                    className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="venue_city" className="text-xs font-bold uppercase tracking-wider text-stone-500">Venue City</Label>
                                                <Input 
                                                    id="venue_city" 
                                                    value={settingsForm.data.venue_city} 
                                                    onChange={e => settingsForm.setData('venue_city', e.target.value)}
                                                    className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500"
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="venue_address" className="text-xs font-bold uppercase tracking-wider text-stone-500">Venue Full Address</Label>
                                                <textarea 
                                                    id="venue_address" 
                                                    value={settingsForm.data.venue_address} 
                                                    onChange={e => settingsForm.setData('venue_address', e.target.value)}
                                                    rows={3}
                                                    className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-stone-800 dark:text-stone-200"
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="venue_maps_url" className="text-xs font-bold uppercase tracking-wider text-stone-550">Google Maps URL</Label>
                                                <Input 
                                                    id="venue_maps_url" 
                                                    value={settingsForm.data.venue_maps_url} 
                                                    onChange={e => settingsForm.setData('venue_maps_url', e.target.value)}
                                                    placeholder="https://www.google.com/maps/..."
                                                    className="rounded-xl border-stone-200 dark:border-stone-800 focus:ring-amber-500/20 focus:border-amber-500 text-xs"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Right Side: Website Background Music Upload */}
                                        <div className="space-y-5 md:border-l md:pl-8 border-stone-150 dark:border-stone-800">
                                            <h3 className="font-serif font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-widest border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                                                <Music className="w-4 h-4" /> Website Background Music
                                            </h3>
                                            
                                            <div className="grid gap-5">
                                                <div 
                                                    className="p-8 bg-stone-50/50 dark:bg-stone-900/50 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl flex flex-col items-center justify-center text-center relative hover:bg-stone-50 dark:hover:bg-stone-850/50 transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-950 group cursor-pointer"
                                                    onClick={() => document.getElementById('music_file')?.click()}
                                                >
                                                    <div className="bg-white dark:bg-stone-800 shadow-sm p-3 rounded-full mb-3 group-hover:scale-110 transition-transform text-amber-500">
                                                        <Music className="w-7 h-7 animate-pulse" />
                                                    </div>
                                                    <span className="text-xs font-serif font-bold text-stone-700 dark:text-stone-200 block mb-1">Drag & Drop Music File</span>
                                                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block mb-4">Supports MP3 / WAV audio, max size 20MB</span>
                                                    
                                                    {/* Custom upload button */}
                                                    <div className="relative">
                                                        <Input 
                                                            type="file" 
                                                            id="music_file"
                                                            accept=".mp3,.wav"
                                                            onChange={e => settingsForm.setData('music_file', e.target.files ? e.target.files[0] : null)}
                                                            className="hidden"
                                                        />
                                                        <Button 
                                                            type="button" 
                                                            variant="outline" 
                                                            className="rounded-full text-xs font-serif h-9 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 px-5 shadow-sm"
                                                        >
                                                            <Upload className="w-3.5 h-3.5 mr-1" /> Select File
                                                        </Button>
                                                    </div>

                                                    {settingsForm.data.music_file && (
                                                        <div className="mt-4 p-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-xl text-[10px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 shadow-sm">
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100 dark:fill-transparent" />
                                                            <span className="truncate max-w-[200px]">{settingsForm.data.music_file.name}</span>
                                                            <span className="font-bold">({(settingsForm.data.music_file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload Progress Bar */}
                                                {settingsForm.progress && (
                                                    <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden shadow-inner">
                                                        <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-300" style={{ width: `${settingsForm.progress.percentage}%` }} />
                                                    </div>
                                                )}

                                                <Separator className="dark:bg-stone-800" />

                                                {/* Music Preview Player */}
                                                <div>
                                                    <Label className="block mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Background Music Preview Player</Label>
                                                    {settings?.music_path ? (
                                                        <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 p-4.5 rounded-2xl space-y-3.5 shadow-sm relative overflow-hidden group">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase flex items-center gap-1.5">
                                                                    <Volume2 className="w-4 h-4" /> Dynamic Music Active
                                                                </span>
                                                            </div>
                                                            <audio controls src={settings.music_path} className="w-full h-9 dark:invert focus:outline-none" />
                                                        </div>
                                                    ) : (
                                                        <div className="bg-stone-50 dark:bg-stone-900/50 border border-stone-200 border-dashed p-5 rounded-2xl text-center">
                                                            <p className="text-xs text-stone-500 dark:text-stone-400 italic font-serif">Currently playing default song: Canon in D</p>
                                                            <p className="text-[10px] text-stone-400 dark:text-stone-500 mt-1">Upload a custom MP3 above and save to replace it!</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t border-stone-100 dark:border-stone-800 p-5 bg-stone-50/50 dark:bg-stone-900/20 flex justify-end gap-2">
                                    <Button 
                                        type="submit" 
                                        disabled={settingsForm.processing} 
                                        className="bg-stone-900 hover:bg-stone-800 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-stone-300 text-white rounded-full font-serif px-6 py-2.5 flex items-center gap-1.5 shadow-md"
                                    >
                                        <Save className="w-4 h-4" /> {settingsForm.processing ? 'Saving...' : 'Save Settings'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    )}
                </div>
            </div>

            {/* Keepsake Customizer Modal */}
            <ElegantWishModal 
                isOpen={isKeepsakeOpen}
                onClose={() => setIsKeepsakeOpen(false)}
                wish={selectedWish}
                coupleNames={{
                    bride: settings?.bride_name,
                    groom: settings?.groom_name,
                    date: settings?.wedding_date
                }}
            />
        </AppLayout>
    );
}
