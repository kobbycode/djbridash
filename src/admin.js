import './style.css'
import { auth, db, storage } from './firebase.js'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc, getDoc, doc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";


const adminApp = document.querySelector('#admin-app');

// ─── Custom Alert / Confirm Modal System ────────────────────────────────────
const showAlert = (message, type = 'info') => {
    return new Promise(resolve => {
        const icons = { info: 'info', error: 'error', success: 'check_circle', warning: 'warning' };
        const colors = { info: 'text-primary border-primary/40', error: 'text-red-400 border-red-500/40', success: 'text-emerald-400 border-emerald-500/40', warning: 'text-amber-400 border-amber-500/40' };

        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in';
        overlay.innerHTML = `
            <div class="glass-card max-w-sm w-full rounded-2xl border ${colors[type]} p-8 text-center shadow-2xl">
                <span class="material-symbols-outlined text-5xl ${colors[type].split(' ')[0]} mb-4 block">${icons[type]}</span>
                <p class="text-white font-medium text-sm leading-relaxed mb-8">${message}</p>
                <button id="modal-ok" class="w-full py-3 bg-primary text-background-dark font-black uppercase tracking-widest text-sm rounded-lg hover:opacity-90 transition-opacity">OK</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#modal-ok').addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
    });
};

const showConfirm = (message) => {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in';
        overlay.innerHTML = `
            <div class="glass-card max-w-sm w-full rounded-2xl border border-red-500/30 p-8 text-center shadow-2xl">
                <span class="material-symbols-outlined text-5xl text-red-400 mb-4 block">delete_forever</span>
                <p class="text-white font-medium text-sm leading-relaxed mb-8">${message}</p>
                <div class="flex gap-4">
                    <button id="modal-cancel" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
                    <button id="modal-confirm" class="flex-1 py-3 bg-red-500 text-white font-black uppercase tracking-widest text-sm rounded-lg hover:bg-red-400 transition-colors">Delete</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.querySelector('#modal-cancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
        overlay.querySelector('#modal-confirm').addEventListener('click', () => { overlay.remove(); resolve(true); });
    });
};
// ────────────────────────────────────────────────────────────────────────────

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
                <button data-tab="videos" class="admin-nav-item">
                    <span class="material-symbols-outlined">smart_display</span> Videos
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

// ─── Shared Progress Tracker ───────────────────────────────────────────────
const trackUpload = (uploadTask, progressFillId, progressTextId, label) => {
    return new Promise((resolve, reject) => {
        const fill = document.getElementById(progressFillId);
        const text = document.getElementById(progressTextId);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (fill) fill.style.width = progress + '%';
                if (text) text.textContent = `${label}: ${Math.round(progress)}%`;
            },
            (error) => reject(error),
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
            }
        );
    });
};
// ────────────────────────────────────────────────────────────────────────────

// uploadMix function logic moved directly to the unified onsubmit handler below

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
                <div class="flex gap-2">
                    <button onclick="window.editMix('${docSnap.id}')" class="text-primary/50 hover:text-primary transition-colors p-3 rounded-lg hover:bg-primary/10">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="window.deleteMix('${docSnap.id}', '${mix.audioUrl}', '${mix.imgUrl}')" class="text-red-500/50 hover:text-red-500 transition-colors p-3 rounded-lg hover:bg-red-500/10">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.editMix = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "mixes", id));
        if (!docSnap.exists()) return;
        const mix = docSnap.data();

        document.getElementById('mix-upload-form').reset();
        document.getElementById('mix-title').value = mix.title;
        document.getElementById('mix-subtitle').value = mix.subtitle;

        const coverPreview = document.getElementById('cover-preview');
        coverPreview.src = mix.imgUrl;
        coverPreview.classList.remove('hidden');

        const audioTxt = document.getElementById('audio-preview-text');
        audioTxt.textContent = 'Keep existing audio (or choose new)';
        audioTxt.classList.remove('hidden');

        document.getElementById('mix-audio').required = false;
        document.getElementById('mix-cover').required = false;

        document.getElementById('upload-modal').querySelector('h3').textContent = 'Edit Mix';
        document.getElementById('mix-submit-btn').textContent = 'Update Mix';

        const form = document.getElementById('mix-upload-form');
        form.dataset.editId = id;
        form.dataset.oldAudioUrl = mix.audioUrl;
        form.dataset.oldImgUrl = mix.imgUrl;

        document.getElementById('upload-modal').classList.remove('hidden');
    } catch (e) {
        await showAlert('Failed to load mix data: ' + e.message, 'error');
    }
};

window.deleteMix = async (id, audioUrl, imgUrl) => {
    if (!await showConfirm('Are you sure you want to delete this mix? This cannot be undone.')) return;
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
        await showAlert('Delete failed: ' + e.message, 'error');
    }
};

// --- Videos Functions ---
const renderVideosList = async () => {
    const list = document.getElementById('videos-list');
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs">No Videos Added Yet</div>`;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const vid = docSnap.data();
        return `
            <div class="admin-card flex items-center gap-6 group">
                <div class="size-20 rounded overflow-hidden shrink-0 border border-primary/20 bg-white/5 relative">
                    <img src="${vid.thumbnail}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/80x80/0d0d0d/d4af35?text=VID'" />
                    <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                        <i class="fa-brands fa-tiktok text-white"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-black uppercase truncate">${vid.title}</h3>
                    <p class="text-xs text-slate-500 truncate">${vid.tiktokUrl}</p>
                </div>
                <a href="${vid.tiktokUrl}" target="_blank" class="text-primary/50 hover:text-primary p-2">
                    <span class="material-symbols-outlined">open_in_new</span>
                </a>
                <button onclick="window.deleteVideo('${docSnap.id}')" class="text-slate-600 hover:text-red-500 p-2">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        `;
    }).join('');
};

window.deleteVideo = async (id) => {
    if (!await showConfirm('Remove this video from the showcase?')) return;
    await deleteDoc(doc(db, "videos", id));
    renderVideosList();
};

// --- Gallery Functions ---
// uploadPhoto logic is moved into the photo-upload-form onsubmit handler below

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
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.editPhoto('${docSnap.id}')" class="bg-primary text-background-dark size-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-sm">edit</span>
                </button>
                <button onclick="window.deletePhoto('${docSnap.id}', '${photo.imgUrl}')" class="bg-red-500 text-white size-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>
        `;
    }).join('');
};

window.editPhoto = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "gallery", id));
        if (!docSnap.exists()) return;
        const photo = docSnap.data();

        document.getElementById('photo-upload-form').reset();
        document.getElementById('photo-title').value = photo.title;
        document.getElementById('photo-subtitle').value = photo.subtitle;

        const preview = document.getElementById('gallery-preview');
        preview.src = photo.imgUrl;
        preview.classList.remove('hidden');

        document.getElementById('photo-file').required = false;

        document.getElementById('gallery-upload-modal').querySelector('h3').textContent = 'Edit Photo';
        document.getElementById('gallery-submit-btn').textContent = 'Update Photo';

        const form = document.getElementById('photo-upload-form');
        form.dataset.editId = id;
        form.dataset.oldImgUrl = photo.imgUrl;

        document.getElementById('gallery-upload-modal').classList.remove('hidden');
    } catch (e) {
        await showAlert('Failed to load photo data: ' + e.message, 'error');
    }
};

window.deletePhoto = async (id, imgUrl) => {
    if (!await showConfirm('Delete this photo from the gallery?')) return;
    try {
        await deleteDoc(doc(db, "gallery", id));
        if (imgUrl) {
            const iRef = ref(storage, imgUrl);
            await deleteObject(iRef).catch(e => console.warn(e));
        }
        renderGalleryList();
    } catch (e) { await showAlert(e.message, 'error'); }
};

// --- Events Functions ---
const renderEventsList = async () => {
    const list = document.getElementById('events-list');
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs"> No Tour Dates Scheduled</div>`;
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
    if (!await showConfirm('Remove this tour date from the schedule?')) return;
    await deleteDoc(doc(db, "events", id));
    renderEventsList();
};

// --- Inquiries Functions ---
const renderInquiriesList = async () => {
    const list = document.getElementById('inquiries-list');
    const q = query(collection(db, "inquiries"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = `<div class="p-10 glass-card text-center text-slate-500 uppercase text-xs"> No Incoming Requests</div>`;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const inq = docSnap.data();
        return `
    < div class="admin-card space-y-4 border-l-4 ${inq.status === 'archived' ? 'border-l-slate-700' : 'border-l-primary'}" >
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
            </div >
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
                                    <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Audio (MP3)</label>
                                    <input id="mix-audio" type="file" accept="audio/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                    <div id="audio-preview-text" class="text-[10px] text-primary italic hidden mt-1">Track selected</div>
                                </div>
                                <div class="space-y-2">
                                    <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Cover Image</label>
                                    <input id="mix-cover" type="file" accept="image/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                    <img id="cover-preview" class="w-20 h-20 mt-2 object-cover rounded hidden border border-primary/30 mx-auto" />
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
                            
                            <div id="upload-loader" class="hidden py-4 space-y-4">
                                <div>
                                    <div class="flex justify-between text-[10px] uppercase tracking-widest text-primary mb-1">
                                        <span id="mix-progress-text">Uploading Audio: 0%</span>
                                    </div>
                                    <div class="w-full bg-white/5 rounded-full h-1.5"><div id="mix-progress-fill" class="bg-primary h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div></div>
                                </div>
                                <div>
                                    <div class="flex justify-between text-[10px] uppercase tracking-widest text-primary mb-1">
                                        <span id="cover-progress-text">Uploading Cover: 0%</span>
                                    </div>
                                    <div class="w-full bg-white/5 rounded-full h-1.5"><div id="cover-progress-fill" class="bg-primary h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div></div>
                                </div>
                            </div>

                            <div class="flex gap-4 pt-4">
                                <button type="button" id="close-modal" class="flex-1 py-4 border border-white/10 rounded-lg uppercase tracking-widest text-xs font-bold hover:bg-white/5 transition-colors">Cancel</button>
                                <button type="submit" id="mix-submit-btn" class="flex-[2] py-4 bg-primary text-background-dark font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all">Publish Mix</button>
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

            document.getElementById('add-mix-btn').onclick = () => {
                const form = document.getElementById('mix-upload-form');
                form.reset();
                form.removeAttribute('data-edit-id');
                form.removeAttribute('data-old-audio-url');
                form.removeAttribute('data-old-img-url');
                document.getElementById('mix-audio').required = true;
                document.getElementById('mix-cover').required = true;
                document.getElementById('upload-modal').querySelector('h3').textContent = 'Upload New Mix';
                document.getElementById('mix-submit-btn').textContent = 'Publish Mix';
                document.getElementById('cover-preview').classList.add('hidden');
                document.getElementById('audio-preview-text').classList.add('hidden');
                document.getElementById('upload-modal').classList.remove('hidden');
            };
            document.getElementById('close-modal').onclick = () => document.getElementById('upload-modal').classList.add('hidden');

            document.getElementById('mix-cover').addEventListener('change', (e) => {
                const file = e.target.files[0];
                const preview = document.getElementById('cover-preview');
                if (file) {
                    preview.src = URL.createObjectURL(file);
                    preview.classList.remove('hidden');
                } else if (!document.getElementById('mix-upload-form').dataset.editId) {
                    preview.classList.add('hidden');
                }
            });

            document.getElementById('mix-audio').addEventListener('change', (e) => {
                const txt = document.getElementById('audio-preview-text');
                if (e.target.files[0]) {
                    txt.textContent = e.target.files[0].name;
                    txt.classList.remove('hidden');
                } else if (!document.getElementById('mix-upload-form').dataset.editId) {
                    txt.classList.add('hidden');
                }
            });

            document.getElementById('mix-upload-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const btn = document.getElementById('mix-submit-btn');
                const editId = form.dataset.editId;

                btn.disabled = true;
                btn.textContent = editId ? 'Updating...' : 'Uploading...';
                document.getElementById('upload-loader').classList.remove('hidden');

                const audio = document.getElementById('mix-audio').files[0];
                const cover = document.getElementById('mix-cover').files[0];
                const title = document.getElementById('mix-title').value;
                const subtitle = document.getElementById('mix-subtitle').value;

                let audioUrl = form.dataset.oldAudioUrl;
                let imgUrl = form.dataset.oldImgUrl;

                try {
                    const uploadPromises = [];
                    if (audio) {
                        const audioRef = ref(storage, `mixes / ${Date.now()} -${audio.name} `);
                        const audioTask = uploadBytesResumable(audioRef, audio);
                        uploadPromises.push(trackUpload(audioTask, 'mix-progress-fill', 'mix-progress-text', 'Uploading Audio').then(url => audioUrl = url));
                    }
                    if (cover) {
                        const coverRef = ref(storage, `covers / ${Date.now()} -${cover.name} `);
                        const coverTask = uploadBytesResumable(coverRef, cover);
                        uploadPromises.push(trackUpload(coverTask, 'cover-progress-fill', 'cover-progress-text', 'Uploading Cover').then(url => imgUrl = url));
                    }

                    if (uploadPromises.length > 0) {
                        await Promise.all(uploadPromises);
                    }

                    if (editId) {
                        await updateDoc(doc(db, "mixes", editId), { title, subtitle, audioUrl, imgUrl });
                        if (audio && form.dataset.oldAudioUrl) deleteObject(ref(storage, form.dataset.oldAudioUrl)).catch(e => console.warn(e));
                        if (cover && form.dataset.oldImgUrl) deleteObject(ref(storage, form.dataset.oldImgUrl)).catch(e => console.warn(e));
                    } else {
                        await addDoc(collection(db, "mixes"), { title, subtitle, audioUrl, imgUrl, createdAt: new Date().toISOString() });
                    }

                    document.getElementById('upload-modal').classList.add('hidden');
                    renderMixesList();
                } catch (err) {
                    console.error("Upload/Update failed:", err);
                    await showAlert("Failed: " + err.message, 'error');
                } finally {
                    document.getElementById('upload-loader').classList.add('hidden');
                    btn.disabled = false;
                    btn.textContent = editId ? 'Update Mix' : 'Publish Mix';
                }
            };

            renderMixesList();
            break;

        case 'videos':
            container.innerHTML = `
                <div class="flex items-center justify-between mb-12">
                    <div>
                        <h2 class="text-4xl font-black gold-gradient-text uppercase">Videos</h2>
                        <p class="text-slate-400 mt-2">TikTok video showcase — links open on TikTok.</p>
                    </div>
                    <button id="add-video-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        Add Video
                    </button>
                </div>

                <div id="video-add-modal" class="hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-lg w-full">
                        <h3 class="text-2xl font-black gold-gradient-text uppercase mb-8">Add TikTok Video</h3>
                        <form id="video-add-form" class="space-y-5">
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">TikTok URL</label>
                                <input id="video-url" type="url" placeholder="https://www.tiktok.com/@djbridash/video/..." class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                                <div id="video-fetch-loader" class="hidden text-[10px] text-primary mt-1 animate-pulse">Fetching video details from TikTok...</div>
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Thumbnail Image URL</label>
                                <input id="video-thumb" type="url" placeholder="https://... or /public/image.jpg" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                                <img id="video-thumb-preview" class="w-full h-40 mt-2 object-cover rounded hidden border border-primary/30" />
                            </div>
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Title</label>
                                <input id="video-title" type="text" placeholder="e.g. Rooftop Set • Dubai" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            </div>
                            <div class="flex gap-4 pt-4">
                                <button type="button" id="close-video-modal" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold">Cancel</button>
                                <button type="submit" class="flex-[2] py-3 bg-primary text-background-dark font-black rounded-lg">Publish Video</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid gap-4" id="videos-list"></div>
`;
            document.getElementById('add-video-btn').onclick = () => {
                document.getElementById('video-add-form').reset();
                document.getElementById('video-thumb-preview').classList.add('hidden');
                document.getElementById('video-add-modal').classList.remove('hidden');
            };
            document.getElementById('close-video-modal').onclick = () => document.getElementById('video-add-modal').classList.add('hidden');

            document.getElementById('video-thumb').addEventListener('input', (e) => {
                const preview = document.getElementById('video-thumb-preview');
                if (e.target.value) {
                    preview.src = e.target.value;
                    preview.classList.remove('hidden');
                } else {
                    preview.classList.add('hidden');
                }
            });

            let tiktokTimeout;
            document.getElementById('video-url').addEventListener('input', (e) => {
                const url = e.target.value;
                if (!url.includes('tiktok.com')) return;

                const loader = document.getElementById('video-fetch-loader');
                loader.classList.remove('hidden');

                clearTimeout(tiktokTimeout);
                tiktokTimeout = setTimeout(async () => {
                    try {
                        const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`);
                        if (response.ok) {
                            const data = await response.json();

                            if (data.thumbnail_url) {
                                const thumbInput = document.getElementById('video-thumb');
                                const preview = document.getElementById('video-thumb-preview');
                                thumbInput.value = data.thumbnail_url;
                                preview.src = data.thumbnail_url;
                                preview.classList.remove('hidden');
                            }
                        }
                    } catch (err) {
                        console.warn('Failed to fetch TikTok oEmbed data:', err);
                    } finally {
                        loader.classList.add('hidden');
                    }
                }, 800);
            });
            document.getElementById('video-add-form').onsubmit = async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                btn.disabled = true;
                btn.textContent = 'Publishing...';

                try {
                    await addDoc(collection(db, "videos"), {
                        tiktokUrl: document.getElementById('video-url').value,
                        thumbnail: document.getElementById('video-thumb').value,
                        title: document.getElementById('video-title').value,
                        createdAt: serverTimestamp()
                    });
                    document.getElementById('video-add-modal').classList.add('hidden');
                    renderVideosList();
                } catch (err) {
                    console.error('Failed to add video:', err);
                    await showAlert('Failed to publish video: ' + err.message, 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            };
            renderVideosList();
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
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Image File</label>
                                <input id="photo-file" type="file" accept="image/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                <img id="gallery-preview" class="w-full h-40 mt-2 object-cover rounded hidden border border-primary/30" />
                            </div>
                            <input id="photo-title" type="text" placeholder="Title" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            <input id="photo-subtitle" type="text" placeholder="Subtitle" class="w-full bg-background-dark/50 border border-primary/10 rounded-lg px-4 py-3 text-white" required />
                            
                            <div id="gallery-loader" class="hidden py-2">
                                <div class="flex justify-between text-[10px] uppercase tracking-widest text-primary mb-1">
                                    <span id="gallery-progress-text">Uploading Photo: 0%</span>
                                </div>
                                <div class="w-full bg-white/5 rounded-full h-1.5"><div id="gallery-progress-fill" class="bg-primary h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div></div>
                            </div>

                            <div class="flex gap-4">
                                <button type="button" id="close-gallery-modal" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold">Cancel</button>
                                <button type="submit" id="gallery-submit-btn" class="flex-[2] py-3 bg-primary text-background-dark font-black rounded-lg">Upload</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6" id="gallery-list"></div>
`;
            document.getElementById('add-photo-btn').onclick = () => {
                const form = document.getElementById('photo-upload-form');
                form.reset();
                form.removeAttribute('data-edit-id');
                form.removeAttribute('data-old-img-url');
                document.getElementById('photo-file').required = true;
                document.getElementById('gallery-upload-modal').querySelector('h3').textContent = 'Add Photo';
                document.getElementById('gallery-submit-btn').textContent = 'Upload';
                document.getElementById('gallery-preview').classList.add('hidden');
                document.getElementById('gallery-upload-modal').classList.remove('hidden');
            };
            document.getElementById('close-gallery-modal').onclick = () => document.getElementById('gallery-upload-modal').classList.add('hidden');

            document.getElementById('photo-file').addEventListener('change', (e) => {
                const file = e.target.files[0];
                const preview = document.getElementById('gallery-preview');
                if (file) {
                    preview.src = URL.createObjectURL(file);
                    preview.classList.remove('hidden');
                } else if (!document.getElementById('photo-upload-form').dataset.editId) {
                    preview.classList.add('hidden');
                }
            });

            document.getElementById('photo-upload-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const btn = document.getElementById('gallery-submit-btn');
                const editId = form.dataset.editId;

                btn.disabled = true;
                btn.textContent = editId ? 'Updating...' : 'Uploading...';
                document.getElementById('gallery-loader').classList.remove('hidden');

                const file = document.getElementById('photo-file').files[0];
                const title = document.getElementById('photo-title').value;
                const subtitle = document.getElementById('photo-subtitle').value;

                let imgUrl = form.dataset.oldImgUrl;

                try {
                    if (file) {
                        const photoRef = ref(storage, `gallery / ${Date.now()} -${file.name} `);
                        const photoTask = uploadBytesResumable(photoRef, file);
                        imgUrl = await trackUpload(photoTask, 'gallery-progress-fill', 'gallery-progress-text', 'Uploading Photo');
                    }

                    if (editId) {
                        await updateDoc(doc(db, "gallery", editId), { title, subtitle, imgUrl });
                        if (file && form.dataset.oldImgUrl) deleteObject(ref(storage, form.dataset.oldImgUrl)).catch(e => console.warn(e));
                    } else {
                        await addDoc(collection(db, "gallery"), { title, subtitle, imgUrl, createdAt: serverTimestamp() });
                    }

                    document.getElementById('gallery-upload-modal').classList.add('hidden');
                    renderGalleryList();
                } catch (err) {
                    console.error("Upload/Update failed:", err);
                    await showAlert("Failed: " + err.message, 'error');
                } finally {
                    document.getElementById('gallery-loader').classList.add('hidden');
                    btn.disabled = false;
                    btn.textContent = editId ? 'Update Photo' : 'Upload';
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
                </div >
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
