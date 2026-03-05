import './style.css'
import { auth, db, storage } from './firebase.js'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, updateDoc, getDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
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
// ─── User-Friendly Error Mapping ───────────────────────────────────────────
const getFriendlyError = (error) => {
    const code = error?.code || error?.message || 'unknown';

    // Auth Errors
    if (code.includes('auth/invalid-email')) return 'Please enter a valid email address.';
    if (code.includes('auth/user-not-found') || code.includes('auth/wrong-password')) return 'Invalid email or password.';
    if (code.includes('auth/email-already-in-use')) return 'This email address is already in use by another account.';
    if (code.includes('auth/weak-password')) return 'Password is too weak. Please use at least 6 characters.';
    if (code.includes('auth/requires-recent-login')) return 'For security, you must verify your password before changing credentials.';
    if (code.includes('auth/network-request-failed')) return 'Network error. Please check your internet connection.';
    if (code.includes('auth/too-many-requests')) return 'Too many attempts. Please try again later.';

    // Firestore/Storage
    if (code.includes('permission-denied')) return 'Access denied. You do not have permission for this action.';
    if (code.includes('not-found')) return 'The requested item was not found.';

    // Strip "Firebase: Error (auth/...)" noise if not mapped
    return code.replace(/Firebase: Error \(auth\/(.+)\)\./, '$1').replace(/-/g, ' ');
};

// ─── Re-authentication Password Prompt ─────────────────────────────────────
const promptPassword = (message = "Please enter your password to continue.") => {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in';
        overlay.innerHTML = `
            <div class="glass-card max-w-sm w-full rounded-2xl border border-primary/20 p-8 shadow-2xl">
                <h3 class="text-xl font-black gold-gradient-text uppercase mb-2">Verify Identity</h3>
                <p class="text-slate-400 text-xs mb-6">${message}</p>
                <form id="reauth-form" class="space-y-4">
                    <input id="reauth-pass" type="password" placeholder="Current Password" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 text-white focus:border-primary outline-none" required />
                    <div class="flex gap-3 pt-2">
                        <button type="button" id="reauth-cancel" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Cancel</button>
                        <button type="submit" class="flex-1 py-3 bg-primary text-background-dark font-black uppercase tracking-widest text-xs rounded-lg hover:opacity-90">Confirm</button>
                    </div>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        const input = overlay.querySelector('#reauth-pass');
        input.focus();

        overlay.querySelector('#reauth-cancel').onclick = () => { overlay.remove(); resolve(null); };
        overlay.querySelector('#reauth-form').onsubmit = (e) => {
            e.preventDefault();
            const pass = input.value;
            overlay.remove();
            resolve(pass);
        };
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
            errorDiv.textContent = getFriendlyError(error);
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Verify Identity';
        }
    });
};

const renderDashboard = (user) => {
    adminApp.innerHTML = `
    <div class="min-h-screen flex flex-col lg:flex-row bg-[#080808]">
        <!-- Mobile Header -->
        <header class="lg:hidden h-16 bg-background-dark border-b border-primary/10 flex items-center justify-between px-6 sticky top-0 z-[60]">
            <div class="flex items-center gap-3">
                <img src="/logo-avatar.jpg" class="h-8 w-auto rounded" />
                <span id="mobile-title" class="font-black text-xs tracking-tighter gold-gradient-text uppercase">Mix Library</span>
            </div>
            <button id="admin-menu-toggle" class="text-primary p-2 active:bg-primary/10 rounded-lg">
                <span class="material-symbols-outlined text-3xl">menu</span>
            </button>
        </header>

        <!-- Sidebar Backdrop (Mobile) -->
        <div id="admin-sidebar-backdrop" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] hidden lg:hidden"></div>

        <!-- Sidebar -->
        <aside id="admin-sidebar" class="w-64 bg-background-dark border-r border-primary/10 flex flex-col p-6 fixed h-full z-[60] -translate-x-full lg:translate-x-0 transition-transform duration-300 ease-in-out">
            <div class="hidden lg:flex items-center gap-4 mb-12">
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
                <button data-tab="hero" class="admin-nav-item">
                    <span class="material-symbols-outlined">wallpaper</span> Hero Editor
                </button>
                <button data-tab="socials" class="admin-nav-item">
                    <span class="material-symbols-outlined">share</span> Social Media
                </button>
                <button data-tab="profile" class="admin-nav-item">
                    <span class="material-symbols-outlined">manage_accounts</span> Admin Profile
                </button>
            </nav>

            <div class="pt-6 border-t border-primary/10">
                <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-4 truncate">Account: ${user.email}</p>
                <button id="admin-logout" class="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-widest">
                    <span class="material-symbols-outlined">logout</span> Sign Out
                </button>
            </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 lg:ml-64 p-6 md:p-12 min-h-screen">
            <!-- Desktop Header -->
            <header class="hidden lg:flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                <h1 id="desktop-title" class="text-2xl font-black uppercase gold-gradient-text tracking-tighter">Mix Library</h1>
                <div class="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                    <span>Admin Panel</span>
                    <span class="text-primary/20">/</span>
                    <span id="breadcrumb-current" class="text-primary">Mixes</span>
                </div>
            </header>

            <div id="tab-content" class="max-w-5xl mx-auto">
                <!-- Content will be injected here -->
            </div>
        </main>
    </div>
    `;

    document.getElementById('admin-logout').addEventListener('click', () => signOut(auth));

    // Mobile Menu Toggle Logic
    const toggleBtn = document.getElementById('admin-menu-toggle');
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('admin-sidebar-backdrop');

    const toggleSidebar = (show) => {
        if (show) {
            sidebar.classList.remove('-translate-x-full');
            backdrop.classList.remove('hidden');
        } else {
            sidebar.classList.add('-translate-x-full');
            backdrop.classList.add('hidden');
        }
    };

    toggleBtn?.addEventListener('click', () => toggleSidebar(sidebar.classList.contains('-translate-x-full')));
    backdrop?.addEventListener('click', () => toggleSidebar(false));

    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderTabContent(item.dataset.tab);
            // Auto close on mobile
            if (window.innerWidth < 1024) toggleSidebar(false);
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
        list.innerHTML = ``;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const mix = docSnap.data();
        return `
            <div class="admin-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group hover:bg-white/5">
                <img src="${mix.imgUrl}" class="h-16 w-16 rounded object-cover border border-primary/20 shadow-lg shrink-0" />
                <div class="flex-1 min-w-0">
                    <h3 class="font-black text-lg uppercase tracking-tight truncate">${mix.title}</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-widest truncate">${mix.subtitle}</p>
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
        await showAlert(getFriendlyError(e), 'error');
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
        await showAlert(getFriendlyError(e), 'error');
    }
};

// --- Videos Functions ---
const renderVideosList = async () => {
    const list = document.getElementById('videos-list');
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = ``;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const vid = docSnap.data();
        return `
            <div class="admin-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group">
                <div class="size-20 rounded overflow-hidden shrink-0 border border-primary/20 bg-white/5 relative">
                    <img src="${vid.thumbnail}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/80x80/0d0d0d/d4af35?text=VID'" />
                    <div class="absolute inset-0 flex items-center justify-center bg-black/40">
                        <i class="fa-brands fa-tiktok text-white"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="font-black uppercase truncate">${vid.title}</h3>
                </div>
                <div class="flex gap-2">
                    <a href="${vid.tiktokUrl}" target="_blank" class="text-primary/50 hover:text-primary p-2">
                        <span class="material-symbols-outlined">open_in_new</span>
                    </a >
                    <button onclick="window.editVideo('${docSnap.id}')" class="text-primary/50 hover:text-primary p-2">
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button onclick="window.deleteVideo('${docSnap.id}')" class="text-slate-600 hover:text-red-500 p-2">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
};

window.editVideo = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "videos", id));
        if (!docSnap.exists()) return;
        const vid = docSnap.data();

        const form = document.getElementById('video-add-form');
        form.reset();
        document.getElementById('video-url').value = vid.tiktokUrl;
        document.getElementById('video-thumb').value = vid.thumbnail;
        document.getElementById('video-title').value = vid.title;

        const preview = document.getElementById('video-thumb-preview');
        preview.src = vid.thumbnail;
        preview.classList.remove('hidden');

        document.getElementById('video-add-modal').querySelector('h3').textContent = 'Edit TikTok Video';
        form.querySelector('button[type="submit"]').textContent = 'Update Video';
        form.dataset.editId = id;

        document.getElementById('video-add-modal').classList.remove('hidden');
    } catch (e) {
        await showAlert(getFriendlyError(e), 'error');
    }
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
        list.innerHTML = ``;
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
        await showAlert(getFriendlyError(e), 'error');
    }
};

window.editHero = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "hero_slides", id));
        if (!docSnap.exists()) return;
        const hero = docSnap.data();

        const form = document.getElementById('hero-upload-form');
        form.reset();
        document.getElementById('hero-file').required = false;
        document.getElementById('hero-preview').src = hero.imgUrl;
        document.getElementById('hero-preview').classList.remove('hidden');

        document.getElementById('hero-upload-modal').querySelector('h3').textContent = 'Edit Hero Slide';
        document.getElementById('hero-submit-btn').textContent = 'Update Slide';
        form.dataset.editId = id;
        form.dataset.oldImgUrl = hero.imgUrl;

        document.getElementById('hero-upload-modal').classList.remove('hidden');
    } catch (e) {
        await showAlert('Failed to load hero data: ' + e.message, 'error');
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
    } catch (e) { await showAlert(getFriendlyError(e), 'error'); }
};

// --- Hero Slides Functions ---
const renderHeroList = async () => {
    const list = document.getElementById('hero-list');
    const q = query(collection(db, "hero_slides"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = ``;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const slide = docSnap.data();
        return `
        <div class="admin-card group relative p-2 ${!slide.active ? 'opacity-50 grayscale' : ''}">
            <img src="${slide.imgUrl}" class="w-full h-32 object-cover rounded-lg mb-4 border border-white/10" />
            <div class="px-2 flex justify-between items-center pb-2">
                <span class="text-xs font-bold uppercase tracking-widest ${slide.active ? 'text-primary' : 'text-slate-500'}">
                    ${slide.active ? 'Active' : 'Hidden'}
                </span>
            </div>
            <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onclick="window.toggleHeroSlide('${docSnap.id}', ${slide.active})" class="bg-background-dark/80 backdrop-blur text-white size-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform" title="Toggle Visibility">
                    <span class="material-symbols-outlined text-sm">${slide.active ? 'visibility_off' : 'visibility'}</span>
                </button>
                <button onclick="window.deleteHeroSlide('${docSnap.id}', '${slide.imgUrl}')" class="bg-red-500 text-white size-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
            </div>
        </div>
        `;
    }).join('');
};

window.toggleHeroSlide = async (id, currentStatus) => {
    try {
        await updateDoc(doc(db, "hero_slides", id), { active: !currentStatus });
        renderHeroList();
    } catch (e) {
        await showAlert(getFriendlyError(e), 'error');
    }
};

window.deleteHeroSlide = async (id, imgUrl) => {
    if (!await showConfirm('Delete this hero slide?')) return;
    try {
        await deleteDoc(doc(db, "hero_slides", id));
        if (imgUrl) {
            const iRef = ref(storage, imgUrl);
            await deleteObject(iRef).catch(e => console.warn(e));
        }
        renderHeroList();
    } catch (e) { await showAlert(e.message, 'error'); }
};

// --- Events Functions ---
const renderEventsList = async () => {
    const list = document.getElementById('events-list');
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        list.innerHTML = ``;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const ev = docSnap.data();
        return `
            <div class="admin-card flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group">
                <div class="bg-primary/10 p-4 rounded-lg text-primary text-center min-w-[80px] shrink-0">
                    <p class="text-xl font-black">${new Date(ev.date).getDate()}</p>
                    <p class="text-[10px] font-bold uppercase">${new Date(ev.date).toLocaleString('default', { month: 'short' })}</p>
                </div>
                <div class="flex-1">
                    <div class="text-primary font-black uppercase text-xs">${ev.date}</div>
                    <div class="font-black uppercase">${ev.title}</div>
                    <div class="text-[10px] text-slate-500 uppercase tracking-widest">${ev.location}</div>
                </div>
                <div class="flex items-center gap-4">
                    <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] uppercase font-black ${ev.tagType === 'soldout' ? 'text-red-500 border-red-500/20' : 'text-primary border-primary/20'} tracking-widest">
                        ${ev.tag}
                    </span>
                    <button onclick="window.editEvent('${docSnap.id}')" class="text-primary/50 hover:text-primary p-2">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onclick="window.deleteEvent('${docSnap.id}')" class="text-slate-600 hover:text-red-500 p-2">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
    `;
    }).join('');
};

window.editEvent = async (id) => {
    try {
        const docSnap = await getDoc(doc(db, "events", id));
        if (!docSnap.exists()) return;
        const ev = docSnap.data();

        const form = document.getElementById('event-form');
        form.reset();
        document.getElementById('event-date').value = ev.date;
        document.getElementById('event-title').value = ev.title;
        document.getElementById('event-location').value = ev.location;
        document.getElementById('event-tag').value = ev.tag;
        document.getElementById('event-tag-type').value = ev.tagType;

        document.getElementById('event-modal').querySelector('h3').textContent = 'Edit Performance';
        form.querySelector('button[type="submit"]').textContent = 'Update Date';
        form.dataset.editId = id;

        document.getElementById('event-modal').classList.remove('hidden');
    } catch (e) {
        await showAlert(getFriendlyError(e), 'error');
    }
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
        list.innerHTML = ``;
        return;
    }

    list.innerHTML = querySnapshot.docs.map(docSnap => {
        const inq = docSnap.data();
        return `
            <div class="admin-card space-y-4">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-black text-lg uppercase">${inq.name}</h4>
                        <div class="flex flex-wrap gap-x-4 gap-y-1">
                            <p class="text-primary text-xs font-bold flex items-center gap-1">
                                <span class="material-symbols-outlined text-[14px]">mail</span>
                                ${inq.email}
                            </p>
                            ${inq.whatsapp ? `
                                <p class="text-emerald-400 text-xs font-bold flex items-center gap-1">
                                    <i class="fa-brands fa-whatsapp text-[14px]"></i>
                                    ${inq.whatsapp}
                                </p>
                            ` : ''}
                        </div>
                    </div>
                    <p class="text-[10px] text-slate-600 uppercase font-bold">${inq.timestamp?.toDate().toLocaleString()}</p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 border-y border-white/5">
                    <div>
                        <p class="text-[8px] text-slate-500 uppercase font-black mb-1">Target Event</p>
                        <p class="text-xs uppercase font-bold truncate">${inq.event || 'GENERAL INQUIRY'}</p>
                    </div>
                    <div>
                        <p class="text-[8px] text-slate-500 uppercase font-black mb-1">Location Profile</p>
                        <p class="text-xs uppercase font-bold truncate">${inq.location || 'UNDISCLOSED'}</p>
                    </div>
                </div>
                <div class="bg-white/5 p-4 rounded-lg">
                    <p class="text-sm text-slate-300 italic">"${inq.message}"</p>
                </div>
                <div class="flex justify-between items-center gap-4">
                    <button onclick="window.deleteInquiry('${docSnap.id}')" class="text-red-500/30 hover:text-red-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                        <span class="material-symbols-outlined text-sm">delete</span> Burn
                    </button>
                    <div class="flex gap-2">
                        <a href="mailto:${inq.email}" class="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">mail</span> Send Email
                        </a>
                        ${inq.whatsapp ? `
                            <a href="https://wa.me/${inq.whatsapp.replace(/\D/g, '')}" target="_blank" class="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                                <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
                            </a>
                        ` : ''}
                    </div>
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

const tabTitles = {
    'mixes': 'Mix Library',
    'videos': 'Videos',
    'gallery': 'Gallery',
    'events': 'Tour Dates',
    'inquiries': 'Inquiries',
    'hero': 'Hero Editor',
    'socials': 'Social Media',
    'profile': 'Admin Profile'
};

const renderTabContent = (tab) => {
    const container = document.getElementById('tab-content');
    const mobileTitle = document.getElementById('mobile-title');
    const desktopTitle = document.getElementById('desktop-title');
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');

    const title = tabTitles[tab] || 'Dashboard';
    if (mobileTitle) mobileTitle.textContent = title;
    if (desktopTitle) desktopTitle.textContent = title;
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = title;

    switch (tab) {
        case 'mixes':
            container.innerHTML = `
                <div class="mb-8 flex justify-end">
                    <button id="add-mix-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        <span class="material-symbols-outlined">add_circle</span> New Mix
                    </button>
                </div>

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
                    await showAlert(getFriendlyError(err), 'error');
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
                <div class="mb-8 flex justify-end">
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
                const form = e.target;
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                const editId = form.dataset.editId;

                btn.disabled = true;
                btn.textContent = editId ? 'Updating...' : 'Publishing...';

                try {
                    const videoData = {
                        tiktokUrl: document.getElementById('video-url').value,
                        thumbnail: document.getElementById('video-thumb').value,
                        title: document.getElementById('video-title').value,
                    };

                    if (editId) {
                        await updateDoc(doc(db, "videos", editId), videoData);
                    } else {
                        await addDoc(collection(db, "videos"), {
                            ...videoData,
                            createdAt: serverTimestamp()
                        });
                    }
                    document.getElementById('video-add-modal').classList.add('hidden');
                    renderVideosList();
                } catch (err) {
                    console.error('Failed to add/update video:', err);
                    await showAlert(getFriendlyError(err), 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            };
            renderVideosList();
            break;

        case 'gallery':
            container.innerHTML = `
                <div class="mb-8 flex justify-end">
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
                    await showAlert(getFriendlyError(err), 'error');
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
                <div class="mb-8 flex justify-end">
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
            document.getElementById('add-event-btn').onclick = () => {
                const form = document.getElementById('event-form');
                form.reset();
                form.removeAttribute('data-edit-id');
                document.getElementById('event-modal').querySelector('h3').textContent = 'Schedule Performance';
                form.querySelector('button[type="submit"]').textContent = 'Confirm Date';
                document.getElementById('event-modal').classList.remove('hidden');
            };
            document.getElementById('close-event-modal').onclick = () => document.getElementById('event-modal').classList.add('hidden');
            document.getElementById('event-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const btn = form.querySelector('button[type="submit"]');
                const originalText = btn.textContent;
                const editId = form.dataset.editId;

                btn.disabled = true;
                btn.textContent = editId ? 'Updating...' : 'Saving...';

                try {
                    const eventData = {
                        date: document.getElementById('event-date').value,
                        title: document.getElementById('event-title').value,
                        location: document.getElementById('event-location').value,
                        tag: document.getElementById('event-tag').value,
                        tagType: document.getElementById('event-tag-type').value,
                    };

                    if (editId) {
                        await updateDoc(doc(db, "events", editId), eventData);
                    } else {
                        await addDoc(collection(db, "events"), {
                            ...eventData,
                            createdAt: serverTimestamp()
                        });
                    }
                    document.getElementById('event-modal').classList.add('hidden');
                    renderEventsList();
                } catch (err) {
                    console.error('Failed to save event:', err);
                    await showAlert(getFriendlyError(err), 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            };
            renderEventsList();
            break;

        case 'hero':
            container.innerHTML = `
                <div class="mb-8 flex justify-end">
                    <button id="add-hero-btn" class="bg-primary text-background-dark font-black px-6 py-3 rounded-lg uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,53,0.3)]">
                        Add Slide
                    </button>
                </div>

                <div id="hero-upload-modal" class="hidden fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6">
                    <div class="glass-card p-10 rounded-2xl border-2 border-primary/20 max-w-lg w-full">
                        <h3 class="text-2xl font-black gold-gradient-text uppercase mb-8">Add Hero Slide</h3>
                        <form id="hero-upload-form" class="space-y-6">
                            <div class="space-y-2">
                                <label class="text-[10px] uppercase tracking-widest font-black text-slate-500">Slide Image (Desktop/Landscape ideal)</label>
                                <input id="hero-file" type="file" accept="image/*" class="w-full bg-background-dark/50 border border-primary/10 rounded px-3 py-2 text-xs" required />
                                <img id="hero-preview" class="w-full h-40 mt-2 object-cover rounded hidden border border-primary/30" />
                            </div>
                            
                            <div id="hero-loader" class="hidden">
                                <div class="flex justify-between text-xs text-primary mb-1">
                                    <span>Uploading...</span>
                                    <span id="hero-progress-text">0%</span>
                                </div>
                                <div class="w-full bg-white/5 rounded-full h-1.5"><div id="hero-progress-fill" class="bg-primary h-1.5 rounded-full transition-all duration-300" style="width: 0%"></div></div>
                            </div>

                            <div class="flex gap-4">
                                <button type="button" id="close-hero-modal" class="flex-1 py-3 border border-white/10 rounded-lg text-xs font-bold">Cancel</button>
                                <button type="submit" id="hero-submit-btn" class="flex-[2] py-3 bg-primary text-background-dark font-black rounded-lg">Upload Slide</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="hero-list"></div>
            `;

            document.getElementById('add-hero-btn').onclick = () => {
                const form = document.getElementById('hero-upload-form');
                form.reset();
                form.removeAttribute('data-edit-id');
                form.removeAttribute('data-old-img-url');
                document.getElementById('hero-file').required = true;
                document.getElementById('hero-upload-modal').querySelector('h3').textContent = 'Add Hero Slide';
                document.getElementById('hero-submit-btn').textContent = 'Upload Slide';
                document.getElementById('hero-preview').classList.add('hidden');
                document.getElementById('hero-upload-modal').classList.remove('hidden');
            };
            document.getElementById('close-hero-modal').onclick = () => document.getElementById('hero-upload-modal').classList.add('hidden');

            document.getElementById('hero-file').addEventListener('change', (e) => {
                const file = e.target.files[0];
                const preview = document.getElementById('hero-preview');
                if (file) {
                    preview.src = URL.createObjectURL(file);
                    preview.classList.remove('hidden');
                } else if (!document.getElementById('hero-upload-form').dataset.editId) {
                    preview.classList.add('hidden');
                }
            });

            document.getElementById('hero-upload-form').onsubmit = async (e) => {
                e.preventDefault();
                const form = e.target;
                const btn = document.getElementById('hero-submit-btn');
                const editId = form.dataset.editId;

                btn.disabled = true;
                btn.textContent = editId ? 'Updating...' : 'Uploading...';
                document.getElementById('hero-loader').classList.remove('hidden');

                const file = document.getElementById('hero-file').files[0];
                let imgUrl = form.dataset.oldImgUrl;

                try {
                    if (file) {
                        const photoRef = ref(storage, `hero/${Date.now()}-${file.name}`);
                        const photoTask = uploadBytesResumable(photoRef, file);
                        imgUrl = await trackUpload(photoTask, 'hero-progress-fill', 'hero-progress-text', 'Uploading Slide');
                    }

                    if (editId) {
                        await updateDoc(doc(db, "hero_slides", editId), { imgUrl });
                        if (file && form.dataset.oldImgUrl) deleteObject(ref(storage, form.dataset.oldImgUrl)).catch(e => console.warn(e));
                    } else {
                        await addDoc(collection(db, "hero_slides"), {
                            imgUrl,
                            active: true,
                            createdAt: serverTimestamp()
                        });
                    }

                    document.getElementById('hero-upload-modal').classList.add('hidden');
                    renderHeroList();
                } catch (err) {
                    console.error("Upload/Update failed:", err);
                    await showAlert(getFriendlyError(err), 'error');
                } finally {
                    document.getElementById('hero-loader').classList.add('hidden');
                    btn.disabled = false;
                    btn.textContent = editId ? 'Update Slide' : 'Upload Slide';
                }
            };
            renderHeroList();
            break;

        case 'profile':
            container.innerHTML = `
                <div class="mb-8"></div>
                
                <div class="glass-card p-10 rounded-2xl border border-primary/10 max-w-xl">
                    <form id="profile-update-form" class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-xs uppercase tracking-widest font-black text-slate-500">Email Address</label>
                            <input id="profile-email" type="email" value="${auth.currentUser?.email || ''}" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" required />
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs uppercase tracking-widest font-black text-slate-500">New Password (leave blank to keep current)</label>
                            <input id="profile-password" type="password" placeholder="••••••••" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" />
                        </div>
                        <button type="submit" id="profile-submit" class="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-[0.2em] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all">
                            Update Credentials
                        </button>
                    </form>
                </div>
            `;

            document.getElementById('profile-update-form').onsubmit = async (e) => {
                e.preventDefault();
                const btn = document.getElementById('profile-submit');
                const emailInput = document.getElementById('profile-email');
                const passwordInput = document.getElementById('profile-password');

                const newEmail = emailInput.value;
                const newPassword = passwordInput.value;

                const attemptUpdate = async () => {
                    const { updateEmail, updatePassword } = await import('firebase/auth');
                    if (newEmail !== auth.currentUser.email) {
                        await updateEmail(auth.currentUser, newEmail);
                    }
                    if (newPassword) {
                        await updatePassword(auth.currentUser, newPassword);
                        passwordInput.value = '';
                    }
                };

                btn.disabled = true;
                btn.textContent = 'Updating...';

                try {
                    await attemptUpdate();
                    await showAlert('Credentials updated successfully!', 'success');
                } catch (err) {
                    console.error("Update failed:", err);

                    if (err.code === 'auth/requires-recent-login') {
                        const currentPassword = await promptPassword();
                        if (currentPassword) {
                            try {
                                const { EmailAuthProvider, reauthenticateWithCredential } = await import('firebase/auth');
                                const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
                                await reauthenticateWithCredential(auth.currentUser, credential);

                                // Retry update after re-auth
                                await attemptUpdate();
                                await showAlert('Credentials updated successfully after verification!', 'success');
                            } catch (reAuthErr) {
                                await showAlert(getFriendlyError(reAuthErr), 'error');
                            }
                        }
                    } else {
                        await showAlert(getFriendlyError(err), 'error');
                    }
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Update Credentials';
                    document.querySelector('.pt-6.border-t p').textContent = `Account: ${auth.currentUser.email}`;
                }
            };
            break;

        case 'inquiries':
            container.innerHTML = `
                <div class="mb-8"></div>
                <div class="grid gap-6" id="inquiries-list"></div>
            `;
            renderInquiriesList();
            break;

        case 'socials':
            container.innerHTML = `
                <div class="glass-card p-8 rounded-xl border border-primary/20 max-w-2xl mx-auto mt-10">
                    <h3 class="text-xl font-bold mb-6 gold-gradient-text uppercase">Manage Social Links</h3>
                    <form id="social-links-form" class="space-y-6">
                        <div class="space-y-2">
                            <label class="text-xs font-black uppercase tracking-widest text-slate-500">Instagram URL</label>
                            <input type="url" id="social-instagram" class="admin-input" placeholder="https://instagram.com/..." required>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-black uppercase tracking-widest text-slate-500">TikTok URL</label>
                            <input type="url" id="social-tiktok" class="admin-input" placeholder="https://tiktok.com/@..." required>
                        </div>
                        <div class="space-y-2">
                            <label class="text-xs font-black uppercase tracking-widest text-slate-500">Soundcloud URL</label>
                            <input type="url" id="social-soundcloud" class="admin-input" placeholder="https://soundcloud.com/..." required>
                        </div>
                        <button type="submit" class="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-widest rounded-lg hover:shadow-[0_0_20px_rgba(212,175,53,0.3)] transition-all">
                            Save Social Links
                        </button>
                    </form>
                </div>
            `;

            // Fetch current socials
            const fetchSocials = async () => {
                const docRef = doc(db, "settings", "socials");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    document.getElementById('social-instagram').value = data.instagram || '';
                    document.getElementById('social-tiktok').value = data.tiktok || '';
                    document.getElementById('social-soundcloud').value = data.soundcloud || '';
                }
            };
            fetchSocials();

            document.getElementById('social-links-form').onsubmit = async (e) => {
                e.preventDefault();
                const btn = e.target.querySelector('button');
                btn.disabled = true;
                btn.textContent = 'Saving...';

                try {
                    const data = {
                        instagram: document.getElementById('social-instagram').value,
                        tiktok: document.getElementById('social-tiktok').value,
                        soundcloud: document.getElementById('social-soundcloud').value,
                        updatedAt: serverTimestamp()
                    };
                    await setDoc(doc(db, "settings", "socials"), data);
                    await showAlert('Social links updated successfully!', 'success');
                } catch (err) {
                    console.error(err);
                    await showAlert(getFriendlyError(err), 'error');
                } finally {
                    btn.disabled = false;
                    btn.textContent = 'Save Social Links';
                }
            };
            break;
    }
};

// Expose functions to window for HTML onclick attributes
window.editMix = editMix;
window.deleteMix = deleteMix;
window.deleteVideo = deleteVideo;
window.editPhoto = editPhoto;
window.deletePhoto = deletePhoto;
window.toggleHeroSlide = toggleHeroSlide;
window.deleteHeroSlide = deleteHeroSlide;
window.deleteEvent = deleteEvent;
window.deleteInquiry = deleteInquiry;
window.showAlert = showAlert;
window.showConfirm = showConfirm;


onAuthStateChanged(auth, (user) => {
    if (user) {
        renderDashboard(user);
    } else {
        renderLogin();
    }
});
