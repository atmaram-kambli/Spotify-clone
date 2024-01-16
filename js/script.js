let currentSong = new Audio();
const play = document.getElementById('play');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const cardContainer = document.querySelector('.card-container');
let songs;
let folder = "cr";


async function addPlaylists() {
    const fetchData = await fetch('http://127.0.0.1:3000/songs/')
    // console.log(fetchData)
    const response = await fetchData.text();

    const div = document.createElement('div');
    div.innerHTML = response;
    const as = div.getElementsByTagName("a");
    
    let array = Array.from(as);
    for (let index = 0; index < array.length; index++) {
        const a = array[index];
        if(a.href.includes('/songs/')) {
            // console.log(a.href.split('/').slice(-2,-1))
            // console.log(a.innerText.split("/")[0])
            let fold = a.innerText.split("/")[0];
            const res = await fetch(`http://127.0.0.1:3000/songs/${fold}/info.json`);
            const jsonInfo = await res.json();
            cardContainer.innerHTML += `
            <div data-folder="${fold}" class="card rounded">
            <div class="play-father">
                <img class="rounded" src="/songs/${fold}/cover.jpg" alt="${jsonInfo.title}">
                <svg class="play" width="50" height="50" data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" class="Svg-sc-ytk21e-0 iYxpxA">
                    <rect x="2%" y="2%" width="96%" height="96%" fill="#1FC255" rx="50"></rect>
                    <path d="m7 4.5 5 2.5a.7.7 0 0 1 0 1.212l-5 2.5a.7.7 0 0 1-1 0v-6a.7.7 0 0 1 1-.212z" transform="translate(4, 4)"></path>
                </svg>
            </div>                                     
            <p class="head">${jsonInfo.title}</p>
            <p>${jsonInfo.desc}</p>
        </div>
            `;
        }
    }
    
    Array.from(document.querySelectorAll('.card')).forEach((card) => {
        card.addEventListener('click', async (e) => {
            // console.log(e.currentTarget.dataset.folder);
            folder = e.currentTarget.dataset.folder;
            await getSongs(folder);
            playMusic(songs[0].name, folder, true);
        })
    })
}


async function getSongs(folder) {
    let fetchData = await fetch(`http://127.0.0.1:3000/songs/${folder}`);
    let response = await fetchData.text();
    // console.log(response);

    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');
    // console.log(as);
    songs = [];
    Array.from(as).forEach((a) => {
        if(a.href.endsWith('.mp3')) {
            songs.push({link:a.href, name:a.innerText});

        }
    })

    let songList = document.querySelector('.songs-library').querySelector('ul');
    // console.log(songList);
    songList.innerHTML = "";
    songs.forEach((song) => {
        songList.innerHTML += `<li>
        <div class="song-card rounded">
            <img class="invert svg-w" src="assets/music.svg" alt="">
            <div class="song-info">
                <div class="song-name">${song.name}</div>
                <div class="singer">Ak</div>
            </div>
            <div class="play-song">
                <span>Play now</span>
                <img class="invert svg-w" src="assets/play1.svg" alt="">
            </div>
        </div>
    </li>`
    })
    
    let lis = document.querySelector('.songs-library').getElementsByTagName('li');
    Array.from(lis).forEach((li) => {
        li.addEventListener('click', ()=> {
            // console.log((li).querySelector(".song-info"))
            playMusic((li).querySelector(".song-name").innerHTML, folder)
            // console.log((li).querySelector(".song-name").innerHTML)
            // console.log("first")
        })
    })

}

const playMusic = (song, folder, pause=false) => {
    currentSong.src = `/songs/${folder}/${song}`;
    (document.querySelector(".song-time")).innerHTML = `00:00/00:00`;
    if(!pause) {
        currentSong.play();
        play.src = 'assets/pause.svg';
    }
    (document.querySelector(".current-song")).innerHTML = decodeURI(song);
}

function secondsToMMSS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function main() {

    addPlaylists();

    await getSongs(folder);
    playMusic(songs[0].name, folder, true);

    
    Array.from(document.querySelectorAll('.card')).forEach((card) => {
        card.addEventListener('click', async (e) => {
            // console.log(e.currentTarget.dataset);
            folder = e.currentTarget.dataset.folder;
            await getSongs(folder);
        })
    })
    
    play.addEventListener('click', ()=> {
        if(currentSong.paused) {
            currentSong.play();
            play.src = 'assets/pause.svg';
        }
        else {
            currentSong.pause();
            play.src = 'assets/play.svg';
        }

    })

    currentSong.addEventListener('timeupdate', () => {
        // console.log(currentSong.currentTime, currentSong.duration)
        if(currentSong.currentTime){
            document.querySelector(".playbar .song-time").innerHTML = secondsToMMSS(currentSong.currentTime) + "/" + secondsToMMSS(currentSong.duration);
            document.querySelector('.circle').style.left = (currentSong.currentTime/currentSong.duration) * 100+"%";
        }
    })

    document.querySelector('.seekbar').addEventListener("click", (e) => {
        currentSong.currentTime = ((e.offsetX * 100)/e.target.getBoundingClientRect().width)*(currentSong.duration/100);
        // document.querySelector('.circle').style.left = ((e.offsetX * 100)/e.target.getBoundingClientRect().width)+"%";
    })

    document.querySelector(".hamburger").addEventListener('click', () => {
        document.querySelector('.left').style.left = "0%";
    })
    document.querySelector(".close").addEventListener('click', () => {
        document.querySelector('.left').style.left = "-110%";
    })
    prev.addEventListener('click', () => {
        let ind = songs.findIndex(song => song.link === currentSong.src);
        if(ind-1 < 0) {
            ind = songs.length;
        }
        playMusic(songs[ind-1].name);
    })
    next.addEventListener('click', () => {
        // console.log(songs);
        let ind = songs.findIndex(song => song.link === currentSong.src);
        if(ind+1 >= songs.length) {
            ind = -1;
        }
        playMusic(songs[ind+1].name);
    })

    document.querySelector(".volume").querySelector('input').addEventListener('change', (e)=> {
        // console.log(e.target.value);
        currentSong.volume = e.target.value/100;
        if(currentSong.volume === 0) {
            document.querySelector('.volume img').src = 'assets/mute.svg';
        }else {
            document.querySelector('.volume img').src = 'assets/sound.svg';
            
        }
    });
    let vol = document.querySelector(".volume").querySelector('input').value;
    document.querySelector(".volume img").addEventListener('click', (e)=> {
        if(currentSong.volume !== 0) {
            document.querySelector(".volume").querySelector('input').value = 0;
            currentSong.volume = 0;
            document.querySelector('.volume img').src = 'assets/mute.svg';
        }else{
            document.querySelector(".volume").querySelector('input').value = vol;
            currentSong.volume = vol/100;
            document.querySelector('.volume img').src = 'assets/sound.svg';
        }
        // vol = document.querySelector(".volume").querySelector('input').value;
    });
    

}

main();