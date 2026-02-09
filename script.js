console.log("Spotify Clone JS Loaded");

let audio = new Audio();
let songs = [];
let currentIndex = 0;
let currFolder = "";
let originalSongs = [];

/* ================================
   Format Time Helper
================================ */
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    return `${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
}

/* ================================
   Extract Song Name Helper
================================ */
function getSongName(src) {
    return decodeURIComponent(src)
        .split(/[/\\]/)
        .pop()
        .replace(".mp3", "");
}


async function getAlbums() {
    let res = await fetch("http://127.0.0.1:3000/songs/");
    let html = await res.text();

    let div = document.createElement("div");
    div.innerHTML = html;

    let links = Array.from(div.getElementsByTagName("a"));

    let albums = links
        .map(link => decodeURIComponent(link.getAttribute("href")))
        .filter(href => href && href !== "../")
        .filter(href => !href.includes("."))

        // ✅ Convert backslashes to forward slashes
        .map(href => href.replaceAll("\\", "/"))

        // ✅ Remove "songs/" if it exists
        .map(href => href.replace("songs/", ""))

        // ✅ Extract clean folder name
        .map(href => href.split("/").filter(Boolean).pop());

    return albums;
}

async function renderAlbums() {
    let albums = await getAlbums();

    let container = document.querySelector(".cardContainer");
    container.innerHTML = "";

    albums.forEach(album => {
        container.innerHTML += `
    <div class="card" data-folder="songs/${album}">
        
        <div class="play">
            <svg width="35" height="35" viewBox="1 3 24 24"
                xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <polygon points="9,6 19,12 9,18" fill="#000000" />
            </svg>
        </div>

        <img src="songs/${album}/cover.jpg" alt="${album}" onerror="this.onerror=null;this.src='songs/${album}/cover.png';">
        
        <h2>${album.replaceAll("_", " ")}</h2>
        
        <p>Hits to boost your mood and fill you with happiness!</p>
    </div>`;
    });


    // Activate cards
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await loadAlbum(card.dataset.folder);
        });
    });
}


/* ================================
   Fetch Songs From Folder
================================ */
async function getSongs(folder) {
    currFolder = folder;

    let res = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let html = await res.text();

    let div = document.createElement("div");
    div.innerHTML = html;

    let links = div.getElementsByTagName("a");

    let songList = [];
    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songList.push(link.href);
        }
    }

    return songList;
}

/* ================================
   Play Music Function
================================ */
function playMusic(src) {
    audio.src = src;
    audio.play();

    document.getElementById("play").src = "img/pause.svg";

    currentIndex = songs.findIndex(s => s.src === src);

    document.querySelector(".songinfo").innerHTML = getSongName(src);

    document.querySelectorAll(".songList li").forEach(li => {
        li.classList.remove("active");
    });

    let activeLi = document.querySelector(`li[data-src="${src}"]`);
    if (activeLi) activeLi.classList.add("active");

}

/* ================================
   Render Songs in Sidebar
================================ */
function renderSongList() {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    songs.forEach((songObj) => {
        songUL.innerHTML += `
        <li data-src="${songObj.src}">
            <img class="invert" src="img/music.svg">
            <div class="info">
                <div>${getSongName(songObj.src)}</div>
                <div>${songObj.album}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg">
            </div>
        </li>`;
    });

    document.querySelectorAll(".songList li").forEach((li) => {
        li.addEventListener("click", () => {
            playMusic(li.dataset.src);

            // Close sidebar on mobile
            document.querySelector(".left").classList.remove("active");
        });
    });
}

/* ================================
   Next / Previous Controls
================================ */
function playNext() {
    currentIndex = (currentIndex + 1) % songs.length;
    playMusic(songs[currentIndex].src);

}

function playPrevious() {
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playMusic(songs[currentIndex].src);

}

async function loadAlbum(folder) {
    let rawSongs = await getSongs(folder);

    songs = rawSongs.map(song => ({
        src: song,
        album: folder.split("/").pop()
    }));
    originalSongs = [...songs];
    renderSongList();

    // ✅ If playlist has NO songs → FULL RESET
    if (songs.length === 0) {

        // Stop audio completely
        audio.pause();
        audio.currentTime = 0;
        audio.src = ""; // ✅ Important: clears previous song

        // Reset player state
        currentIndex = 0;

        // Reset UI
        document.getElementById("play").src = "img/play.svg";

        document.querySelector(".songinfo").innerHTML = "No songs available";
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";

        document.querySelector(".progress").style.width = "0%";
        document.querySelector(".circle").style.left = "0%";

        return;
    }

    // ✅ Otherwise play first song
    playMusic(songs[0].src);
}


async function getAllSongsFromAllAlbums() {
    let albums = await getAlbums();
    let allSongs = [];

    for (let album of albums) {
        let folderSongs = await getSongs(`songs/${album}`);

        folderSongs.forEach(song => {
            allSongs.push({
                src: song,
                album: album
            });
        });
    }

    return allSongs;
}






/* ================================
   Main App Start
================================ */
async function main() {

    await renderAlbums();

    // ✅ Load ALL songs globally on startup
    let globalSongs = await getAllSongsFromAllAlbums();

    // Sidebar shows global library
    songs = [...globalSongs];
    originalSongs = [...globalSongs];

    renderSongList();

    // Set first song info (but don't autoplay)
    if (songs.length > 0) {
        audio.src = songs[0].src;
        document.querySelector(".songinfo").innerHTML =
            getSongName(songs[0].src);

        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    }



    // Auto load first song correctly
    // if (songs.length > 0) {
    //     audio.src = songs[0].src;
    //     document.querySelector(".songinfo").innerHTML = getSongName(songs[0].src);
    //     document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    // }


    /* ----------------------------
       Play/Pause Button
    ---------------------------- */
    let playBtn = document.getElementById("play");

    playBtn.addEventListener("click", () => {
        if (songs.length === 0) return;

        if (audio.paused) {
            audio.play();
            playBtn.src = "img/pause.svg";
        } else {
            audio.pause();
            playBtn.src = "img/play.svg";
        }
    });

    /* ----------------------------
       Seekbar Click
    ---------------------------- */
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let rect = e.target.getBoundingClientRect();
        let percent = (e.clientX - rect.left) / rect.width;

        audio.currentTime = percent * audio.duration;
    });

    /* ----------------------------
       Time Update + Progress Bar
    ---------------------------- */
    audio.addEventListener("timeupdate", () => {
        let percent = (audio.currentTime / audio.duration) * 100;

        document.querySelector(".progress").style.width = percent + "%";
        document.querySelector(".circle").style.left = percent + "%";

        document.querySelector(".songtime").innerHTML =
            `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
    });

    /* ----------------------------
       Previous / Next Buttons
    ---------------------------- */
    document.getElementById("previous").addEventListener("click", playPrevious);
    document.getElementById("next").addEventListener("click", playNext);

    /* ----------------------------
       Volume Control
    ---------------------------- */
    let volumeRange = document.getElementById("volumeRange");
    let volumeIcon = document.getElementById("volumeIcon");

    audio.volume = 1;

    volumeRange.addEventListener("input", () => {
        audio.volume = volumeRange.value / 100;

        volumeIcon.src =
            audio.volume === 0 ? "img/mute.svg" : "img/volume.svg";
    });

    volumeIcon.addEventListener("click", () => {
        if (audio.volume > 0) {
            audio.volume = 0;
            volumeRange.value = 0;
            volumeIcon.src = "img/mute.svg";
        } else {
            audio.volume = 1;
            volumeRange.value = 100;
            volumeIcon.src = "img/volume.svg";
        }
    });

    /* ----------------------------
       Mobile Sidebar Toggle
    ---------------------------- */
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.toggle("active");
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("active");
    });



    let searchInput = document.getElementById("searchInput");

    // let globalSongs = await getAllSongsFromAllAlbums();

    searchInput.addEventListener("input", () => {
        let query = searchInput.value.toLowerCase();

        if (query.trim() === "") {
            songs = [...originalSongs];
            renderSongList();
            return;
        }

        let filtered = globalSongs.filter(songObj =>
            getSongName(songObj.src).toLowerCase().includes(query)
        );

        songs = filtered;
        renderSongList();
    });




    /* ================================
   Keyboard Controls (Improved)
================================ */
    document.addEventListener("keydown", (e) => {

        // ✅ Ignore shortcuts while typing in search box
        if (document.activeElement.id === "searchInput") return;

        // ✅ Prevent browser cursor movement + scrolling
        if (
            e.code === "Space" ||
            e.code === "ArrowUp" ||
            e.code === "ArrowDown" ||
            e.code === "ArrowLeft" ||
            e.code === "ArrowRight"
        ) {
            e.preventDefault();
        }

        /* ----------------------------
           Play / Pause (Space or Enter)
        ---------------------------- */
        if (e.code === "Space" || e.code === "Enter") {

            if (songs.length === 0) return;

            if (audio.paused) {
                audio.play();
                document.getElementById("play").src = "img/pause.svg";
            } else {
                audio.pause();
                document.getElementById("play").src = "img/play.svg";
            }
        }

        /* ----------------------------
           Volume Control (Up / Down)
        ---------------------------- */
        let volumeStep = 0.05;

        if (e.code === "ArrowUp") {
            audio.volume = Math.min(1, audio.volume + volumeStep);
        }

        if (e.code === "ArrowDown") {
            audio.volume = Math.max(0, audio.volume - volumeStep);
        }

        // Update slider + icon
        volumeRange.value = audio.volume * 100;
        volumeIcon.src =
            audio.volume === 0 ? "img/mute.svg" : "img/volume.svg";

        /* ----------------------------
           Seek Control (Left / Right)
        ---------------------------- */
        let seekStep = 5; // seconds

        if (e.code === "ArrowRight") {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + seekStep);
        }

        if (e.code === "ArrowLeft") {
            audio.currentTime = Math.max(0, audio.currentTime - seekStep);
        }
    });


    audio.addEventListener("ended", () => {
        playNext();
    });




}

main();
