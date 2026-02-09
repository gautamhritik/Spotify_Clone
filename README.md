# 🎵 Spotify Clone (Web Music Player)

A responsive Spotify-inspired music player built using **HTML, CSS, and JavaScript**.  
This project supports dynamic album loading, global search, keyboard controls, and a modern UI similar to Spotify.

---

## 🚀 Features

- 🎧 Play/Pause music controls  
- ⏭ Next/Previous track support  
- 📂 Dynamic album & playlist loading  
- 🖼 Supports both `cover.jpg` and `cover.png`  
- 🔍 Global song search across all albums  
- 🎚 Volume slider + mute toggle  
- ⌨ Keyboard Shortcuts:
  - **Space / Enter** → Play/Pause  
  - **Arrow Left / Right** → Seek ±5 seconds  
  - **Arrow Up / Down** → Volume control  
- 📱 Fully responsive (mobile sidebar supported)

---

## 📁 Project Structure

Spotify-Clone/
│
├── index.html
├── css/
│ ├── style.css
│ └── utility.css
├── script.js
├── img/
└── songs/
├── Album1/
│ ├── cover.jpg / cover.png
│ ├── song1.mp3
│ └── song2.mp3
└── Album2/
├── cover.png
└── track.mp3

---

## ⚠ Important Notice

**No songs/audio files are included in this repository** to reduce size and avoid copyright issues.  
You must add your own `.mp3` files inside the `songs/` folder to use the music player.

---

## ⚙ How to Run Locally

This project requires a local server because songs are loaded dynamically.

### Install http-server

```bash
npm install -g http-server
http-server -p 3000
http://127.0.0.1:3000
