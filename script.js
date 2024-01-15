let currentSong = new Audio();
const play = document.getElementById('play');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
let songs;
let folder = "ncr";



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
            <img class="invert svg-w" src="music.svg" alt="">
            <div class="song-info">
                <div class="song-name">${song.name}</div>
                <div class="singer">Ak</div>
            </div>
            <div class="play-song">
                <span>Play now</span>
                <img class="invert svg-w" src="play1.svg" alt="">
            </div>
        </div>
    </li>`
    })
    
    let lis = document.querySelector('.songs-library').getElementsByTagName('li');
    Array.from(lis).forEach((li) => {
        li.addEventListener('click', ()=> {
            // console.log((li).querySelector(".song-info"))
            playMusic((li).querySelector(".song-name").innerHTML, folder)
            console.log((li).querySelector(".song-name").innerHTML)
            // console.log("first")
        })
    })

}

const playMusic = (song, folder, pause=false) => {
    currentSong.src = `/songs/${folder}/${song}`;
    (document.querySelector(".song-time")).innerHTML = `00:00/00:00`;
    if(!pause) {
        currentSong.play();
        play.src = 'pause.svg';
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
            play.src = 'pause.svg';
        }
        else {
            currentSong.pause();
            play.src = 'play.svg';
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
            document.querySelector('.volume img').src = 'mute.svg';
        }else {
            document.querySelector('.volume img').src = 'sound.svg';
            
        }
    });
    let vol = document.querySelector(".volume").querySelector('input').value;
    document.querySelector(".volume img").addEventListener('click', (e)=> {
        if(currentSong.volume !== 0) {
            document.querySelector(".volume").querySelector('input').value = 0;
            currentSong.volume = 0;
            document.querySelector('.volume img').src = 'mute.svg';
        }else{
            document.querySelector(".volume").querySelector('input').value = vol;
            currentSong.volume = vol/100;
            document.querySelector('.volume img').src = 'sound.svg';
        }
        // vol = document.querySelector(".volume").querySelector('input').value;
    });
    

}

main();