const API_BASE = 'https://api.bdey.online';

let rawFiles = [];
let filteredList = [];
let renderIndex = 0;
const CHUNK_SIZE = 16;

let activeTab = 'video';
let selectedGenre = 'All';
let isVaultUnlocked = false;
let viewingVaultOnly = false;

let art = null;
let plyrInstance = null;

// ডেটা লোড
async function fetchMedia() {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.remove('hidden');
    try {
        const fetchOptions = window.location.protocol === 'file:' ? {} : { credentials: 'include' };
        const res = await fetch(`${API_BASE}/api/files`, fetchOptions);
        const data = await res.json();
        rawFiles = data.files || [];
        isVaultUnlocked = data.vault_unlocked;
        updateVaultUI();
        renderChips();
        resetAndFilter();
    } catch (err) {
        console.error("ডেটা লোডিং সমস্যা:", err);
        const grid = document.getElementById('mediaGrid');
        if (grid) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 text-rose-400 text-xs">সার্ভারের সাথে কানেক্ট করা যায়নি। ব্যাকএন্ড চেক করুন।</div>`;
        }
    } finally {
        if (loader) loader.classList.add('hidden');
    }
}

// ক্যাটাগরি চিপস
function renderChips() {
    const container = document.getElementById('chipsContainer');
    if (!container) return;
    const target = getActiveSource();
    const currentTabFiles = target.filter(f => f.media_type === activeTab);
    const genres = ['All', ...new Set(currentTabFiles.map(f => f.genre).filter(Boolean))];

    container.innerHTML = genres.map(g => `
        <button onclick="setGenre('${g}')" class="whitespace-nowrap px-4 py-1.5 rounded-full transition ${selectedGenre === g ? 'bg-sky-500 text-white font-bold shadow-md shadow-sky-500/20' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'}">
            ${g === 'All' ? 'সবগুলো' : g}
        </button>
    `).join('');
}

function setGenre(g) {
    selectedGenre = g;
    renderChips();
    resetAndFilter();
}

function setTab(tab) {
    activeTab = tab;
    selectedGenre = 'All';
    document.querySelectorAll('nav button').forEach(b => {
        b.classList.remove('text-sky-400', 'font-bold');
        b.classList.add('text-slate-400');
    });
    const activeBtn = document.getElementById(`tab-${tab}`);
    if (activeBtn) {
        activeBtn.classList.add('text-sky-400', 'font-bold');
        activeBtn.classList.remove('text-slate-400');
    }
    renderChips();
    resetAndFilter();
}

function getActiveSource() {
    if (viewingVaultOnly) return rawFiles.filter(f => f.is_private === 1);
    return rawFiles.filter(f => f.is_private === 0);
}

function resetAndFilter() {
    const searchEl = document.getElementById('searchInput');
    const q = searchEl ? searchEl.value.toLowerCase().trim() : '';
    const source = getActiveSource();

    filteredList = source.filter(f => {
        const matchTab = f.media_type === activeTab;
        const matchGenre = (selectedGenre === 'All' || f.genre === selectedGenre);
        const title = (f.file_name || '').toLowerCase();
        const matchQuery = !q || title.includes(q) || (f.category || '').toLowerCase().includes(q);
        return matchTab && matchGenre && matchQuery;
    });

    renderIndex = 0;
    const grid = document.getElementById('mediaGrid');
    if (grid) grid.innerHTML = '';
    renderMore();
}

function renderMore() {
    const container = document.getElementById('mediaGrid');
    const loadBtn = document.getElementById('loadMoreBtn');
    if (!container) return;

    if (filteredList.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-16 text-slate-500 text-xs">কোনো কনটেন্ট পাওয়া যায়নি।</div>`;
        if (loadBtn) loadBtn.classList.add('hidden');
        return;
    }

    const slice = filteredList.slice(renderIndex, renderIndex + CHUNK_SIZE);
    renderIndex += slice.length;

    const html = slice.map(m => {
        const thumbUrl = m.backdrop || m.poster || `${API_BASE}/thumb/${m.msg_id}`;
        return `
            <div onclick="playMedia(${m.msg_id}, '${m.file_name.replace(/'/g, "\\\\'")}', '${m.media_type}')" 
                 class="group relative flex flex-col bg-slate-900/60 border ${m.is_private ? 'border-rose-900/50' : 'border-slate-800/80'} hover:border-sky-500/70 rounded-2xl overflow-hidden cursor-pointer transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/5">
                
                <div class="relative aspect-video w-full bg-slate-950 overflow-hidden">
                    <img src="${thumbUrl}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" onerror="this.onerror=null; this.src='icon.png';">
                    
                    <div class="absolute top-2 left-2 flex gap-1 items-center">
                        ${m.year && m.year !== 'Unknown' ? `<span class="bg-black/60 backdrop-blur-md text-[10px] font-bold px-1.5 py-0.5 rounded text-white border border-white/10">${m.year}</span>` : ''}
                        ${m.rating && m.rating !== '0.0' ? `<span class="bg-amber-500/90 text-[10px] font-black px-1.5 py-0.5 rounded text-black flex items-center gap-0.5"><i class="fa-solid fa-star text-[8px]"></i> ${m.rating}</span>` : ''}
                    </div>

                    <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <div class="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition">
                            <i class="fa-solid ${m.media_type === 'audio' ? 'fa-headphones' : 'fa-play'} text-sm"></i>
                        </div>
                    </div>
                </div>

                <div class="p-3 flex flex-col flex-1 justify-between">
                    <h3 class="text-xs font-semibold text-slate-100 group-hover:text-sky-300 line-clamp-2 leading-relaxed" title="${m.file_name}">${m.file_name}</h3>
                    <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/40 text-[10px] text-slate-400">
                        <span>#${m.genre || 'Media'}</span>
                        <span class="bg-slate-800 px-2 py-0.5 rounded text-[9px] text-slate-300">${formatSize(m.file_size)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.insertAdjacentHTML('beforeend', html);
    if (loadBtn) {
        if (renderIndex < filteredList.length) loadBtn.classList.remove('hidden');
        else loadBtn.classList.add('hidden');
    }
}

// ইন-অ্যাপ ফ্লোটিং PiP প্লেয়ার
function playMedia(id, name, type) {
    const streamUrl = `${API_BASE}/stream/${id}`;

    if (type === 'video') {
        const pip = document.getElementById('floatingPiP');
        const pipTitle = document.getElementById('pipTitle');
        if (pipTitle) pipTitle.innerText = name;
        if (pip) {
            pip.classList.remove('hidden');
            pip.className = "fixed minimized flex flex-col overflow-hidden bg-black shadow-2xl";
        }

        if (art) { art.destroy(); art = null; }

        art = new Artplayer({
            container: '#artplayerContainer',
            url: streamUrl,
            title: name,
            autoplay: true,
            pip: true,
            fullscreen: true,
            theme: '#38bdf8',
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreenWeb: false
        });
    } else if (type === 'audio') {
        openAudioModal(streamUrl, name, id);
    } else {
        window.open(streamUrl, '_blank');
    }
}

function toggleMaximizePiP() {
    const pip = document.getElementById('floatingPiP');
    const icon = document.querySelector('#maximizeBtn i');
    if (!pip) return;

    if (pip.classList.contains('minimized')) {
        pip.classList.remove('minimized');
        pip.classList.add('maximized');
        if (icon) icon.className = "fa-solid fa-compress";
    } else {
        pip.classList.remove('maximized');
        pip.classList.add('minimized');
        if (icon) icon.className = "fa-solid fa-expand";
    }
    if (art) art.resize();
}

function closePiP() {
    if (art) { art.destroy(); art = null; }
    const pip = document.getElementById('floatingPiP');
    if (pip) pip.classList.add('hidden');
}

// অডিও মোডাল
function openAudioModal(url, title, id) {
    const modal = document.getElementById('audioModal');
    const thumb = document.getElementById('audioThumb');
    const titleEl = document.getElementById('audioTitle');
    
    if (thumb) thumb.src = `${API_BASE}/thumb/${id}`;
    if (titleEl) titleEl.innerText = title;
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    const audioEl = document.getElementById('plyrControl');
    if (audioEl) {
        audioEl.src = url;
        if (plyrInstance) plyrInstance.destroy();
        plyrInstance = new Plyr(audioEl, { controls: ['play', 'progress', 'current-time', 'mute', 'volume'] });
        plyrInstance.play();

        const disc = document.getElementById('audioDisc');
        plyrInstance.on('play', () => disc && disc.classList.remove('paused-vinyl'));
        plyrInstance.on('pause', () => disc && disc.classList.add('paused-vinyl'));
    }
}

function closeAudioModal() {
    if (plyrInstance) { plyrInstance.destroy(); plyrInstance = null; }
    const modal = document.getElementById('audioModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

// ভল্ট মোডাল
function handleVaultModal() {
    const modal = document.getElementById('vaultModal');
    if (!isVaultUnlocked) {
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    } else {
        viewingVaultOnly = !viewingVaultOnly;
        updateVaultUI();
        renderChips();
        resetAndFilter();
    }
}

async function submitVault(e) {
    e.preventDefault();
    const u = document.getElementById('vUser').value;
    const p = document.getElementById('vPass').value;

    const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    };
    if (window.location.protocol !== 'file:') {
        fetchOptions.credentials = 'include';
    }

    const res = await fetch(`${API_BASE}/api/vault_login`, fetchOptions);

    if (res.ok) {
        const modal = document.getElementById('vaultModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        isVaultUnlocked = true;
        viewingVaultOnly = true;
        fetchMedia();
    } else {
        const errEl = document.getElementById('vError');
        if (errEl) errEl.classList.remove('hidden');
    }
}

function updateVaultUI() {
    const btn = document.getElementById('vaultBtn');
    const icon = document.getElementById('vaultIcon');
    const label = document.getElementById('vaultLabel');
    if (!btn) return;

    if (isVaultUnlocked) {
        if (viewingVaultOnly) {
            btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 bg-rose-600 shadow-md text-white transition";
            if (icon) icon.className = "fa-solid fa-lock-open";
            if (label) label.innerText = "ভল্ট সক্রিয়";
        } else {
            btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 transition";
            if (icon) icon.className = "fa-solid fa-shield-halved";
            if (label) label.innerText = "ভল্ট স্যুইচ";
        }
    } else {
        btn.className = "px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:brightness-110 shadow-md text-white transition";
        if (icon) icon.className = "fa-solid fa-lock";
        if (label) label.innerText = "ভল্ট";
    }
}

function formatSize(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function goHome() {
    setTab('video');
    const searchEl = document.getElementById('searchInput');
    if (searchEl) searchEl.value = '';
    resetAndFilter();
}

document.addEventListener('DOMContentLoaded', fetchMedia);