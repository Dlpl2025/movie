// JioSaavn Public API Base Endpoint
const API_BASE = "https://jiosaavn-api-codyandersan.vercel.app";

// DOM Elements
const mainContainer = document.getElementById("mainContainer");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const loader = document.getElementById("loader");
const backBtn = document.getElementById("backBtn");

// Fullscreen Player Elements
const fullscreenPlayer = document.getElementById("fullscreenPlayer");
const fsBgBlur = document.getElementById("fsBgBlur");
const closePlayerBtn = document.getElementById("closePlayerBtn");
const vinylDisc = document.getElementById("vinylDisc");
const visualizerCanvas = document.getElementById("audioVisualizerCanvas");
const audioSource = document.getElementById("audioSource");
const playPauseBtn = document.getElementById("playPauseBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const shuffleIcon = document.getElementById("shuffleIcon");
const repeatBtn = document.getElementById("repeatBtn");
const repeatIcon = document.getElementById("repeatIcon");
const downloadBtn = document.getElementById("downloadBtn");
const currentThumb = document.getElementById("currentThumb");
const currentTitle = document.getElementById("currentTitle");
const currentArtist = document.getElementById("currentArtist");
const progressBar = document.getElementById("progressBar");
const currentTimeLabel = document.getElementById("currentTime");
const totalDurationLabel = document.getElementById("totalDuration");
const themeToggle = document.getElementById("themeToggle");

// Mini Player Elements
const miniPlayer = document.getElementById("miniPlayer");
const miniOpenBtn = document.getElementById("miniOpenBtn");
const miniThumb = document.getElementById("miniThumb");
const miniTitle = document.getElementById("miniTitle");
const miniArtist = document.getElementById("miniArtist");
const miniPrevBtn = document.getElementById("miniPrevBtn");
const miniPlayPauseBtn = document.getElementById("miniPlayPauseBtn");
const miniNextBtn = document.getElementById("miniNextBtn");

// Queue Elements
const queueToggleBtn = document.getElementById("queueToggleBtn");
const closeQueueBtn = document.getElementById("closeQueueBtn");
const queueDrawer = document.getElementById("queueDrawer");
const queueList = document.getElementById("queueList");

// Lyrics Elements
const lyricsToggleBtn = document.getElementById("lyricsToggleBtn");
const closeLyricsBtn = document.getElementById("closeLyricsBtn");
const lyricsDrawer = document.getElementById("lyricsDrawer");
const lyricsContent = document.getElementById("lyricsContent");

// Playback Queue & State
let currentPlaylist = [];
let currentIndex = -1;
let currentSongData = null;
let isShuffle = false;
let repeatMode = 0; // 0: Off, 1: Repeat All, 2: Repeat One

// Debounce & Pre-fetch Cache
let searchDebounceTimer = null;
const prefetchCache = new Map();

// Web Audio API Visualizer Setup
let audioCtx = null;
let analyserNode = null;
let visualizerSource = null;
let visualizerAnimationId = null;

// -------------------------------------------------------------
// DYNAMIC DAILY ARTISTS POOL (Daily 10 Rotation)
// -------------------------------------------------------------
const MASTER_ARTISTS_POOL = [
    { id: "459320", name: "Arijit Singh", subtitle: "Top Artist", image: "https://c.saavncdn.com/artists/Arijit_Singh_002_20230323062147_500x500.jpg" },
    { id: "456863", name: "Anupam Roy", subtitle: "Top Singer-Songwriter", image: "https://c.saavncdn.com/artists/Anupam_Roy_500x500.jpg" },
    { id: "485956", name: "Shreya Ghoshal", subtitle: "Top Singer", image: "https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg" },
    { id: "468245", name: "Atif Aslam", subtitle: "Artist", image: "https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg" },
    { id: "1274170", name: "Rupam Islam", subtitle: "Fossils", image: "https://c.saavncdn.com/artists/Rupam_Islam_500x500.jpg" },
    { id: "455130", name: "Sonu Nigam", subtitle: "Legendary Singer", image: "https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg" },
    { id: "455125", name: "KK", subtitle: "Iconic Singer", image: "https://c.saavncdn.com/artists/KK_500x500.jpg" },
    { id: "455926", name: "Armaan Malik", subtitle: "Pop Artist", image: "https://c.saavncdn.com/artists/Armaan_Malik_500x500.jpg" },
    { id: "456117", name: "Neha Kakkar", subtitle: "Pop Star", image: "https://c.saavncdn.com/artists/Neha_Kakkar_500x500.jpg" },
    { id: "455795", name: "Jubin Nautiyal", subtitle: "Top Artist", image: "https://c.saavncdn.com/artists/Jubin_Nautiyal_500x500.jpg" },
    { id: "881158", name: "Darshan Raval", subtitle: "Indie Pop", image: "https://c.saavncdn.com/artists/Darshan_Raval_500x500.jpg" },
    { id: "530030", name: "Nachiketa Chakraborty", subtitle: "Bengali Legend", image: "https://c.saavncdn.com/artists/Nachiketa_Chakraborty_500x500.jpg" },
    { id: "530026", name: "Suman Kalyanpur", subtitle: "Classic Singer", image: "https://c.saavncdn.com/artists/Suman_Kalyanpur_500x500.jpg" },
    { id: "464932", name: "Mohit Chauhan", subtitle: "Soulful Singer", image: "https://c.saavncdn.com/artists/Mohit_Chauhan_500x500.jpg" },
    { id: "467554", name: "Sunidhi Chauhan", subtitle: "Versatile Singer", image: "https://c.saavncdn.com/artists/Sunidhi_Chauhan_500x500.jpg" },
    { id: "455109", name: "Kumar Sanu", subtitle: "90s King", image: "https://c.saavncdn.com/artists/Kumar_Sanu_500x500.jpg" },
    { id: "455111", name: "Alka Yagnik", subtitle: "Evergreen Melody", image: "https://c.saavncdn.com/artists/Alka_Yagnik_500x500.jpg" },
    { id: "542289", name: "Silajit Majumder", subtitle: "Bengali Rock", image: "https://c.saavncdn.com/artists/Silajit_Majumder_500x500.jpg" },
    { id: "458607", name: "Lata Mangeshkar", subtitle: "Nightingale of India", image: "https://c.saavncdn.com/artists/Lata_Mangeshkar_500x500.jpg" },
    { id: "458608", name: "Kishore Kumar", subtitle: "All-Time Legend", image: "https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg" },
    { id: "457223", name: "Papon", subtitle: "Folk & Bollywood", image: "https://c.saavncdn.com/artists/Papon_500x500.jpg" },
    { id: "455317", name: "Shaan", subtitle: "Romantic Melodies", image: "https://c.saavncdn.com/artists/Shaan_500x500.jpg" },
    { id: "456244", name: "Monali Thakur", subtitle: "Top Singer", image: "https://c.saavncdn.com/artists/Monali_Thakur_500x500.jpg" },
    { id: "455124", name: "Udit Narayan", subtitle: "Golden Era Singer", image: "https://c.saavncdn.com/artists/Udit_Narayan_500x500.jpg" }
];

function getDailyArtists(count = 10) {
    const today = new Date();
    let seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    
    const poolCopy = [...MASTER_ARTISTS_POOL];
    for (let i = poolCopy.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const j = Math.floor((seed / 233280) * (i + 1));
        [poolCopy[i], poolCopy[j]] = [poolCopy[j], poolCopy[i]];
    }
    return poolCopy.slice(0, count);
}

// Helpers
function setProgress(percent) {
    if (!loader) return;
    loader.style.width = percent + "%";
    if (percent >= 100) {
        setTimeout(() => { loader.style.width = "0%"; }, 300);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function sanitize(str) {
    if (!str) return "";
    return String(str).replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;/g, "'");
}

function extractImage(item) {
    if (!item) return 'icon.png';
    if (typeof item.image === "string") return item.image;
    if (Array.isArray(item.image) && item.image.length > 0) {
        return item.image[item.image.length - 1]?.link || item.image[0]?.link || 'icon.png';
    }
    return 'icon.png';
}

function getArtistObjects(item) {
    if (!item) return [];
    if (Array.isArray(item.primaryArtists) && item.primaryArtists.length > 0) {
        return item.primaryArtists.map(a => typeof a === 'object' ? { id: a.id || "", name: a.name || "" } : { id: "", name: a }).filter(a => a.name);
    }
    if (Array.isArray(item.artists) && item.artists.length > 0) {
        return item.artists.map(a => typeof a === 'object' ? { id: a.id || "", name: a.name || "" } : { id: "", name: a }).filter(a => a.name);
    }
    const artistStr = getArtistNames(item);
    if (artistStr) {
        return artistStr.split(",").map(n => ({ id: "", name: n.trim() })).filter(a => a.name);
    }
    return [];
}

function getArtistNames(item) {
    if (!item) return "";
    if (Array.isArray(item.primaryArtists)) {
        return item.primaryArtists.map(a => typeof a === 'object' ? a.name : a).filter(Boolean).join(", ");
    }
    if (typeof item.primaryArtists === "string" && item.primaryArtists.trim() !== "") {
        return item.primaryArtists;
    }
    if (Array.isArray(item.artists)) {
        return item.artists.map(a => typeof a === 'object' ? a.name : a).filter(Boolean).join(", ");
    }
    if (typeof item.artist === "string") return item.artist;
    if (typeof item.subtitle === "string") return item.subtitle;
    if (typeof item.role === "string") return item.role;
    return "";
}

// -------------------------------------------------------------
// RECENTLY PLAYED LOCAL STORAGE
// -------------------------------------------------------------
function saveToRecentlyPlayed(song) {
    if (!song || !song.id) return;
    try {
        let recents = JSON.parse(localStorage.getItem("recently_played") || "[]");
        recents = recents.filter(s => s.id !== song.id);
        recents.unshift(song);
        if (recents.length > 15) recents.pop();
        localStorage.setItem("recently_played", JSON.stringify(recents));
    } catch (e) {}
}

function getRecentlyPlayed() {
    try {
        return JSON.parse(localStorage.getItem("recently_played") || "[]");
    } catch (e) {
        return [];
    }
}

// -------------------------------------------------------------
// LIVE AUDIO VISUALIZER (Web Audio API)
// -------------------------------------------------------------
function initVisualizer() {
    if (!visualizerCanvas) return;
    try {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 64;
            visualizerSource = audioCtx.createMediaElementSource(audioSource);
            visualizerSource.connect(analyserNode);
            analyserNode.connect(audioCtx.destination);
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        startVisualizerAnimation();
    } catch (e) {
        // Fallback gracefully if CORS restricted
    }
}

function startVisualizerAnimation() {
    if (visualizerAnimationId) cancelAnimationFrame(visualizerAnimationId);
    const ctx = visualizerCanvas.getContext("2d");
    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    visualizerCanvas.width = visualizerCanvas.clientWidth * window.devicePixelRatio || 380;
    visualizerCanvas.height = visualizerCanvas.clientHeight * window.devicePixelRatio || 380;

    function renderFrame() {
        visualizerAnimationId = requestAnimationFrame(renderFrame);
        analyserNode.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

        const centerX = visualizerCanvas.width / 2;
        const centerY = visualizerCanvas.height / 2;
        const radius = (visualizerCanvas.width / 2) * 0.76;
        const bars = 48;

        for (let i = 0; i < bars; i++) {
            const val = dataArray[i % bufferLength];
            const barHeight = (val / 255) * 35 * window.devicePixelRatio;
            const rad = (Math.PI * 2 / bars) * i;

            const x1 = centerX + Math.cos(rad) * radius;
            const y1 = centerY + Math.sin(rad) * radius;
            const x2 = centerX + Math.cos(rad) * (radius + barHeight);
            const y2 = centerY + Math.sin(rad) * (radius + barHeight);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.4 + (val / 255) * 0.6})`;
            ctx.lineWidth = 3.5 * window.devicePixelRatio;
            ctx.lineCap = "round";
            ctx.stroke();
        }
    }
    renderFrame();
}

// -------------------------------------------------------------
// MOBILE SWIPE-DOWN GESTURE (Minimize Player)
// -------------------------------------------------------------
(function initTouchGesture() {
    let startY = 0;
    let isDragging = false;

    fullscreenPlayer.addEventListener("touchstart", (e) => {
        if (e.target.closest(".queue-drawer") || e.target.closest(".lyrics-drawer")) return;
        startY = e.touches[0].clientY;
        isDragging = true;
    }, { passive: true });

    fullscreenPlayer.addEventListener("touchmove", (e) => {
        if (!isDragging) return;
        const deltaY = e.touches[0].clientY - startY;
        if (deltaY > 0) {
            fullscreenPlayer.style.transform = `translateY(${deltaY}px)`;
        }
    }, { passive: true });

    fullscreenPlayer.addEventListener("touchend", (e) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaY = e.changedTouches[0].clientY - startY;
        fullscreenPlayer.style.transform = "";
        if (deltaY > 120) {
            fullscreenPlayer.classList.remove("active");
            queueDrawer.classList.remove("open");
            lyricsDrawer.classList.remove("open");
        }
    });
})();

// -------------------------------------------------------------
// DESKTOP KEYBOARD SHORTCUTS
// -------------------------------------------------------------
window.addEventListener("keydown", (e) => {
    if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

    if (e.code === "Space") {
        e.preventDefault();
        togglePlayPause();
    } else if (e.code === "ArrowRight") {
        audioSource.currentTime = Math.min(audioSource.currentTime + 10, audioSource.duration || 0);
    } else if (e.code === "ArrowLeft") {
        audioSource.currentTime = Math.max(audioSource.currentTime - 10, 0);
    } else if (e.key === "m" || e.key === "M") {
        audioSource.muted = !audioSource.muted;
    }
});

// -------------------------------------------------------------
// RENDER CLICKABLE MARQUEE ARTISTS
// -------------------------------------------------------------
function renderFullscreenArtistSection(song) {
    const artistList = getArtistObjects(song);
    if (!artistList || artistList.length === 0) {
        currentArtist.innerHTML = `<span class="artist-marquee-content">${sanitize(getArtistNames(song) || "Music Player")}</span>`;
        return;
    }

    function createArtistSpans() {
        const span = document.createElement("span");
        artistList.forEach((artist, idx) => {
            const artistBtn = document.createElement("span");
            artistBtn.className = "clickable-artist-item";
            artistBtn.innerText = sanitize(artist.name);
            artistBtn.title = `View ${artist.name}`;
            artistBtn.onclick = (e) => {
                e.stopPropagation();
                fullscreenPlayer.classList.remove("active");
                queueDrawer.classList.remove("open");
                lyricsDrawer.classList.remove("open");
                loadArtistDetails(artist.id, artist.name);
            };

            span.appendChild(artistBtn);
            if (idx < artistList.length - 1) {
                span.appendChild(document.createTextNode(", "));
            }
        });
        return span;
    }

    currentArtist.innerHTML = "";
    currentArtist.className = "artist-marquee-container";

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "artist-marquee-content";
    contentWrapper.appendChild(createArtistSpans());
    currentArtist.appendChild(contentWrapper);

    setTimeout(() => {
        if (contentWrapper.scrollWidth > currentArtist.clientWidth) {
            currentArtist.classList.add("animate-scroll");
            const spacer = document.createElement("span");
            spacer.innerHTML = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
            contentWrapper.appendChild(spacer);
            contentWrapper.appendChild(createArtistSpans());
        } else {
            currentArtist.classList.remove("animate-scroll");
        }
    }, 50);
}

// -------------------------------------------------------------
// VIBRANT COLOR EXTRACTOR
// -------------------------------------------------------------
function extractColorsFromImage(imgUrl) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgUrl;

    img.onload = () => {
        try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = 16;
            canvas.height = 16;
            ctx.drawImage(img, 0, 0, 16, 16);
            const data = ctx.getImageData(0, 0, 16, 16).data;

            let r1 = 0, g1 = 0, b1 = 0, count1 = 0;
            let r2 = 0, g2 = 0, b2 = 0, count2 = 0;

            for (let i = 0; i < data.length / 2; i += 4) {
                if (data[i] + data[i + 1] + data[i + 2] > 60) {
                    r1 += data[i];
                    g1 += data[i + 1];
                    b1 += data[i + 2];
                    count1++;
                }
            }

            for (let i = data.length / 2; i < data.length; i += 4) {
                if (data[i] + data[i + 1] + data[i + 2] > 60) {
                    r2 += data[i];
                    g2 += data[i + 1];
                    b2 += data[i + 2];
                    count2++;
                }
            }

            count1 = count1 || 1;
            count2 = count2 || 1;

            r1 = Math.min(255, Math.floor((r1 / count1) * 0.85));
            g1 = Math.min(255, Math.floor((g1 / count1) * 0.85));
            b1 = Math.min(255, Math.floor((b1 / count1) * 0.85));

            r2 = Math.min(255, Math.floor((r2 / count2) * 0.65));
            g2 = Math.min(255, Math.floor((g2 / count2) * 0.65));
            b2 = Math.min(255, Math.floor((b2 / count2) * 0.65));

            document.documentElement.style.setProperty('--dyn-color-1', `rgb(${r1}, ${g1}, ${b1})`);
            document.documentElement.style.setProperty('--dyn-color-2', `rgb(${r2}, ${g2}, ${b2})`);
        } catch (e) {
            document.documentElement.style.setProperty('--dyn-color-1', '#3b2f75');
            document.documentElement.style.setProperty('--dyn-color-2', '#141026');
        }
    };
}

// -------------------------------------------------------------
// MEDIA SESSION API (Lock Screen Controls)
// -------------------------------------------------------------
function updateMediaSession(song, thumbUrl) {
    if ('mediaSession' in navigator) {
        const title = sanitize(song.name || song.title || "Unknown Track");
        const artist = sanitize(getArtistNames(song) || "Online Music Player");
        const album = sanitize(song.album?.name || song.name || "Music Player");

        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            album: album,
            artwork: [
                { src: thumbUrl, sizes: '96x96', type: 'image/jpeg' },
                { src: thumbUrl, sizes: '128x128', type: 'image/jpeg' },
                { src: thumbUrl, sizes: '192x192', type: 'image/jpeg' },
                { src: thumbUrl, sizes: '256x256', type: 'image/jpeg' },
                { src: thumbUrl, sizes: '384x384', type: 'image/jpeg' },
                { src: thumbUrl, sizes: '512x512', type: 'image/jpeg' }
            ]
        });

        navigator.mediaSession.setActionHandler('play', () => togglePlayPause(true));
        navigator.mediaSession.setActionHandler('pause', () => togglePlayPause(false));
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrevSong());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNextSong(false));
        navigator.mediaSession.setActionHandler('seekbackward', (d) => {
            audioSource.currentTime = Math.max(audioSource.currentTime - (d.seekOffset || 10), 0);
        });
        navigator.mediaSession.setActionHandler('seekforward', (d) => {
            audioSource.currentTime = Math.min(audioSource.currentTime + (d.seekOffset || 10), audioSource.duration || 0);
        });

        try {
            navigator.mediaSession.setActionHandler('seekto', (d) => {
                if (d.seekTime !== undefined && audioSource.duration) {
                    audioSource.currentTime = d.seekTime;
                }
            });
        } catch (e) {}
    }
}

// Navigation
function pushNavigationState(action, params = {}) {
    window.history.pushState({ action, params }, "");
}

window.onpopstate = function (event) {
    if (fullscreenPlayer.classList.contains("active")) {
        fullscreenPlayer.classList.remove("active");
        return;
    }
    if (event.state) {
        const { action, params } = event.state;
        if (action === "home") loadHomePage(false);
        else if (action === "search") {
            searchInput.value = params.query || "";
            searchAll(false);
        }
        else if (action === "artist") loadArtistDetails(params.id, params.name, false);
        else if (action === "album") loadAlbumSongs(params.id, params.name, params.hint, false);
        else if (action === "playlist") loadPlaylistSongs(params.id, params.name, false);
    } else {
        loadHomePage(false);
    }
};

backBtn.onclick = () => window.history.back();

// 1. Home Page Loader with Recently Played
async function loadHomePage(pushState = true) {
    if (pushState) pushNavigationState("home");
    try {
        setProgress(30);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Loading songs, please wait...</p>`;

        const res = await fetch(`${API_BASE}/modules?language=bengali,hindi,english`);
        setProgress(70);
        const json = await res.json();
        setProgress(90);

        mainContainer.innerHTML = "";
        const data = json.data || {};

        // Render Recently Played
        const recents = getRecentlyPlayed();
        if (recents.length > 0) {
            renderSection("🕒 Recently Played", recents, "song");
        }

        const latestSongs = (data.trending && data.trending.songs) || [];
        if (latestSongs.length > 0) {
            renderSection("🆕 Newly Released Songs", latestSongs, "song");
        }

        const suggestedArtists = getDailyArtists(10);
        renderSection("🌟 Popular Artists", suggestedArtists, "artist");

        const albums = (data.trending && data.trending.albums) || data.albums || [];
        if (albums.length > 0) {
            renderSection("💿 Popular Albums", albums, "album");
        }

        const playlists = data.playlists || [];
        if (playlists.length > 0) {
            renderSection("🎶 Recommended Playlists", playlists, "playlist");
        }

        setProgress(100);
    } catch (error) {
        console.error("Home load error:", error);
        mainContainer.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <p style="color: #ff5555; margin-bottom: 12px;">Failed to load the home page.</p>
                <button onclick="loadHomePage()" style="background:var(--accent); color:#fff; border:none; padding:8px 20px; border-radius:20px; cursor:pointer;">Try Again</button>
            </div>
        `;
        setProgress(100);
    }
}

// 2. Section Renderer
function renderSection(title, items, type) {
    if (!items || items.length === 0) return;

    const section = document.createElement("section");
    section.className = "home-section";

    const header = document.createElement("div");
    header.className = "section-header";
    header.innerHTML = `<h2>${title}</h2>`;
    section.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "grid-layout";

    items.forEach((item, index) => {
        const card = document.createElement("div");
        const isArtist = type === "artist";
        card.className = `card-item ${isArtist ? 'artist-card' : ''}`;

        const imgUrl = extractImage(item);
        const name = sanitize(item.name || item.title || "Unknown");
        const sub = sanitize(getArtistNames(item));

        card.innerHTML = `
            <img src="${imgUrl}" alt="${name}" loading="lazy" onerror="this.src='icon.png'">
            <span class="badge">${type}</span>
            <h3>${name}</h3>
            <p>${sub || (type.toUpperCase())}</p>
        `;

        card.onclick = () => {
            if (type === "song") {
                playSongFromQueue(items, index);
            } else if (type === "artist") {
                loadArtistDetails(item.id, name);
            } else if (type === "album") {
                loadAlbumSongs(item.id, name, sub || name);
            } else if (type === "playlist") {
                loadPlaylistSongs(item.id, name);
            }
        };

        grid.appendChild(card);
    });

    section.appendChild(grid);
    mainContainer.appendChild(section);
}

// 3. Search Songs & Multi-Categories
async function searchAll(pushState = true) {
    const query = searchInput.value.trim();
    if (!query) return;

    if (pushState) pushNavigationState("search", { query });

    try {
        setProgress(30);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Searching results for "${query}"...</p>`;

        const [songsRes, allRes, albumsRes, playlistsRes] = await Promise.all([
            fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(query)}&page=1&limit=30`),
            fetch(`${API_BASE}/search/all?query=${encodeURIComponent(query)}`),
            fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(query)}&page=1&limit=15`),
            fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(query)}&page=1&limit=15`)
        ]);

        setProgress(75);
        const songsJson = await songsRes.json();
        const allJson = await allRes.json();
        const albumsJson = await albumsRes.json();
        const playlistsJson = await playlistsRes.json();
        setProgress(95);

        mainContainer.innerHTML = "";

        const artists = (allJson.data && allJson.data.artists && allJson.data.artists.results) || [];
        const songs = (songsJson.data && songsJson.data.results) || [];
        const albums = (albumsJson.data && albumsJson.data.results) || (allJson.data && allJson.data.albums && allJson.data.albums.results) || [];
        const playlists = (playlistsJson.data && playlistsJson.data.results) || (allJson.data && allJson.data.playlists && allJson.data.playlists.results) || [];

        let foundAny = false;
        if (artists.length > 0) {
            foundAny = true;
            renderSection(`🌟 Artists`, artists, "artist");
        }
        if (songs.length > 0) {
            foundAny = true;
            renderSection(`🔥 Popular & New Songs (${songs.length})`, songs, "song");
        }
        if (albums.length > 0) {
            foundAny = true;
            renderSection(`💿 Albums`, albums, "album");
        }
        if (playlists.length > 0) {
            foundAny = true;
            renderSection(`🎶 Playlists`, playlists, "playlist");
        }

        if (!foundAny) {
            mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">No results found for "${query}"!</p>`;
        }
        setProgress(100);
    } catch (error) {
        console.error("Search error:", error);
        mainContainer.innerHTML = `<p style="color: red; text-align:center; padding: 40px;">Failed to load search results.</p>`;
        setProgress(100);
    }
}

// 4. Load Artist Details
async function loadArtistDetails(artistId, artistName, pushState = true) {
    if (pushState) pushNavigationState("artist", { id: artistId, name: artistName });

    try {
        setProgress(30);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Loading profile, songs, and albums for ${artistName}...</p>`;
        
        let songs = [];
        let albums = [];
        let playlists = [];

        if (artistId) {
            try {
                const res = await fetch(`${API_BASE}/artists?id=${artistId}`);
                const json = await res.json();
                songs = json.data?.topSongs || json.data?.songs || [];
                albums = json.data?.topAlbums || json.data?.albums || [];
            } catch (err) {}
        }

        setProgress(60);
        try {
            const [songsSearchRes, albumsSearchRes, playlistsSearchRes] = await Promise.all([
                fetch(`${API_BASE}/search/songs?query=${encodeURIComponent(artistName)}&page=1&limit=30`),
                fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(artistName)}&page=1&limit=15`),
                fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(artistName)}&page=1&limit=15`)
            ]);
            const songsSearchJson = await songsSearchRes.json();
            const albumsSearchJson = await albumsSearchRes.json();
            const playlistsSearchJson = await playlistsSearchRes.json();

            if (!songs.length) songs = songsSearchJson.data?.results || [];
            if (!albums.length) albums = albumsSearchJson.data?.results || [];
            playlists = playlistsSearchJson.data?.results || [];
        } catch (err) {}

        setProgress(100);
        mainContainer.innerHTML = "";

        let hasContent = false;
        if (songs.length > 0) {
            hasContent = true;
            renderSection(`🎤 Songs by ${artistName}`, songs, "song");
        }
        if (albums.length > 0) {
            hasContent = true;
            renderSection(`💿 Popular Albums by ${artistName}`, albums, "album");
        }
        if (playlists.length > 0) {
            hasContent = true;
            renderSection(`🎶 Popular Playlists featuring ${artistName}`, playlists, "playlist");
        }
        if (!hasContent) {
            mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">No songs found for artist "${artistName}".</p>`;
        }
    } catch (e) {
        alert("Failed to load artist details.");
        setProgress(100);
    }
}

// 5. Load Album Songs
async function loadAlbumSongs(albumId, albumName, artistHint = "", pushState = true) {
    if (pushState) pushNavigationState("album", { id: albumId, name: albumName, hint: artistHint });

    try {
        setProgress(30);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Fetching album songs...</p>`;
        
        const res = await fetch(`${API_BASE}/albums?id=${albumId}`);
        const json = await res.json();
        setProgress(60);

        mainContainer.innerHTML = "";
        const songs = json.data?.songs || [];
        
        if (songs.length > 0) {
            renderSection(`💿 Album: ${albumName}`, songs, "song");
        } else {
            mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">No songs found in this album.</p>`;
        }

        const artist = (songs[0] && getArtistNames(songs[0])) || artistHint;
        const mainArtist = artist.split(",")[0].trim();

        if (mainArtist) {
            try {
                const [albumsRes, playlistsRes] = await Promise.all([
                    fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(mainArtist)}&page=1&limit=15`),
                    fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(mainArtist)}&page=1&limit=15`)
                ]);
                const albumsJson = await albumsRes.json();
                const playlistsJson = await playlistsRes.json();
                
                const otherAlbums = (albumsJson.data?.results || []).filter(a => a.id !== albumId);
                const relatedPlaylists = playlistsJson.data?.results || [];

                if (otherAlbums.length > 0) {
                    renderSection(`💿 Other Albums by ${mainArtist}`, otherAlbums, "album");
                }
                if (relatedPlaylists.length > 0) {
                    renderSection(`🎶 Related Playlists for ${mainArtist}`, relatedPlaylists, "playlist");
                }
            } catch (err) {}
        }
        setProgress(100);
    } catch (e) {
        alert("Failed to open album.");
        setProgress(100);
    }
}

// 6. Load Playlist Songs
async function loadPlaylistSongs(playlistId, playlistName, pushState = true) {
    if (pushState) pushNavigationState("playlist", { id: playlistId, name: playlistName });

    try {
        setProgress(30);
        mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">Loading playlist...</p>`;
        
        const res = await fetch(`${API_BASE}/playlists?id=${playlistId}`);
        const json = await res.json();
        setProgress(60);

        mainContainer.innerHTML = "";
        const songs = json.data?.songs || [];
        
        if (songs.length > 0) {
            renderSection(`🎶 Playlist: ${playlistName}`, songs, "song");
        } else {
            mainContainer.innerHTML = `<p style="text-align:center; padding: 40px;">No songs found in this playlist.</p>`;
        }

        const sampleArtist = (songs[0] && getArtistNames(songs[0]).split(",")[0].trim()) || playlistName.split(" ")[0];

        try {
            const [playlistsRes, albumsRes] = await Promise.all([
                fetch(`${API_BASE}/search/playlists?query=${encodeURIComponent(sampleArtist)}&page=1&limit=15`),
                fetch(`${API_BASE}/search/albums?query=${encodeURIComponent(sampleArtist)}&page=1&limit=15`)
            ]);
            const playlistsJson = await playlistsRes.json();
            const albumsJson = await albumsRes.json();

            const suggestedPlaylists = (playlistsJson.data?.results || []).filter(p => p.id !== playlistId);
            const suggestedAlbums = albumsJson.data?.results || [];

            if (suggestedPlaylists.length > 0) {
                renderSection("🎶 Related Playlists", suggestedPlaylists, "playlist");
            }
            if (suggestedAlbums.length > 0) {
                renderSection("💿 Suggested Albums", suggestedAlbums, "album");
            }
        } catch (err) {}
        setProgress(100);
    } catch (e) {
        alert("Failed to load playlist.");
        setProgress(100);
    }
}

// 7. Queue & Pre-Caching
function playSongFromQueue(list, index) {
    currentPlaylist = list;
    currentIndex = index;
    renderQueueList();
    const song = currentPlaylist[currentIndex];
    if (song) {
        fetchAndPlaySong(song.id);
    }
}

function renderQueueList() {
    queueList.innerHTML = "";
    currentPlaylist.forEach((song, idx) => {
        const item = document.createElement("div");
        item.className = `queue-item ${idx === currentIndex ? 'active' : ''}`;
        
        const title = sanitize(song.name || song.title || "Unknown");
        const artist = sanitize(getArtistNames(song) || "Music Player");
        const thumb = extractImage(song);

        item.innerHTML = `
            <img src="${thumb}" alt="${title}">
            <div class="queue-item-info">
                <h4>${title}</h4>
                <p>${artist}</p>
            </div>
            ${idx === currentIndex ? '<span style="color:var(--accent)">▶</span>' : ''}
        `;

        item.onclick = () => {
            currentIndex = idx;
            renderQueueList();
            fetchAndPlaySong(song.id);
        };

        queueList.appendChild(item);
    });
}

// Pre-fetch next track metadata & audio buffer into cache
async function prefetchNextSong() {
    const nextIdx = currentIndex + 1;
    if (nextIdx < currentPlaylist.length) {
        const nextSong = currentPlaylist[nextIdx];
        if (nextSong && !prefetchCache.has(nextSong.id)) {
            try {
                const res = await fetch(`${API_BASE}/songs?id=${nextSong.id}`);
                const json = await res.json();
                if (json.data && json.data.length > 0) {
                    prefetchCache.set(nextSong.id, json.data[0]);
                }
            } catch (e) {}
        }
    }
}

function playNextSong(isAutoEnded = false) {
    if (currentPlaylist.length === 0) return;

    if (isAutoEnded && repeatMode === 2) {
        audioSource.currentTime = 0;
        audioSource.play();
        return;
    }

    if (isShuffle && currentPlaylist.length > 1) {
        let nextIdx;
        do {
            nextIdx = Math.floor(Math.random() * currentPlaylist.length);
        } while (nextIdx === currentIndex);
        currentIndex = nextIdx;
    } else {
        if (currentIndex + 1 < currentPlaylist.length) {
            currentIndex++;
        } else {
            if (repeatMode === 1 || isShuffle) {
                currentIndex = 0;
            } else {
                togglePlayPause(false);
                return;
            }
        }
    }

    renderQueueList();
    fetchAndPlaySong(currentPlaylist[currentIndex].id);
}

function playPrevSong() {
    if (currentPlaylist.length === 0) return;
    if (audioSource.currentTime > 3) {
        audioSource.currentTime = 0;
        return;
    }
    if (isShuffle && currentPlaylist.length > 1) {
        let prevIdx;
        do {
            prevIdx = Math.floor(Math.random() * currentPlaylist.length);
        } while (prevIdx === currentIndex);
        currentIndex = prevIdx;
    } else {
        if (currentIndex - 1 >= 0) {
            currentIndex--;
        } else {
            currentIndex = currentPlaylist.length - 1;
        }
    }
    renderQueueList();
    fetchAndPlaySong(currentPlaylist[currentIndex].id);
}

async function fetchAndPlaySong(id) {
    try {
        if (prefetchCache.has(id)) {
            playTrack(prefetchCache.get(id));
            return;
        }

        setProgress(40);
        const res = await fetch(`${API_BASE}/songs?id=${id}`);
        const json = await res.json();
        setProgress(100);

        if (json.data && json.data.length > 0) {
            playTrack(json.data[0]);
        }
    } catch (e) {
        console.error("Audio playback error:", e);
        alert("Failed to play the song.");
        setProgress(100);
    }
}

// -------------------------------------------------------------
// FETCH & RENDER LYRICS
// -------------------------------------------------------------
async function fetchSongLyrics(id) {
    lyricsContent.innerHTML = `<p class="lyrics-line">Loading lyrics...</p>`;
    try {
        const res = await fetch(`${API_BASE}/lyrics?id=${id}`);
        const json = await res.json();
        if (json.data && json.data.lyrics) {
            const raw = json.data.lyrics.replace(/<br\s*[\/]?>/gi, '\n');
            const lines = raw.split('\n').filter(l => l.trim() !== "");
            lyricsContent.innerHTML = "";
            lines.forEach((line) => {
                const p = document.createElement("p");
                p.className = "lyrics-line";
                p.innerText = sanitize(line);
                lyricsContent.appendChild(p);
            });
        } else {
            lyricsContent.innerHTML = `<p class="lyrics-line">No lyrics found for this track.</p>`;
        }
    } catch (e) {
        lyricsContent.innerHTML = `<p class="lyrics-line">Lyrics unavailable.</p>`;
    }
}

// 8. Play Track & Synchronization
function playTrack(song) {
    currentSongData = song;
    saveToRecentlyPlayed(song);

    const downloadUrls = song.downloadUrl;
    if (!downloadUrls || downloadUrls.length === 0) {
        alert("Audio stream link not found!");
        return;
    }

    const audioUrl = downloadUrls[downloadUrls.length - 1].link;
    const songTitle = sanitize(song.name || song.title);
    const songArtist = sanitize(getArtistNames(song) || "Music Player");
    const thumbUrl = extractImage(song);

    // Fullscreen UI & Blurred Ambient
    currentTitle.innerText = songTitle;
    renderFullscreenArtistSection(song);
    currentThumb.src = thumbUrl;
    if (fsBgBlur) fsBgBlur.style.backgroundImage = `url('${thumbUrl}')`;

    // Bottom Sticky Mini Player
    if (miniPlayer) {
        miniTitle.innerText = songTitle;
        miniArtist.innerText = songArtist;
        miniThumb.src = thumbUrl;
        miniPlayer.classList.add("active");
        miniPlayer.style.display = "flex";
    }

    extractColorsFromImage(thumbUrl);

    audioSource.src = audioUrl;
    audioSource.play().then(() => {
        initVisualizer();
    }).catch(() => {});

    updatePlayPauseIcons(true);
    vinylDisc.classList.add("playing");

    document.title = `Playing: ${songTitle}`;

    updateMediaSession(song, thumbUrl);
    fetchSongLyrics(song.id);
}

function togglePlayPause(shouldPlay) {
    if (!audioSource.src) return;

    if (shouldPlay === undefined) {
        shouldPlay = audioSource.paused;
    }

    if (shouldPlay) {
        audioSource.play().then(() => {
            initVisualizer();
        }).catch(() => {});
        updatePlayPauseIcons(true);
        vinylDisc.classList.add("playing");
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "playing";
    } else {
        audioSource.pause();
        updatePlayPauseIcons(false);
        vinylDisc.classList.remove("playing");
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "paused";
    }
}

function updatePlayPauseIcons(isPlaying) {
    const icon = isPlaying ? "⏸" : "▶";
    if (playPauseBtn) playPauseBtn.innerText = icon;
    if (miniPlayPauseBtn) miniPlayPauseBtn.innerText = icon;
}

// Controls
playPauseBtn.onclick = () => togglePlayPause();
miniPlayPauseBtn.onclick = (e) => {
    e.stopPropagation();
    togglePlayPause();
};

prevBtn.onclick = playPrevSong;
miniPrevBtn.onclick = (e) => {
    e.stopPropagation();
    playPrevSong();
};

nextBtn.onclick = () => playNextSong(false);
miniNextBtn.onclick = (e) => {
    e.stopPropagation();
    playNextSong(false);
};

miniOpenBtn.onclick = () => fullscreenPlayer.classList.add("active");

closePlayerBtn.onclick = () => {
    fullscreenPlayer.classList.remove("active");
    queueDrawer.classList.remove("open");
    lyricsDrawer.classList.remove("open");
};

shuffleBtn.onclick = () => {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle("active", isShuffle);
    shuffleIcon.src = isShuffle ? "icon/suffel2.png" : "icon/suffel1.png";
    shuffleBtn.title = isShuffle ? "Shuffle: On" : "Shuffle: Off";
};

repeatBtn.onclick = () => {
    repeatMode = (repeatMode + 1) % 3;
    repeatBtn.classList.toggle("active", repeatMode !== 0);
    repeatIcon.src = `icon/repeat${repeatMode + 1}.png`;
    repeatBtn.title = ["Repeat: Off", "Repeat: All", "Repeat: One"][repeatMode];
};

queueToggleBtn.onclick = () => {
    lyricsDrawer.classList.remove("open");
    queueDrawer.classList.toggle("open");
};
closeQueueBtn.onclick = () => queueDrawer.classList.remove("open");

lyricsToggleBtn.onclick = () => {
    queueDrawer.classList.remove("open");
    lyricsDrawer.classList.toggle("open");
};
closeLyricsBtn.onclick = () => lyricsDrawer.classList.remove("open");

audioSource.ontimeupdate = () => {
    if (audioSource.duration) {
        const progress = (audioSource.currentTime / audioSource.duration) * 100;
        progressBar.value = progress;
        currentTimeLabel.innerText = formatTime(audioSource.currentTime);
        totalDurationLabel.innerText = formatTime(audioSource.duration);

        // Pre-fetch next track when 80% is finished
        if (progress > 80) {
            prefetchNextSong();
        }

        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            try {
                navigator.mediaSession.setPositionState({
                    duration: audioSource.duration || 0,
                    playbackRate: audioSource.playbackRate || 1,
                    position: audioSource.currentTime || 0
                });
            } catch (e) {}
        }
    }
};

progressBar.oninput = () => {
    if (audioSource.duration) {
        audioSource.currentTime = (progressBar.value / 100) * audioSource.duration;
    }
};

audioSource.onended = () => playNextSong(true);

// -------------------------------------------------------------
// 9. CLEAN BLOB DOWNLOAD (Android & iOS 100% Playable)
// -------------------------------------------------------------
downloadBtn.onclick = async () => {
    if (!currentSongData || !currentSongData.downloadUrl) return;

    const audioUrl = currentSongData.downloadUrl[currentSongData.downloadUrl.length - 1].link;
    const songName = sanitize(currentSongData.name || currentSongData.title || "song");
    
    // Detect accurate extension (usually m4a or mp4 from JioSaavn)
    const isM4A = audioUrl.includes(".m4a") || audioUrl.includes(".mp4");
    const fileName = `${songName}.${isM4A ? 'm4a' : 'mp3'}`;

    try {
        setProgress(30);
        const res = await fetch(audioUrl);
        setProgress(70);
        const blob = await res.blob();
        setProgress(90);

        // Native clean mime type prevents mobile player corruption
        const cleanBlob = new Blob([blob], { type: isM4A ? "audio/mp4" : "audio/mpeg" });
        const downloadLink = window.URL.createObjectURL(cleanBlob);
        
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = downloadLink;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        
        setTimeout(() => window.URL.revokeObjectURL(downloadLink), 1000);
        setProgress(100);
    } catch (err) {
        window.open(audioUrl, '_blank');
        setProgress(100);
    }
};

// 10. Light/Dark Mode
themeToggle.onclick = () => {
    document.body.classList.toggle("light-mode");
    themeToggle.innerText = document.body.classList.contains("light-mode") ? "☀️" : "🌙";
};

// 11. Search Events with Debounce (300ms)
searchBtn.onclick = () => searchAll(true);
searchInput.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    const query = searchInput.value.trim();
    if (query.length > 2) {
        searchDebounceTimer = setTimeout(() => searchAll(false), 350);
    }
});
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        clearTimeout(searchDebounceTimer);
        searchAll(true);
    }
});

// Launch App
loadHomePage(false);
