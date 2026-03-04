import './style.css'
import { auth, db, storage } from './firebase.js'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

const adminApp = document.querySelector('#admin-app');

const renderLogin = () => {
    adminApp.innerHTML = `
    <div class="min-h-screen flex items-center justify-center px-6">
        <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-md w-full relative">
            <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary px-6 py-2 rounded text-background-dark font-black uppercase text-sm shadow-[0_0_15px_rgba(212,175,53,0.3)]">
                Admin Access
            </div>
            <div class="text-center mb-10 pt-4">
                <img src="/logo-avatar.jpg" class="h-20 w-auto mx-auto rounded border border-primary/30 mb-4" />
                <h1 class="text-3xl font-black gold-gradient-text uppercase">The Platinum Fingers</h1>
            </div>
            <form id="admin-login-form" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-xs uppercase tracking-widest font-black text-slate-500">Admin Email</label>
                    <input id="login-email" type="email" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" required />
                </div>
                <div class="space-y-2">
                    <label class="text-xs uppercase tracking-widest font-black text-slate-500">Password</label>
                    <input id="login-password" type="password" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" required />
                </div>
                <button type="submit" id="login-submit" class="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-[0.2em] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all transform active:scale-[0.98]">
                    Verify Identity
                </button>
            </form>
            <div id="login-error" class="hidden mt-6 p-4 rounded bg-red-500/10 border border-red-500/50 text-red-500 text-sm text-center"></div>
        </div>
    </div>
    `;

    document.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.querySelector('#login-email').value;
        const password = document.querySelector('#login-password').value;
        const errorDiv = document.querySelector('#login-error');
        const submitBtn = document.querySelector('#login-submit');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Authenticating...';
        errorDiv.classList.add('hidden');

        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error(error);
            errorDiv.textContent = 'Invalid credentials or access denied.';
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify Identity';
        }
    });
};

const renderDashboard = (user) => {
    adminApp.innerHTML = `
    <div class="min-h-screen flex">
        <!-- Sidebar -->
        <aside class="w-64 bg-background-dark border-r border-primary/10 flex flex-col p-6 fixed h-full z-50">
            <div class="flex items-center gap-4 mb-12">
                <img src="/logo-avatar.jpg" class="h-10 w-auto rounded border border-primary/20" />
                <span class="font-black text-sm tracking-tighter gold-gradient-text uppercase">Control Center</span>
            </div>
            
            <nav class="flex-1 space-y-2">
                <button data-tab="mixes" class="admin-nav-item active">
                    <span class="material-symbols-outlined">library_music</span> Mix Library
                </button>
                <button data-tab="gallery" class="admin-nav-item">
                    <span class="material-symbols-outlined">photo_library</span> Gallery
                </button>
                <button data-tab="events" class="admin-nav-item">
                    <span class="material-symbols-outlined">event</span> Tour Dates
                </button>
                <button data-tab="inquiries" class="admin-nav-item">
                    <span class="material-symbols-outlined">mail</span> Inquiries
                </button>
            </nav>

            <div class="pt-6 border-t border-primary/10">
                <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Account: ${user.email}</p>
                <button id="admin-logout" class="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-widest">
                    <span class="material-symbols-outlined">logout</span> Sign Out
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 ml-64 p-12 bg-[#080808]">
            <div id="tab-content" class="max-w-5xl mx-auto">
                <!-- Content will be injected here -->
            </div>
        </main>
    </div>
    `;

    document.getElementById('admin-logout').addEventListener('click', () => signOut(auth));

    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderTabContent(item.dataset.tab);
        });
    });

    // Default tab
    renderTabContent('mixes');
};

const uploadMix = async (file, cover, title, subtitle) => {
    const loader = document.getElementById('upload-loader');
    loader.classList.remove('hidden');

    try {
        const audioRef = ref(storage, `mixes/${Date.now()}-${file.name}`);
        const coverRef = ref(storage, `covers/${Date.now()}-${cover.name}`);

        const [audioSnap, coverSnap] = await Promise.all([
            uploadBytes(audioRef, file),
            uploadBytes(coverRef, cover)
        ]);

        const [audioUrl, imgUrl] = await Promise.all([
            getDownloadURL(audioRef),
            getDownloadURL(coverRef)
        ]);

        await addDoc(collection(db, "mixes"), {
            title,
            subtitle,
            audioUrl,
            imgUrl,
            createdAt: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed: " + error.message);
        return false;
    } finally {
        loader.classList.add('hidden');
    }
};

const renderMixesList = async () => {
    const list = document.getElementById('mixes-list');
    const q = query(collection(db, "mixes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `
            <div class="flex items-center justify-center p-20 glass-card rounded-xl">
                <p class="text-slate-500 font-bold uppercase tracking-widest">No Mixes Found</p>
            </div>
        `;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const mix = docSnap.data();
        return `
            <div class="admin-card flex items-center gap-6 group hover:bg-white/5">
                <img src="${mix.imgUrl}" class="h-16 w-16 rounded object-cover border border-primary/20 shadow-lg" />
                <div class="flex-1">
                    <h3 class="font-black text-lg uppercase tracking-tight">${mix.title}</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-widest">${mix.subtitle}</p>
                </div>
                <button onclick="window.deleteMix('${docSnap.id}')" class="text-red-500/50 hover:text-red-500 transition-colors p-3 rounded-lg hover:bg-red-500/10">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
    }).join('');
};

window.deleteMix = async (id, audioUrl, imgUrl) => {
    if (!confirm('Are you sure you want to delete this mix?')) return;
    try {
        await deleteDoc(doc(db, "mixes", id));
        // Optional: Delete from storage as well
        if (audioUrl) {
            const aRef = ref(storage, audioUrl);
            await deleteObject(aRef).catch(e => console.warn("Audio delete failed:", e));
        }
        if (imgUrl) {
            const iRef = ref(storage, imgUrl);
            await deleteObject(iRef).catch(e => console.warn("Img delete failed:", e));
        }
        renderMixesList();
    } catch (e) {
        alert("Delete failed: " + e.message);
    }
};

// --- Gallery Functions ---
const uploadPhoto = async (file, title, subtitle) => {
    const loader = document.getElementById('gallery-loader');
    if (loader) loader.classList.remove('hidden');

    try {
        const photoRef = ref(storage, `gallery/${Date.now()}-${file.name}`);
        await uploadBytes(photoRef, file);
        const imgUrl = await getDownloadURL(photoRef);

        await addDoc(collection(db, "gallery"), {
            title,
            subtitle,
            imgUrl,
            createdAt: serverTimestamp()
        });
        return true;
    } catch (e) {
        console.error(e);
        return false;
    } finally {
        if (loader) loader.classList.add('hidden');
    }
};

const renderGalleryList = async () => {
    const list = document.getElementById('gallery-list');
    const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs">No Photos in Gallery</div>`;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const photo = docSnap.data();
        return `
            <div class="admin-card group relative p-2">
                <img src="${photo.imgUrl}" class="w-full aspect-square object-cover rounded-lg mb-4" />
                <div class="px-2 pb-2">
                    <h4 class="font-bold uppercase text-sm truncate">${photo.title}</h4>
                    <p class="text-[10px] text-slate-500 uppercase truncate">${photo.subtitle}</p>
                </div>
                <button onclick="window.deletePhoto('${docSnap.id}', '${photo.imgUrl}')" class="absolute top-4 right-4 bg-red-500 text-white size-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        `;
    }).join('');
};

window.deletePhoto = async (id, imgUrl) => {
    if (!confirm('Delete photo?')) return;
    try {
        await deleteDoc(doc(db, "gallery", id));
        if (imgUrl) {
            const iRef = ref(storage, imgUrl);
            await deleteObject(iRef).catch(e => console.warn(e));
        }
        renderGalleryList();
    } catch (e) { alert(e.message); }
};

// --- Events Functions ---
const renderEventsList = async () => {
    const list = document.getElementById('events-list');
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs">No Tour Dates Scheduled</div>`;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const ev = docSnap.data();
        return `
            <div class="admin-card flex items-center gap-6 group">
                <div class="bg-primary/10 p-4 rounded-lg text-primary text-center min-w-[80px]">
                    <p class="text-xl font-black">${new Date(ev.date).getDate()}</p>
                    <p class="text-[10px] font-bold uppercase">${new Date(ev.date).toLocaleString('default', { month: 'short' })}</p>
                </div>
                <div class="flex-1">
                    <h3 class="font-black uppercase">${ev.title}</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-widest">${ev.location}</p>
                </div>
                <div class="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] uppercase font-bold text-slate-400">
                    ${ev.tag}
                </div>
                <button onclick="window.deleteEvent('${docSnap.id}')" class="text-slate-600 hover:text-red-500 p-2">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
    }).join('');
};

window.deleteEvent = async (id) => {
    if (!confirm('Remove tour date?')) return;
    await deleteDoc(doc(db, "events", id));
    renderEventsList();
};

// --- Inquiries Functions ---
const renderInquiriesList = async () => {
    const list = document.getElementById('inquiries-list');
    const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs">No Incoming Requests</div>`;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const inq = docSnap.data();
        return `
            <div class="admin-card space-y-4 border-l-4 ${inq.status === 'archived' ? 'border-l-slate-700' : 'border-l-primary'}">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-black text-lg uppercase">${inq.name}</h4>
                        <p class="text-primary text-xs font-bold">${inq.email}</p>
                    </div>
                    <p class="text-[10px] text-slate-600 uppercase font-bold">${inq.timestamp?.toDate().toLocaleString()}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 py-3 border-y border-white/5">
                    <div>
                        <p class="text-[8px] text-slate-500 uppercase font-black mb-1">Target Event</p>
                        <p class="text-xs uppercase font-bold">${inq.event || 'GENERAL INQUIRY'}</p>
                    </div>
                    <div>
                        <p class="text-[8px] text-slate-500 uppercase font-black mb-1">Location Profile</p>
                        <p class="text-xs uppercase font-bold">${inq.location || 'UNDISCLOSED'}</p>
                    </div>
                </div>
                <div class="bg-white/5 p-4 rounded-lg">
                    <p class="text-sm text-slate-300 italic">"${inq.message}"</p>
                </div>
                <div class="flex justify-end gap-3">
                    <button onclick="window.deleteInquiry('${docSnap.id}')" class="text-red-500/50 hover:text-red-500 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                        <span class="material-symbols-outlined text-sm">delete</span> Burn Record
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.deleteInquiry = async (id) => {
    if (!confirm('Permanent deletion of inquiry record?')) return;
    await deleteDoc(doc(db, "inquiries", id));
    renderInquiriesList();
};

const renderTabContent = (tab) => {
    const container = document.getElementById('tab-content');

    switch (tab) {
        case 'mixes':
            container.innerHTML = `
                <div class="flex items-center justify-between mb-12">
                    <div>
                        <h2 class="text-4xl font-black gold-gradient-text uppercase">Mix Library</h2>
                        <p class="text-slate-400 mt-2">Manage your sonic portfolio.</p>
                    </div>
                    <button id="add-mix-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        <span class="material-symbols-outlined">add_circle</span> New Mix
                    </button>
                </div>

                <!-- Upload Modal Placeholder -->
                <div id="upload-modal" class="hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-lg w-full">
                        <h3 class="text-2xl font-black gold-gradient-text uppercase mb-8">Upload New Mix</h3>
                        <form id="mix-upload-form" class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Audio File (MP3)</label>
                                    <input id="mix-audio" type="file" accept="audio/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Cover Image</label>
                                    <input id="mix-cover" type="file" accept="image/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Mix Title</label>
                                <input id="mix-title" type="text" placeholder="e.g. MONTE CARLO NIGHTS" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" required />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Subtitle/Tags</label>
                                <input id="mix-subtitle" type="text" placeholder="e.g. DEEP HOUSE / AFROBEATS" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" required />
                            </div>
                            
                            <div id="upload-loader" class="hidden py-4 text-center">
                                <div class="inline-block animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mb-2"></div>
                                <p class="text-[10px] uppercase tracking-widest text-primary animate-pulse">Uploading to Private Vault...</p>
                            </div>

                            <div class="flex gap-4 pt-4">
                                <button type="button" id="close-modal" class="flex-1 py-4 border border-white/10 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" class="flex-[2] py-4 bg-primary text-background-dark font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all">Publish Mix</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid gap-4" id="mixes-list">
                    <div class="animate-pulse flex items-center justify-center p-20 glass-card rounded-xl">
                        <p class="text-primary/30 font-bold uppercase tracking-widest">In Sync with Vault...</p>
                    </div>
                </div>
            `;

            document.getElementById('add-mix-btn').onclick = () => document.getElementById('upload-modal').classList.remove('hidden');
            document.getElementById('close-modal').onclick = () => document.getElementById('upload-modal').classList.add('hidden');

            document.getElementById('mix-upload-form').onsubmit = async (e) => {
                e.preventDefault();
                const audio = document.getElementById('mix-audio').files[0];
                const cover = document.getElementById('mix-cover').files[0];
                const title = document.getElementById('mix-title').value;
                const subtitle = document.getElementById('mix-subtitle').value;

                if (await uploadMix(audio, cover, title, subtitle)) {
                    document.getElementById('upload-modal').classList.add('hidden');
                    renderMixesList();
                }
            };

            renderMixesList();
            break;
        case 'gallery':
            container.innerHTML = `
                <div class="flex items-center justify-between mb-12">
                    <div>
                        <h2 class="text-4xl font-black gold-gradient-text uppercase">Gallery</h2>
                        <p class="text-slate-400 mt-2">Elite visual assets.</p>
                    </div>
                    <button id="add-photo-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        Add Visual
                    </button>
                </div>

                <div id="gallery-upload-modal" class="hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-lg w-full">
                        <h3 class="text-2xl font-black gold-gradient-text uppercase mb-8">Add Photo</h3>
                        <form id="photo-upload-form" class="space-y-6">
                            <input id="photo-file" type="file" accept="image/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                            <input id="photo-title" type="text" placeholder="Title" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <input id="photo-subtitle" type="text" placeholder="Subtitle" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <div id="gallery-loader" class="hidden text-center"><div class="animate-spin h-5 w-5 border-2 border-primary border-t-transparent mx-auto"></div></div>
                            <div class="flex gap-4">
                                <button type="button" id="close-gallery-modal" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold">Cancel</button>
                                <button type="submit" class="flex-[2] py-3 bg-primary text-background-dark font-black rounded-lg">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="gallery-list"></div>
            `;
            document.getElementById('add-photo-btn').onclick = () => document.getElementById('gallery-upload-modal').classList.remove('hidden');
            document.getElementById('close-gallery-modal').onclick = () => document.getElementById('gallery-upload-modal').classList.add('hidden');
            document.getElementById('photo-upload-form').onsubmit = async (e) => {
                e.preventDefault();
                const file = document.getElementById('photo-file').files[0];
                const title = document.getElementById('photo-title').value;
                const subtitle = document.getElementById('photo-subtitle').value;
                if (await uploadPhoto(file, title, subtitle)) {
                    document.getElementById('gallery-upload-modal').classList.add('hidden');
                    renderGalleryList();
                }
            };
            renderGalleryList();
            break;

        case 'events':
            container.innerHTML = `
                <div class="flex items-center justify-between mb-12">
                    <div>
                        <h2 class="text-4xl font-black gold-gradient-text uppercase">Tour Dates</h2>
                        <p class="text-slate-400 mt-2">World residency schedule.</p>
                    </div>
                    <button id="add-event-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        Add Date
                    </button>
                </div>

                <div id="event-modal" class="hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-lg w-full">
                        <h3 class="text-2xl font-black gold-gradient-text uppercase mb-8">Schedule Performance</h3>
                        <form id="event-form" class="space-y-6">
                            <input id="event-date" type="date" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <input id="event-title" type="text" placeholder="Club/Event Name" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <input id="event-location" type="text" placeholder="City, Country" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <div class="grid grid-cols-2 gap-4">
                                <input id="event-tag" type="text" placeholder="Tag (e.g. VIP Only)" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                                <select id="event-tag-type" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white">
                                    <option value="normal">Standard</option>
                                    <option value="soldout">Sold Out</option>
                                </select>
                            </div>
                            <div class="flex gap-4">
                                <button type="button" id="close-event-modal" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold">Cancel</button>
                                <button type="submit" class="flex-[2] py-3 bg-primary text-background-dark font-black rounded-lg">Confirm Date</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid gap-4" id="events-list"></div>
            `;
            document.getElementById('add-event-btn').onclick = () => document.getElementById('event-modal').classList.remove('hidden');
            document.getElementById('close-event-modal').onclick = () => document.getElementById('event-modal').classList.add('hidden');
            document.getElementById('event-form').onsubmit = async (e) => {
                e.preventDefault();
                await addDoc(collection(db, "events"), {
                    date: document.getElementById('event-date').value,
                    title: document.getElementById('event-title').value,
                    location: document.getElementById('event-location').value,
                    tag: document.getElementById('event-tag').value,
                    tagType: document.getElementById('event-tag-type').value,
                    createdAt: serverTimestamp()
                });
                document.getElementById('event-modal').classList.add('hidden');
                renderEventsList();
            };
            renderEventsList();
            break;

        case 'inquiries':
            container.innerHTML = `
                <div class="mb-12">
                    <h2 class="text-4xl font-black gold-gradient-text uppercase">Private Inquiries</h2>
                    <p class="text-slate-400 mt-2">Direct lines from the global elite.</p>
                </div>
                <div class="grid gap-6" id="inquiries-list"></div>
            `;
            renderInquiriesList();
            break;
    }
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        renderDashboard(user);
    } else {
        renderLogin();
    }
});
