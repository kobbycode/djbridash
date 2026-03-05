import './style.css'
import { db } from './firebase.js'
import { collection, getDocs, query, orderBy, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore'
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

document.querySelector('#app').innerHTML = `
<!-- Navigation -->
<nav class="fixed top-0 w-full z-50 bg-background-dark/80 backdrop-blur-md border-b border-primary/10">
<div class="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
<a href="#hero" class="flex items-center gap-4 group">
<img src="/logo-avatar.jpg" alt="DJ BRIDASH Logo" class="h-12 w-auto rounded shadow-lg border border-primary/20 group-hover:border-primary/50 transition-all">
<span class="text-2xl font-black tracking-widest gold-gradient-text uppercase hidden sm:block">DJ BRIDASH</span>
</a>
<div class="hidden md:flex items-center gap-10">
<a class="nav-link text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors" href="#music">Music</a>
<a class="nav-link text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors" href="#videos">Videos</a>
<a class="nav-link text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors" href="#gallery">Gallery</a>
<a class="nav-link text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors" href="#events">Events</a>
<a class="nav-link text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors" href="#about">Bio</a>
<a class="nav-link px-6 py-2.5 bg-primary text-background-dark text-sm font-bold rounded hover:bg-primary/90 transition-all uppercase tracking-widest" href="#contact">Book Now</a>
</div>
<button class="md:hidden text-primary" id="mobile-menu-btn">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</nav>

<!-- Mobile Menu Drawer -->
<div id="mobile-menu-backdrop" class="fixed inset-0 bg-background-dark/95 backdrop-blur-xl z-[60]"></div>
<div id="mobile-menu" class="fixed top-0 right-0 w-[85%] max-w-sm h-screen bg-background-dark z-[70] border-l border-primary/20 flex flex-col pt-24 px-8">
<button id="close-mobile-menu" class="absolute top-6 right-6 size-12 rounded-full border border-primary/20 flex items-center justify-center text-primary active:bg-primary/10">
<span class="material-symbols-outlined text-3xl">close</span>
</button>
<div class="flex flex-col gap-2">
<a class="nav-link mobile-nav-link text-white" href="#music">Music</a>
<a class="nav-link mobile-nav-link text-white" href="#videos">Videos</a>
<a class="nav-link mobile-nav-link text-white" href="#gallery">Gallery</a>
<a class="nav-link mobile-nav-link text-white" href="#events">Events</a>
<a class="nav-link mobile-nav-link text-white" href="#about">Bio</a>
<a class="nav-link mobile-nav-link text-primary" href="#contact">Book Now</a>
</div>
<div class="mt-auto pb-12 text-center">
<div class="flex gap-6 justify-center mb-8">
<a id="nav-instagram" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://instagram.com/djbridash" target="_blank">
<i class="fa-brands fa-instagram text-lg"></i>
</a>
<a id="nav-tiktok" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://tiktok.com/@djbridash" target="_blank">
<i class="fa-brands fa-tiktok text-lg"></i>
</a>
<a id="nav-soundcloud" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://soundcloud.com/djbridash" target="_blank">
<i class="fa-brands fa-soundcloud text-lg"></i>
</a>
</div>
<a href="#hero" class="inline-block group">
<img src="/logo-avatar.jpg" alt="DJ BRIDASH Logo" class="h-16 w-auto mx-auto rounded shadow-lg border border-primary/20 mb-6 font-exo group-hover:border-primary/50 transition-all">
<p class="text-[10px] uppercase tracking-[0.4em] text-slate-600 italic group-hover:text-primary/70 transition-colors">Global Sound. Elite Vibes.</p>
</a>
</div>
</div>

<!-- Hero Section -->
<section class="relative h-screen flex items-center justify-center overflow-hidden" id="hero">
<div class="absolute inset-0 z-0" id="hero-slider">
<div class="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/40 to-background-dark z-10"></div>
<div class="absolute inset-0 bg-emerald-dark/15 z-10"></div>
<!-- Slides will be injected here -->
<div class="hero-slide active">
    <img class="w-full h-full object-cover" data-alt="Official portrait of DJ BRIDASH" src="/hero-portrait.jpg"/>
</div>
</div>
<div class="relative z-20 text-center px-6 max-w-4xl translate-y-20 md:translate-y-32">
<h2 class="text-primary text-sm md:text-lg font-bold tracking-[0.4em] uppercase mb-4 opacity-90 font-exo">International Standards</h2>
<h1 class="text-4xl sm:text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter gold-gradient-text font-exo uppercase">
    THE PLATINUM FINGERS
</h1>
<div class="flex flex-col sm:flex-row items-center justify-center gap-6 w-full">
<a href="#contact" class="nav-link w-full sm:w-auto min-w-[200px] md:min-w-[220px] px-6 py-3 md:px-8 md:py-4 bg-primary text-background-dark font-bold text-base uppercase tracking-widest rounded transition-transform hover:scale-105 inline-block text-center">
                    Book DJ Bridash
                </a>
<a href="#music" class="nav-link w-full sm:w-auto min-w-[200px] md:min-w-[220px] px-6 py-3 md:px-8 md:py-4 glass-card text-white font-bold text-base uppercase tracking-widest rounded border border-white/20 hover:border-primary transition-all inline-block text-center">
                    Listen to Mixes
                </a>
</div>
</div>
<div class="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
<span class="material-symbols-outlined text-primary/50 text-4xl">keyboard_double_arrow_down</span>
</div>
</section>

<!-- Interactive Music Player -->
<section class="py-24 px-6 lg:px-12 bg-background-dark" id="music">
<div class="max-w-7xl mx-auto">
<div class="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
<div>
<h3 class="text-primary font-bold uppercase tracking-[0.3em] mb-2">Sonic Portfolio</h3>
<h2 class="text-4xl md:text-5xl font-bold">Latest Mixes</h2>
</div>
<div class="h-[1px] flex-1 bg-gradient-to-r from-primary/40 to-transparent mx-8 hidden md:block mb-4"></div>
</div>
<div class="grid lg:grid-cols-3 gap-12">
<!-- Main Player Card -->
<div class="lg:col-span-2 glass-card rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-primary">
<div class="relative group shrink-0">
<img id="main-track-img" class="size-48 md:size-64 object-cover rounded shadow-2xl" data-alt="Abstract gold and black vinyl record cover art" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0dzzoTvFtYqX6XEa8b2I-dIxoVYEOGE6nWmJGK5gPer1IfOxXlFy9PJU-JyGrp8hM0ZL0T67W69p1Jecrvgvtw70QlGKqCP3LzjaYHv5fEHf3Opo_9Wq02aPQ-K-UtkI5QlwGCJ1NZ7D6kdBNMv-i5ni9PT9anGzLB9-z6Bk-XRbUuRT6RE29I7QA5lE_Fy3-v31RA-aefORP94fXYzBeSnID-UYcezLfpyhi5-lZI1bCXIWFVmBqV_T0PrDAH9ikuqDIpqLql6tX"/>
<div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" id="main-track-overlay">
<span class="material-symbols-outlined text-white text-6xl">play_circle</span>
</div>
</div>
<div class="flex-1 w-full">
<span class="text-primary text-xs font-black uppercase tracking-widest">Now Premiering</span>
<h4 id="main-track-title" class="text-3xl font-bold mt-2 mb-1">Afro House Experience</h4>
<p id="main-track-subtitle" class="text-slate-400 mb-8 font-light italic">Live from Mykonos Summer Residency</p>
<!-- Visualizer Simulator -->
<div id="waveform-container" class="flex items-end h-16 gap-1 mb-6">
<div class="waveform-bar h-[40%]"></div>
<div class="waveform-bar h-[60%]" style="animation-delay: 0.1s"></div>
<div class="waveform-bar h-[90%]" style="animation-delay: 0.2s"></div>
<div class="waveform-bar h-[70%]" style="animation-delay: 0.3s"></div>
<div class="waveform-bar h-[45%]"></div>
<div class="waveform-bar h-[85%]" style="animation-delay: 0.5s"></div>
<div class="waveform-bar h-[100%]" style="animation-delay: 0.6s"></div>
<div class="waveform-bar h-[60%]" style="animation-delay: 0.7s"></div>
<div class="waveform-bar h-[30%]" style="animation-delay: 0.8s"></div>
<div class="waveform-bar h-[80%]" style="animation-delay: 0.9s"></div>
<div class="waveform-bar h-[95%]" style="animation-delay: 1.0s"></div>
<div class="waveform-bar h-[55%]" style="animation-delay: 1.1s"></div>
<div class="waveform-bar h-[40%]" style="animation-delay: 1.2s"></div>
<div class="waveform-bar h-[75%]" style="animation-delay: 1.3s"></div>
<div class="waveform-bar h-[90%]" style="animation-delay: 1.4s"></div>
</div>
<div class="flex items-center gap-8">
<button id="main-prev-btn" class="text-slate-400 hover:text-primary"><span class="material-symbols-outlined text-3xl">skip_previous</span></button>
<button id="main-play-btn" class="size-16 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-[0_0_20px_rgba(212,175,53,0.4)] transition-transform hover:scale-110">
<span class="material-symbols-outlined text-4xl fill-1">play_arrow</span>
</button>
<button id="main-next-btn" class="text-slate-400 hover:text-primary"><span class="material-symbols-outlined text-3xl">skip_next</span></button>
<div id="main-track-time" class="ml-auto text-primary text-sm font-mono font-bold tracking-tighter">00:00 / 00:00</div>
</div>
<audio id="global-audio" src="" class="hidden"></audio>
<input type="file" id="audio-picker" class="hidden" accept="audio/*">
</div>
</div>
<!-- Playlist -->
<div class="space-y-4" id="playlist-container">
    <div class="glass-card p-4 rounded-lg flex items-center justify-center border-r-4 border-r-primary/20 animate-pulse">
        <p class="text-[10px] uppercase tracking-widest text-primary/50">Synchronizing with Cloud Vault...</p>
    </div>
</div>
</div>
</div>
</section>

<!-- Videos Section -->
<section class="py-20 md:py-32 px-6 lg:px-12 bg-[#080808] border-y border-primary/5" id="videos">
<div class="max-w-7xl mx-auto">
<div class="mb-16 text-center">
<h2 class="text-primary text-sm font-bold tracking-[0.4em] uppercase mb-4">The Visual Experience</h2>
<h3 class="text-3xl md:text-6xl font-black gold-gradient-text uppercase tracking-tighter">Videos</h3>
</div>
<div class="grid md:grid-cols-2 gap-8" id="videos-container">
    <div class="animate-pulse glass-card p-8 md:p-12 rounded-xl border border-primary/20 text-center col-span-full">
        <p class="text-primary/30 font-bold uppercase tracking-widest text-xs">Cuing Visual Content...</p>
    </div>
</div>
</div>
</section>

<!-- Gallery Section -->
<section class="py-20 md:py-32 px-6 lg:px-12 bg-background-dark" id="gallery">
<div class="max-w-7xl mx-auto text-center">
<div class="mb-16">
<h2 class="text-primary text-sm font-bold tracking-[0.4em] uppercase mb-4">Elite Moments</h2>
<h3 class="text-3xl md:text-6xl font-black gold-gradient-text uppercase tracking-tighter">Gallery</h3>
</div>
<div id="gallery-container" class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 min-h-[400px]">
    <div class="animate-pulse flex items-center justify-center p-12 md:p-20 glass-card rounded-xl w-full">
        <p class="text-primary/30 font-bold uppercase tracking-widest text-xs">Developing High-Res Assets...</p>
    </div>
</div>
</div>
</section>

<!-- About Section -->
<section class="py-20 md:py-32 px-6 lg:px-12 bg-background-dark relative overflow-hidden" id="about">
<div class="absolute top-0 right-0 size-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
<div class="relative">
<div class="absolute -inset-4 border border-primary/20 rounded-lg -z-10 translate-x-4 translate-y-4"></div>
<div class="relative rounded-lg overflow-hidden h-[400px] md:h-[700px] border-2 border-primary/30">
<img class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" data-alt="Portrait of a sophisticated DJ in luxury attire" src="/about.jpg"/>
<div class="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
<div class="absolute bottom-8 left-8 right-8 p-6 glass-card border-primary/40">
<p class="text-primary font-bold uppercase tracking-widest text-sm mb-2">Based in Accra, Ghana</p>
<h4 class="text-2xl font-bold">13+ Years of Sonic Mastery</h4>
</div>
</div>
</div>
<div>
<h3 class="text-primary font-bold uppercase tracking-[0.3em] mb-4">The Maestro</h3>
<h2 class="text-5xl md:text-7xl font-black mb-10 gold-gradient-text">DJ BRIDASH</h2>
<div class="space-y-6 text-lg text-slate-300 font-light leading-relaxed">
<p><span class="text-primary font-bold">Bright Ewusi</span>, professionally known as <span class="text-white font-bold tracking-widest">DJ BRIDASH</span>, is a seasoned Ghanaian radio DJ, producer, and music promoter with over <span class="text-primary font-black italic">thirteen (13) years</span> of mastery in broadcasting and music entertainment.</p>
<p>His consistency and creative energy have earned him a respected position within the <span class="text-white font-semibold">Multimedia Group</span>, where he currently contributes to major platforms including <span class="italic">Hitz 103.9 FM, Joy FM, Joy Prime TV, and Adom TV.</span></p>
<p>Recognized for his dynamic on-air personality — energetic, witty, smooth, and bold — DJ BRIDASH seamlessly blends genres from <span class="text-primary/90 font-medium">Afrobeats and Highlife to Hip-life and Reggae</span>. Throughout his career, he has shared stages with icons like <span class="text-slate-200">Prince Bright (Buk Bak), E.L, Samini, Kwabena Kwabena, and Joe Mettle.</span></p>
<p class="text-sm border-l-2 border-primary/30 pl-6 italic text-slate-400">"Serving as a cultural ambassador, DJ Bridash projects local sounds and talents to international audiences, bridging traditional and modern music experiences across the globe."</p>
<div class="py-8 border-y border-primary/10 flex flex-wrap gap-6 md:gap-12 justify-around sm:justify-start">
<div>
<p class="text-4xl font-bold text-primary mb-1">13+</p>
<p class="text-xs uppercase tracking-widest font-semibold">Years Exp.</p>
</div>
<div>
<p class="text-4xl font-bold text-primary mb-1">4+</p>
<p class="text-xs uppercase tracking-widest font-semibold">Major Platforms</p>
</div>
<div>
<p class="text-4xl font-bold text-primary mb-1">GH</p>
<p class="text-xs uppercase tracking-widest font-semibold">Ambassador</p>
</div>
</div>
<div class="pt-6">
<img class="h-16 opacity-50" data-alt="Stylized signature of DJ Bridash in gold" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAylZ3PGyxCq9w4RTEmiGbrsnL-WjLxJMkvm-OD21rCLojU3eBrXx5OfXBC0NxUEbdQecW2BbMCI4_fg4y_jGos0VyY7tiYokfa9WFY7a-44j_3qX3Uufyb8BD3ON66Lo2plXZ4PKPMZ1r7Tnuh_5TgNoT01I2bZRwA2EVNV8eh5JYYh0Z6goi2-ZD2EcuCNFMuzxegPR265-tQa5U2rZ6v5ZVsroJY0Auc4-Ralrpsh3Vl4PNoaQNwZZcFLOLA1pELQzIqqT-gy6gT"/>
</div>
</div>
</div>
</div>
</section>

<!-- Events & Booking -->
<section class="py-20 md:py-32 px-6 lg:px-12 bg-background-dark relative" id="events">
<div class="max-w-7xl mx-auto">
<div class="grid lg:grid-cols-2 gap-20">
<div>
<h3 class="text-primary font-bold uppercase tracking-[0.3em] mb-4">World Tour</h3>
<h2 class="text-3xl md:text-5xl font-bold mb-8 md:mb-12">Upcoming Residencies</h2>
<div class="space-y-6" id="events-container">
    <div class="animate-pulse glass-card p-6 rounded-xl border border-primary/20">
        <p class="text-[10px] uppercase tracking-widest text-primary/40">Fetching Global Schedule...</p>
    </div>
</div>
</div>
<div class="glass-card p-6 md:p-10 rounded-2xl border-2 border-primary/20 relative" id="contact">
<div class="absolute -top-6 left-10 bg-primary px-6 py-2 rounded text-background-dark font-black uppercase text-sm shadow-[0_0_15px_rgba(212,175,53,0.3)]">
                        Inquiry Portal
                    </div>
<h3 class="text-3xl font-bold mb-8">Reserve the Sound</h3>
<form id="inquiry-form" class="space-y-6">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Full Name</label>
<input id="inquiry-name" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Johnathan Sterling" type="text" required/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Email Address</label>
<input id="inquiry-email" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="john@sterling.com" type="email" required/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">WhatsApp Number</label>
<input id="inquiry-whatsapp" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="" type="tel"/>
</div>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Event Type</label>
<select id="inquiry-event" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white appearance-none">
    <option disabled selected>Loading available experiences...</option>
</select>
</div>
<div id="other-event-container" class="space-y-2 hidden animate-fade-in">
    <label class="text-xs uppercase tracking-widest font-black text-slate-500">Custom Event Type</label>
    <input id="inquiry-event-other" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Describe your elite vision..."/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Date & Location</label>
<input id="inquiry-location" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Dubai - Dec 2024" type="text"/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Message</label>
<textarea id="inquiry-message" class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Tell us about your vision..." rows="4"></textarea>
</div>
<button id="inquiry-submit" class="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-[0.2em] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
<span class="btn-text">Submit Inquiry</span>
</button>
</form>
<!-- Success Message Overlay (Hidden by default) -->
<div id="inquiry-success" class="hidden absolute inset-0 bg-background-dark/95 z-30 flex flex-col items-center justify-center text-center p-8 rounded-2xl animate-fade-in">
<span class="material-symbols-outlined text-primary text-7xl mb-4">check_circle</span>
<h4 class="text-2xl font-bold text-white mb-2">Inquiry Received</h4>
<p class="text-slate-400 max-w-xs">Your request for an elite sonic experience has been logged. Our management team will touch base within 24 hours.</p>
<button onclick="document.getElementById('inquiry-success').classList.add('hidden')" class="mt-8 text-primary text-sm font-bold uppercase tracking-widest border-b border-primary/30 hover:border-primary transition-all">New Inquiry</button>
</div>
</div>
</div>
</div>
</section>

<!-- Footer -->
<footer class="bg-[#050505] py-12 md:py-20 px-6 lg:px-12 border-t border-primary/10">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
<div class="text-center md:text-left">
<a href="#hero" class="flex items-center gap-4 mb-6 justify-center md:justify-start group">
<img src="/logo-avatar.jpg" alt="DJ BRIDASH Logo" class="h-12 w-auto rounded shadow-lg border border-primary/20 group-hover:border-primary/50 transition-all">
<span class="text-2xl md:text-3xl font-black tracking-widest gold-gradient-text uppercase">DJ BRIDASH</span>
</a>
<p class="text-slate-500 max-w-sm mb-8">The undisputed leader in luxury sonic atmospheres. Creating memories that transcend the ordinary.</p>
<div class="flex gap-6 justify-center md:justify-start">
<a id="footer-instagram" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://instagram.com/djbridash" target="_blank">
<i class="fa-brands fa-instagram text-lg"></i>
</a>
<a id="footer-tiktok" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://tiktok.com/@djbridash" target="_blank">
<i class="fa-brands fa-tiktok text-lg"></i>
</a>
<a id="footer-soundcloud" class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://soundcloud.com/djbridash" target="_blank">
<i class="fa-brands fa-soundcloud text-lg"></i>
</a>
</div>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-16">
<div>
<p class="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Management</p>
<ul class="space-y-4 text-sm text-slate-400">
<li><a class="hover:text-white transition-colors" href="#">Press Kit</a></li>
<li><a class="hover:text-white transition-colors" href="#">Tour Schedule</a></li>
<li><a class="hover:text-white transition-colors" href="#">Tech Rider</a></li>
</ul>
</div>
<div>
<p class="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Legal</p>
<ul class="space-y-4 text-sm text-slate-400">
<li><a class="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
<li><a class="hover:text-white transition-colors" href="#">Terms of Use</a></li>
<li><a class="hover:text-white transition-colors" href="#">Cookie Policy</a></li>
</ul>
</div>
<div class="col-span-2 sm:col-span-1">
<p class="font-bold uppercase tracking-widest text-xs mb-6 text-primary">Global HQ</p>
<p class="text-sm text-slate-500 italic">DIFC Innovation One, Level 15<br/>Dubai, United Arab Emirates</p>
</div>
</div>
</div>
<div class="max-w-7xl mx-auto pt-16 mt-16 border-t border-white/5 text-center">
<p class="text-[10px] uppercase tracking-[0.4em] text-slate-600">© ${new Date().getFullYear()} DJ BRIDASH ENTERTAINMENT GROUP. ALL RIGHTS RESERVED.</p>
</div>
</footer>
`

// Mobile Menu Functionality
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMobileMenuBtn = document.getElementById('close-mobile-menu');
const mobileMenu = document.getElementById('mobile-menu');
const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

const toggleMenu = (show) => {
  mobileMenu?.classList.toggle('active', show);
  mobileMenuBackdrop?.classList.toggle('active', show);
  document.body.style.overflow = show ? 'hidden' : '';
};

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => toggleMenu(true));
}

if (closeMobileMenuBtn) {
  closeMobileMenuBtn.addEventListener('click', () => toggleMenu(false));
}

if (mobileMenuBackdrop) {
  mobileMenuBackdrop.addEventListener('click', () => toggleMenu(false));
}

mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => toggleMenu(false));
});

// Smooth Scroll for Navigation
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

navLinks.forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth'
      });

      // Immediately set active state on click
      navLinks.forEach(l => l.classList.remove('nav-link-active'));
      this.classList.add('nav-link-active');
    }
  });
});

// Intersection Observer for Active State on Scroll
const observerOptions = {
  root: null,
  rootMargin: '-20% 0px -70% 0px',
  threshold: 0
};

const observerCallback = (entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('nav-link-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
};

const observer = new IntersectionObserver(observerCallback, observerOptions);
sections.forEach(section => observer.observe(section));

// Music Player Functionality
const mainPlayBtn = document.getElementById('main-play-btn');
const mainPlayIcon = mainPlayBtn?.querySelector('.material-symbols-outlined');
const mainTrackTitle = document.getElementById('main-track-title');
const mainTrackSubtitle = document.getElementById('main-track-subtitle');
const mainTrackImg = document.getElementById('main-track-img');
const mainTrackTime = document.getElementById('main-track-time');
const mainTrackOverlay = document.getElementById('main-track-overlay');
const waveformBars = document.querySelectorAll('.waveform-bar');
const playlistItems = document.querySelectorAll('.playlist-item');
const globalAudio = document.getElementById('global-audio');
const audioPicker = document.getElementById('audio-picker');
const loadCustomBtn = document.getElementById('load-custom-mix');

let isPlaying = false;
let currentTrackIndex = -1;

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const updateTimeDisplay = () => {
  if (globalAudio && mainTrackTime) {
    mainTrackTime.textContent = `${formatTime(globalAudio.currentTime)} / ${formatTime(globalAudio.duration)}`;
  }
};

const togglePlay = (play) => {
  if (!globalAudio) return;

  if (play === true) {
    globalAudio.play().catch(e => console.log('Playback error:', e));
    isPlaying = true;
  } else if (play === false) {
    globalAudio.pause();
    isPlaying = false;
  } else {
    isPlaying = !isPlaying;
    isPlaying ? globalAudio.play() : globalAudio.pause();
  }

  if (mainPlayIcon) {
    mainPlayIcon.textContent = isPlaying ? 'pause' : 'play_arrow';
  }
  waveformBars.forEach(bar => {
    bar.classList.toggle('animate-pulse', isPlaying);
  });
};

if (mainPlayBtn) {
  mainPlayBtn.addEventListener('click', () => togglePlay());
}

if (mainTrackOverlay) {
  mainTrackOverlay.addEventListener('click', () => togglePlay());
}

if (globalAudio) {
  globalAudio.addEventListener('timeupdate', updateTimeDisplay);
  globalAudio.addEventListener('ended', () => togglePlay(false));
}

// Initial listeners for static elements omitted as they are now handled dynamically

// Audio Picker Logic
if (loadCustomBtn && audioPicker) {
  loadCustomBtn.addEventListener('click', () => {
    audioPicker.click();
  });

  audioPicker.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (mainTrackTitle) mainTrackTitle.textContent = file.name.replace(/\.[^/.]+$/, "");
      if (mainTrackSubtitle) mainTrackSubtitle.textContent = 'Custom Device Mix';
      if (mainTrackImg) mainTrackImg.src = '/logo-avatar.jpg';
      if (globalAudio) {
        globalAudio.src = url;
        globalAudio.load();
      }

      playlistItems.forEach(i => i.classList.remove('border-r-primary'));
      loadCustomBtn.classList.add('border-r-primary');

      togglePlay(true);
      showToast('Mastering your local mix for the elite stage...');
    }
  });
}

// Inquiry Form Logic handled by Firestore sync at the bottom

// Coming Soon Notifications for Dead Links
const deadLinks = document.querySelectorAll('a[href="#"]:not([id^="hero-"]):not([id^="main-"])');
deadLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    if (link.getAttribute('href') === '#') {
      e.preventDefault();
      showToast('This section is currently being curated for the elite experience. Coming soon.');
    }
  });
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-background-dark px-6 py-3 rounded-full font-bold text-sm shadow-2xl animate-fade-in flex items-center gap-3';
  toast.innerHTML = `<span class="material-symbols-outlined text-xl">info</span> ${message}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

// Dynamic Content Loaders
const loadMixes = async () => {
  const container = document.getElementById('playlist-container');
  const q = query(collection(db, "mixes"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML = `
            <div class="glass-card p-8 md:p-12 rounded-xl text-center border border-primary/20">
                <p class="text-primary font-bold uppercase tracking-widest text-xs">Awaiting Master Mixes...</p>
            </div>
        `;
    return;
  }

  container.innerHTML = querySnapshot.docs.map(docSnap => {
    const mix = docSnap.data();
    return `
            <div class="playlist-item glass-card p-4 rounded-lg flex items-center gap-4 border-r-4 border-r-transparent hover:border-r-primary transition-all cursor-pointer group" 
                data-title="${mix.title}" 
                data-subtitle="${mix.subtitle}" 
                data-img="${mix.imgUrl}" 
                data-src="${mix.audioUrl}">
                <div class="size-16 rounded overflow-hidden shadow-lg border border-white/10">
                    <img class="w-full h-full object-cover" src="${mix.imgUrl}"/>
                </div>
                <div>
                    <p class="font-bold group-hover:text-primary transition-colors uppercase text-sm tracking-tight">${mix.title}</p>
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest">${mix.subtitle}</p>
                </div>
                <span class="material-symbols-outlined ml-auto text-slate-600 group-hover:text-primary transition-colors">play_circle</span>
            </div>
        `;
  }).join('');

  // Re-attach play listeners (or use delegation)
  const items = container.querySelectorAll('.playlist-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.dataset.title;
      const subtitle = item.dataset.subtitle;
      const img = item.dataset.img;
      const src = item.dataset.src;

      if (mainTrackTitle) mainTrackTitle.textContent = title;
      if (mainTrackSubtitle) mainTrackSubtitle.textContent = subtitle;
      if (mainTrackImg) mainTrackImg.src = img;
      if (globalAudio) {
        globalAudio.src = src;
        togglePlay(true);
      }
    });
  });
};

const loadGallery = async () => {
  const container = document.getElementById('gallery-container');
  const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    // Fallback or empty state
    container.innerHTML = `<p class="col-span-full text-slate-500 uppercase tracking-widest font-black text-xs py-20 text-center">Curating Visuals...</p>`;
    return;
  }

  container.innerHTML = querySnapshot.docs.map(docSnap => {
    const photo = docSnap.data();
    return `
            <div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
                <img src="${photo.imgUrl}" alt="${photo.title}" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <p class="text-primary font-bold tracking-widest text-[10px] uppercase mb-1">${photo.subtitle}</p>
                    <p class="text-white text-lg font-bold">${photo.title}</p>
                </div>
            </div>
        `;
  }).join('');
};

const loadEvents = async () => {
  const container = document.getElementById('events-container');
  const q = query(collection(db, "events"), orderBy("date", "asc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML = `<p class="text-slate-500 uppercase tracking-widest text-xs py-10">Schedule pending release...</p>`;
    return;
  }

  container.innerHTML = querySnapshot.docs.map(docSnap => {
    const ev = docSnap.data();
    const dateObj = new Date(ev.date);
    const day = dateObj.getDate();
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase();

    return `
            <div class="glass-card p-6 rounded-xl flex items-center group hover:bg-primary/5 transition-colors">
                <div class="text-center pr-8 border-r border-primary/20">
                    <p class="text-2xl font-bold text-primary">${day}</p>
                    <p class="text-xs uppercase font-black">${month}</p>
                </div>
                <div class="px-8 flex-1">
                    <h4 class="text-xl font-bold uppercase tracking-tight">${ev.title}</h4>
                    <p class="text-slate-500 text-xs uppercase tracking-widest">${ev.location}</p>
                </div>
                <div class="hidden sm:block text-right">
                    <div class="px-3 py-1 rounded ${ev.tagType === 'soldout' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-primary/10 border-primary/30 text-primary'} border text-[10px] font-black uppercase mb-2">
                        ${ev.tag}
                    </div>
                </div>
            </div>
        `;
  }).join('');
};

// Inquiry Portal Handling
const inquiryForm = document.getElementById('inquiry-form');
const whatsappInput = document.getElementById('inquiry-whatsapp');
let iti;

if (whatsappInput) {
  iti = intlTelInput(whatsappInput, {
    initialCountry: "auto",
    geoIpLookup: (callback) => {
      fetch("https://ipapi.co/json")
        .then((res) => res.json())
        .then((data) => callback(data.country_code))
        .catch(() => callback("GH"));
    },
    loadUtils: () => import("intl-tel-input/utils"),
    autoPlaceholder: "aggressive"
  });
}

if (inquiryForm) {
  inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('inquiry-submit');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="animate-pulse">Logging Transmission...</span>';

    try {
      await addDoc(collection(db, "inquiries"), {
        name: document.getElementById('inquiry-name').value,
        email: document.getElementById('inquiry-email').value,
        whatsapp: iti ? iti.getNumber() : document.getElementById('inquiry-whatsapp').value,
        event: document.getElementById('inquiry-event').value === 'other' ? document.getElementById('inquiry-event-other').value : document.getElementById('inquiry-event').value,
        location: document.getElementById('inquiry-location').value,
        message: document.getElementById('inquiry-message').value,
        timestamp: serverTimestamp()
      });

      document.getElementById('inquiry-success').classList.remove('hidden');
      inquiryForm.reset();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Security transmission failed. Please try again.");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

const loadVideos = async () => {
  const container = document.getElementById('videos-container');
  const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    container.innerHTML = `<p class="col-span-full text-slate-500 text-center uppercase tracking-widest text-xs py-20">Visual content coming soon...</p>`;
    return;
  }

  container.innerHTML = querySnapshot.docs.map(docSnap => {
    const vid = docSnap.data();
    return `
      <a href="${vid.tiktokUrl}" target="_blank" class="group relative block rounded-xl overflow-hidden glass-card border border-white/5 hover:border-primary/50 transition-all duration-500">
        <div class="aspect-video relative overflow-hidden">
          <img src="${vid.thumbnail}" alt="${vid.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
          <div class="absolute inset-0 bg-background-dark/40 group-hover:bg-background-dark/20 transition-all flex items-center justify-center">
            <div class="size-16 rounded-full bg-primary/90 text-background-dark flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
              <span class="material-symbols-outlined text-4xl fill-1">play_arrow</span>
            </div>
          </div>
          <div class="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded flex items-center gap-1">
            <i class="fa-brands fa-tiktok text-white text-xs"></i>
            <span class="text-white text-[10px] font-bold uppercase">TikTok</span>
          </div>
        </div>
        <div class="p-6 text-center">
          <h4 class="text-xl font-bold group-hover:text-primary transition-colors">${vid.title}</h4>
        </div>
      </a>
    `;
  }).join('');
};

const loadHero = async () => {
  const slider = document.getElementById('hero-slider');
  const q = query(collection(db, "hero_slides"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  const activeDocs = querySnapshot.docs.filter(doc => doc.data().active !== false);

  if (activeDocs.length > 0) {
    slider.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/40 to-background-dark z-10"></div>
            <div class="absolute inset-0 bg-emerald-dark/15 z-10"></div>
            ${activeDocs.map((docSnap, index) => {
      const slide = docSnap.data();
      return `
                    <div class="hero-slide ${index === 0 ? 'active' : ''}">
                        <img class="w-full h-full object-cover" src="${slide.imgUrl}" alt="DJ BRIDASH Hero Slide"/>
                    </div>
                `;
    }).join('')}
        `;

    if (activeDocs.length > 1) {
      startHeroSlider();
    }
  }
};

let heroInterval;
const startHeroSlider = () => {
  if (heroInterval) clearInterval(heroInterval);

  const slides = document.querySelectorAll('.hero-slide');
  let currentSlide = 0;

  heroInterval = setInterval(() => {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
  }, 5000);
};

const loadBookingConfig = async () => {
  const eventSelect = document.getElementById('inquiry-event');
  if (!eventSelect) return;

  const docRef = doc(db, "settings", "booking_config");
  let docSnap;
  try {
    docSnap = await getDoc(docRef);
  } catch (e) {
    console.warn("Config fetch failed:", e);
  }

  let types = ["Private Yacht Party", "Corporate Gala", "Wedding / Milestone", "Club Residency"];
  if (docSnap && docSnap.exists()) {
    types = docSnap.data().eventTypes || types;
  }

  eventSelect.innerHTML = types.map(type => `<option value="${type}">${type}</option>`).join('') +
    `<option value="other">Other (Please Specify)</option>`;

  eventSelect.addEventListener('change', (e) => {
    const otherContainer = document.getElementById('other-event-container');
    const otherInput = document.getElementById('inquiry-event-other');
    if (e.target.value === 'other') {
      otherContainer.classList.remove('hidden');
      otherInput.required = true;
      otherInput.focus();
    } else {
      otherContainer.classList.add('hidden');
      otherInput.required = false;
    }
  });
};

const loadSocials = async () => {
  const docRef = doc(db, "settings", "socials");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const platforms = ['instagram', 'tiktok', 'soundcloud'];
    platforms.forEach(p => {
      if (data[p]) {
        const navEl = document.getElementById(`nav-${p}`);
        const footerEl = document.getElementById(`footer-${p}`);
        if (navEl) navEl.href = data[p];
        if (footerEl) footerEl.href = data[p];
      }
    });
  }
};

// Initialize Dynamic Content
if (db) {
  loadHero();
  loadMixes();
  loadVideos();
  loadGallery();
  loadEvents();
  loadSocials();
  loadBookingConfig();
}
