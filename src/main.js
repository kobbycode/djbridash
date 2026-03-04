import './style.css'

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
<a class="px-6 py-2.5 bg-primary text-background-dark text-sm font-bold rounded hover:bg-primary/90 transition-all uppercase tracking-widest" href="#contact">Book Now</a>
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
<a class="mobile-nav-link text-white" href="#music">Music</a>
<a class="mobile-nav-link text-white" href="#videos">Videos</a>
<a class="mobile-nav-link text-white" href="#gallery">Gallery</a>
<a class="mobile-nav-link text-white" href="#events">Events</a>
<a class="mobile-nav-link text-white" href="#about">Bio</a>
<a class="mobile-nav-link text-primary" href="#contact">Book Now</a>
</div>
<div class="mt-auto pb-12 text-center">
<div class="flex gap-6 justify-center mb-8">
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://instagram.com/djbridash" target="_blank">
<i class="fa-brands fa-instagram text-lg"></i>
</a>
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://tiktok.com/@djbridash" target="_blank">
<i class="fa-brands fa-tiktok text-lg"></i>
</a>
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary active:bg-primary active:text-background-dark transition-all" href="https://soundcloud.com/djbridash" target="_blank">
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
<div class="absolute inset-0 z-0">
<div class="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/40 to-background-dark z-10"></div>
<div class="absolute inset-0 bg-emerald-dark/15 z-10"></div>
<img class="w-full h-full object-cover" data-alt="Official portrait of DJ BRIDASH" src="/hero-portrait.jpg"/>
</div>
<div class="relative z-20 text-center px-6 max-w-4xl translate-y-20 md:translate-y-32">
<h2 class="text-primary text-sm md:text-lg font-bold tracking-[0.4em] uppercase mb-4 opacity-90 font-exo">International Standards</h2>
<h1 class="text-4xl sm:text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter gold-gradient-text font-exo uppercase">
    THE PLATINUM FINGERS
</h1>
<div class="flex flex-col sm:flex-row items-center justify-center gap-6">
<button id="hero-book-btn" class="min-w-[220px] px-8 py-4 bg-primary text-background-dark font-bold text-base uppercase tracking-widest rounded transition-transform hover:scale-105">
                    Book DJ Bridash
                </button>
<button id="hero-listen-btn" class="min-w-[220px] px-8 py-4 glass-card text-white font-bold text-base uppercase tracking-widest rounded border border-white/20 hover:border-primary transition-all">
                    Listen to Mixes
                </button>
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
<div class="lg:col-span-2 glass-card rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center border-l-4 border-l-primary">
<div class="relative group shrink-0">
<img class="size-64 object-cover rounded shadow-2xl" data-alt="Abstract gold and black vinyl record cover art" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD0dzzoTvFtYqX6XEa8b2I-dIxoVYEOGE6nWmJGK5gPer1IfOxXlFy9PJU-JyGrp8hM0ZL0T67W69p1Jecrvgvtw70QlGKqCP3LzjaYHv5fEHf3Opo_9Wq02aPQ-K-UtkI5QlwGCJ1NZ7D6kdBNMv-i5ni9PT9anGzLB9-z6Bk-XRbUuRT6RE29I7QA5lE_Fy3-v31RA-aefORP94fXYzBeSnID-UYcezLfpyhi5-lZI1bCXIWFVmBqV_T0PrDAH9ikuqDIpqLql6tX"/>
<div class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span class="material-symbols-outlined text-white text-6xl">play_circle</span>
</div>
</div>
<div class="flex-1 w-full">
<span class="text-primary text-xs font-black uppercase tracking-widest">Now Premiering</span>
<h4 class="text-3xl font-bold mt-2 mb-1">Afro House Experience</h4>
<p class="text-slate-400 mb-8 font-light italic">Live from Mykonos Summer Residency</p>
<!-- Visualizer Simulator -->
<div class="flex items-end h-16 gap-1 mb-6">
<div class="waveform-bar h-[40%] animate-pulse"></div>
<div class="waveform-bar h-[60%] animate-pulse" style="animation-delay: 0.1s"></div>
<div class="waveform-bar h-[90%] animate-pulse" style="animation-delay: 0.2s"></div>
<div class="waveform-bar h-[70%] animate-pulse" style="animation-delay: 0.3s"></div>
<div class="waveform-bar h-[45%] animate-pulse" style="animation-delay: 0.4s"></div>
<div class="waveform-bar h-[85%] animate-pulse" style="animation-delay: 0.5s"></div>
<div class="waveform-bar h-[100%] animate-pulse" style="animation-delay: 0.6s"></div>
<div class="waveform-bar h-[60%] animate-pulse" style="animation-delay: 0.7s"></div>
<div class="waveform-bar h-[30%] animate-pulse" style="animation-delay: 0.8s"></div>
<div class="waveform-bar h-[80%] animate-pulse" style="animation-delay: 0.9s"></div>
<div class="waveform-bar h-[95%] animate-pulse" style="animation-delay: 1.0s"></div>
<div class="waveform-bar h-[55%] animate-pulse" style="animation-delay: 1.1s"></div>
<div class="waveform-bar h-[40%] animate-pulse" style="animation-delay: 1.2s"></div>
<div class="waveform-bar h-[75%] animate-pulse" style="animation-delay: 1.3s"></div>
<div class="waveform-bar h-[90%] animate-pulse" style="animation-delay: 1.4s"></div>
</div>
<div class="flex items-center gap-8">
<button class="text-slate-400 hover:text-primary"><span class="material-symbols-outlined text-3xl">skip_previous</span></button>
<button class="size-16 rounded-full bg-primary flex items-center justify-center text-background-dark shadow-[0_0_20px_rgba(212,175,53,0.4)] transition-transform hover:scale-110">
<span class="material-symbols-outlined text-4xl fill-1">play_arrow</span>
</button>
<button class="text-slate-400 hover:text-primary"><span class="material-symbols-outlined text-3xl">skip_next</span></button>
<div class="ml-auto text-primary text-sm font-mono font-bold tracking-tighter">02:45 / 58:12</div>
</div>
</div>
</div>
<!-- Playlist -->
<div class="space-y-4">
<div class="glass-card p-4 rounded-lg flex items-center gap-4 border-r-4 border-r-transparent hover:border-r-primary transition-all cursor-pointer group">
<div class="size-16 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Dark aesthetic concert lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDI4RXZ7STh1VNeCfMQaGstRyMAaHMnem6-k2l-eiQ0t5RLQksmR6zUvzeXvV8aVvrYI4HJz0w6oaaU4KFdYUjs9PuvMGd2m0QQ1FhVvaEuYnvfV4luRab0ewXGnHFkEotmyARFX__u9HjPhlF99lxUGcO74VQsIBQRKxiwl7NoqERlSKs4IdEzfBy8rvP9j13Nqs20GT8-eU5un3kftFE_WgZTvUhS8Gq9d2s9NdnhogciCAFn5fjoGqGUAVjan3TwzvGnTPJy3moD"/>
</div>
<div>
<p class="font-bold group-hover:text-primary transition-colors">Accra Night Vibes</p>
<p class="text-xs text-slate-500 uppercase tracking-widest">Amapiano • 45m</p>
</div>
<span class="material-symbols-outlined ml-auto text-slate-600">more_vert</span>
</div>
<div class="glass-card p-4 rounded-lg flex items-center gap-4 border-r-4 border-r-transparent hover:border-r-primary transition-all cursor-pointer group">
<div class="size-16 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Elite party atmosphere" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB53Ib78UvCN14POxmPApG2wt7XRD_6ggiaFhUd8eRkRJAsP-SX6Pgj9XjAAXDGxUkT-YvE5nDzfVb4UkR24FBjQUCWpcLDiaBdtlocSnr1L4mme_nVMdENH_GAwwdxFdSf-FLz1CS5BjMAPUM5OYUxngp4kWJki1nCvNnI2oE2wVsgTbrZR_KLt-uypO2dJ3cYvrlnHQ1cBhV5WovTY0M0ciGjhEfhWyoZhySCMFvucQ-jbpNrqRGfCyLmWMTcm1cTwSajpfpRnb0F"/>
</div>
<div>
<p class="font-bold group-hover:text-primary transition-colors">Penthouse Lounge</p>
<p class="text-xs text-slate-500 uppercase tracking-widest">Deep House • 1h 12m</p>
</div>
<span class="material-symbols-outlined ml-auto text-slate-600">more_vert</span>
</div>
<div class="glass-card p-4 rounded-lg flex items-center gap-4 border-r-4 border-r-transparent hover:border-r-primary transition-all cursor-pointer group">
<div class="size-16 rounded overflow-hidden">
<img class="w-full h-full object-cover" data-alt="Crowd at luxury event" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCDsgzfamjBhonEUApPFapNxMsazWjkao8_ESwduuQbX2iy6b5LDfdUCxjOw-dSpkGCRod4_E4WUER3s7kggRdzlr3J9yFfUvDrFmsk1L6-J_p1Zt-xIst0gX9XHvsysB-ogcC437HTlz8OWX2PNYUu7j1SlQYXzntG8bnZN-0-5NedPl8klwwz5ybYGwcKKATCkJp6cuqQGr3DyeGm5KkpaMrcSj0JBEekoBZGQvSwsx60XWA1e8os-3z9M1V-YgZeV4XHoeu--qr"/>
</div>
<div>
<p class="font-bold group-hover:text-primary transition-colors">Private Yacht Set</p>
<p class="text-xs text-slate-500 uppercase tracking-widest">Tropical • 38m</p>
</div>
<span class="material-symbols-outlined ml-auto text-slate-600">more_vert</span>
</div>
</div>
</div>
</div>
</section>

<!-- Videos Section -->
<section class="py-32 px-6 lg:px-12 bg-[#080808] border-y border-primary/5" id="videos">
<div class="max-w-7xl mx-auto">
<div class="mb-16 text-center">
<h2 class="text-primary text-sm font-bold tracking-[0.4em] uppercase mb-4">The Visual Experience</h2>
<h3 class="text-4xl md:text-6xl font-black gold-gradient-text uppercase tracking-tighter">Videos</h3>
</div>

<div class="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
<!-- Video Card 1 -->
<a href="https://www.tiktok.com/@djbridash" target="_blank" class="group relative block rounded-xl overflow-hidden glass-card border border-white/5 hover:border-primary/50 transition-all duration-500">
<div class="aspect-video relative overflow-hidden">
<img src="/video_thumb_1.png" alt="DJ BRIDASH Performance Video" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
<div class="absolute inset-0 bg-background-dark/40 group-hover:bg-background-dark/20 transition-all flex items-center justify-center">
<div class="size-16 rounded-full bg-primary/90 text-background-dark flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
<span class="material-symbols-outlined text-4xl fill-1">play_arrow</span>
</div>
</div>
</div>
<div class="p-6">
<h4 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Exclusive Rooftop Set • Dubai</h4>
<p class="text-slate-400 text-sm">Experience the energy of the elite night scene.</p>
</div>
</a>

<!-- Video Card 2 -->
<a href="https://www.tiktok.com/@djbridash" target="_blank" class="group relative block rounded-xl overflow-hidden glass-card border border-white/5 hover:border-primary/50 transition-all duration-500">
<div class="aspect-video relative overflow-hidden">
<img src="/video_thumb_2.png" alt="DJ BRIDASH Gear Video" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
<div class="absolute inset-0 bg-background-dark/40 group-hover:bg-background-dark/20 transition-all flex items-center justify-center">
<div class="size-16 rounded-full bg-primary/90 text-background-dark flex items-center justify-center scale-90 group-hover:scale-100 transition-transform">
<span class="material-symbols-outlined text-4xl fill-1">play_arrow</span>
</div>
</div>
</div>
<div class="p-6">
<h4 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">Sonic Perfection • Technical Showcase</h4>
<p class="text-slate-400 text-sm">Behind the decks with the master of vibes.</p>
</div>
</a>
</div>
</div>
</section>

<!-- Gallery Section -->
<section class="py-32 px-6 lg:px-12 bg-background-dark" id="gallery">
<div class="max-w-7xl mx-auto">
<div class="mb-16 text-center">
<h2 class="text-primary text-sm font-bold tracking-[0.4em] uppercase mb-4">Elite Moments</h2>
<h3 class="text-4xl md:text-6xl font-black gold-gradient-text uppercase tracking-tighter">Gallery</h3>
</div>

<div class="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
<!-- Studio Session (Retained) -->
<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/about.jpg" alt="DJ BRIDASH Studio" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Studio Session</p>
<p class="text-white text-lg font-bold">Global Rhythm</p>
</div>
</div>

<!-- New Assets -->
<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/gallery-pink-headphones.jpg" alt="DJ BRIDASH with Headphones" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Elite Performance</p>
<p class="text-white text-lg font-bold">Vibrant Beats</p>
</div>
</div>

<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/gallery-orange-serato.jpg" alt="DJ BRIDASH at the Deck" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Master Class</p>
<p class="text-white text-lg font-bold">The Mixmaster</p>
</div>
</div>

<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/gallery-pink-vinyl.jpg" alt="DJ BRIDASH with Vinyl" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Authentic Sound</p>
<p class="text-white text-lg font-bold">Analog Soul</p>
</div>
</div>

<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/gallery-orange-portrait.jpg" alt="DJ BRIDASH Portrait" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Sonic Energy</p>
<p class="text-white text-lg font-bold">The Aura</p>
</div>
</div>

<div class="relative group rounded-xl overflow-hidden border border-white/10 break-inside-avoid">
<img src="/gallery-orange-shirt.jpg" alt="DJ BRIDASH Professional Pose" class="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700">
<div class="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
<p class="text-primary font-bold tracking-widest text-xs uppercase mb-1">Professional Excellence</p>
<p class="text-white text-lg font-bold">The Maestro</p>
</div>
</div>
</div>
</div>
</section>

<!-- About Section -->
<section class="py-32 px-6 lg:px-12 bg-background-dark relative overflow-hidden" id="about">
<div class="absolute top-0 right-0 size-[600px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
<div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
<div class="relative">
<div class="absolute -inset-4 border border-primary/20 rounded-lg -z-10 translate-x-4 translate-y-4"></div>
<div class="relative rounded-lg overflow-hidden h-[700px] border-2 border-primary/30">
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
<div class="py-8 border-y border-primary/10 flex gap-12">
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
<section class="py-32 px-6 lg:px-12 bg-background-dark relative" id="events">
<div class="max-w-7xl mx-auto">
<div class="grid lg:grid-cols-2 gap-20">
<div>
<h3 class="text-primary font-bold uppercase tracking-[0.3em] mb-4">World Tour</h3>
<h2 class="text-5xl font-bold mb-12">Upcoming Residencies</h2>
<div class="space-y-6">
<div class="glass-card p-6 rounded-xl flex items-center group hover:bg-primary/5 transition-colors">
<div class="text-center pr-8 border-r border-primary/20">
<p class="text-2xl font-bold text-primary">24</p>
<p class="text-xs uppercase font-black">AUG</p>
</div>
<div class="px-8 flex-1">
<h4 class="text-xl font-bold">Sky Bar Gold Edition</h4>
<p class="text-slate-500 text-sm">Monte Carlo, Monaco</p>
</div>
<div class="hidden sm:block text-right">
<div class="px-3 py-1 rounded bg-primary/10 border border-primary/30 text-[10px] text-primary font-black uppercase mb-2">Final 10 Tickets</div>
<p class="text-xs text-slate-400">Sold Out Soon</p>
</div>
</div>
<div class="glass-card p-6 rounded-xl flex items-center group hover:bg-primary/5 transition-colors">
<div class="text-center pr-8 border-r border-primary/20">
<p class="text-2xl font-bold text-primary">02</p>
<p class="text-xs uppercase font-black">SEP</p>
</div>
<div class="px-8 flex-1">
<h4 class="text-xl font-bold">Midnight in Lagos</h4>
<p class="text-slate-500 text-sm">Lagos, Nigeria</p>
</div>
<div class="hidden sm:block text-right">
<div class="px-3 py-1 rounded bg-emerald-dark/40 border border-emerald-400/30 text-[10px] text-emerald-400 font-black uppercase mb-2">Exclusive RSVP</div>
<p class="text-xs text-slate-400">Guestlist Only</p>
</div>
</div>
<div class="glass-card p-6 rounded-xl flex items-center group hover:bg-primary/5 transition-colors">
<div class="text-center pr-8 border-r border-primary/20">
<p class="text-2xl font-bold text-primary">15</p>
<p class="text-xs uppercase font-black">SEP</p>
</div>
<div class="px-8 flex-1">
<h4 class="text-xl font-bold">Vogue After Party</h4>
<p class="text-slate-500 text-sm">Paris, France</p>
</div>
<div class="hidden sm:block text-right">
<div class="px-3 py-1 rounded bg-primary/10 border border-primary/30 text-[10px] text-primary font-black uppercase mb-2">Private Event</div>
<p class="text-xs text-slate-400">Invitation Only</p>
</div>
</div>
</div>
</div>
<div class="glass-card p-10 rounded-2xl border-2 border-primary/20 relative" id="contact">
<div class="absolute -top-6 left-10 bg-primary px-6 py-2 rounded text-background-dark font-black uppercase text-sm shadow-[0_0_15px_rgba(212,175,53,0.3)]">
                        Inquiry Portal
                    </div>
<h3 class="text-3xl font-bold mb-8">Reserve the Sound</h3>
<form class="space-y-6">
<div class="grid grid-cols-2 gap-6">
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Full Name</label>
<input class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Johnathan Sterling" type="text"/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Email Address</label>
<input class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="john@sterling.com" type="email"/>
</div>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Event Type</label>
<select class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white appearance-none">
<option>Private Yacht Party</option>
<option>Corporate Gala</option>
<option>Wedding / Milestone</option>
<option>Club Residency</option>
</select>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Date & Location</label>
<input class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Dubai - Dec 2024" type="text"/>
</div>
<div class="space-y-2">
<label class="text-xs uppercase tracking-widest font-black text-slate-500">Message</label>
<textarea class="w-full bg-background-dark/50 border border-primary/20 rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white" placeholder="Tell us about your vision..." rows="4"></textarea>
</div>
<button class="w-full py-4 bg-primary text-background-dark font-black uppercase tracking-[0.2em] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,53,0.3)] transition-all transform active:scale-[0.98]">
                            Submit Inquiry
                        </button>
</form>
</div>
</div>
</div>
</section>

<!-- Footer -->
<footer class="bg-[#050505] py-20 px-6 lg:px-12 border-t border-primary/10">
<div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
<div class="text-center md:text-left">
<a href="#hero" class="flex items-center gap-4 mb-6 justify-center md:justify-start group">
<img src="/logo-avatar.jpg" alt="DJ BRIDASH Logo" class="h-12 w-auto rounded shadow-lg border border-primary/20 group-hover:border-primary/50 transition-all">
<span class="text-3xl font-black tracking-widest gold-gradient-text uppercase">DJ BRIDASH</span>
</a>
<p class="text-slate-500 max-w-sm mb-8">The undisputed leader in luxury sonic atmospheres. Creating memories that transcend the ordinary.</p>
<div class="flex gap-6 justify-center md:justify-start">
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://instagram.com/djbridash" target="_blank">
<i class="fa-brands fa-instagram text-lg"></i>
</a>
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://tiktok.com/@djbridash" target="_blank">
<i class="fa-brands fa-tiktok text-lg"></i>
</a>
<a class="size-10 rounded-full border border-primary/30 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark transition-all" href="https://soundcloud.com/djbridash" target="_blank">
<i class="fa-brands fa-soundcloud text-lg"></i>
</a>
</div>
</div>
<div class="grid grid-cols-2 sm:grid-cols-3 gap-16">
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

// Hero Button Interactivity
const heroBookBtn = document.getElementById('hero-book-btn');
const heroListenBtn = document.getElementById('hero-listen-btn');

if (heroBookBtn) {
  heroBookBtn.addEventListener('click', () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  });
}

if (heroListenBtn) {
  heroListenBtn.addEventListener('click', () => {
    document.getElementById('music')?.scrollIntoView({ behavior: 'smooth' });
  });
}
