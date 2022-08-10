// //import BeautyExtension from "./index.d.ts";
//import VirtualBackgroundExtension from "agora-extension-virtual-background";

const APP_ID = "2f15e840dcf64849b0f990f2f7979f5e";
const TOKEN = "00690a069531dc34b2abb8b269dc98fb8c2IACRoXbd/NGnyOa5pritNGM47P//CCEpN864h6oOLxjb+42svfQAAAAAEACOhaHHGFH0YgEAAQAZUfRi";
const CHANNEL = "dang";

let joinBtn = document.querySelector('#join-btn');
let leaveBtn = document.querySelector('#leave-btn');
let micBtn = document.querySelector('#mic-btn');
let cameraBtn = document.querySelector('#camera-btn');

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'});
// const extension = new BeautyExtension();
// AgoraRTC.registerExtensions([extension]);
// const processor = extension.createProcessor();
// localTracks.videoTrack.pipe(processor).pipe(localTracks.videoTrack.processorDestination);

// //await processor.enable();
// processor.setOptions({
//         // Set the contrast level as high (2)
//         lighteningContrastLevel: 2,
//         // Set the brightness level
//         lighteningLevel: 0.7,
//         // Set the smoothness level
//         smoothnessLevel: 0.6,
//         // Set the sharpness level
//         sharpnessLevel: 0.5,
//         // Set the redness level
//         rednessLevel: 0.5
// }); 



let localTracks = [];
let remoteUsers = {};

let joinAndDisplayLocalStream = async () => {

    client.on('user-published', handleUserJoined);
    
    client.on('user-left', handleUserLeft);
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null);

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks();

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.querySelector('#video-streams').insertAdjacentHTML('beforeend', player);

    localTracks[1].play(`user-${UID}`);
    
    await client.publish([localTracks[0], localTracks[1]]);
};

let joinStream = async () => {
    await joinAndDisplayLocalStream();
    joinBtn.style.display = 'none';
    document.querySelector('#stream-controls').style.display = 'flex';
};

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user;
    await client.subscribe(user, mediaType);

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`);
        if (player != null){
            player.remove();
        };

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.querySelector('#video-streams').insertAdjacentHTML('beforeend', player);

        user.videoTrack.play(`user-${user.uid}`);
    };

    if (mediaType === 'audio'){
        user.audioTrack.play();
    };
};

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid];
    document.getElementById(`user-container-${user.uid}`).remove();
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop();
        localTracks[i].close();
    };

    await client.leave();
    joinBtn.style.display = 'block';
    document.querySelector('#stream-controls').style.display = 'none';
    document.querySelector('#video-streams').innerHTML = '';
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false);
        e.target.innerHTML = '<img src="images/Muted.png" />';
    }else{
        await localTracks[0].setMuted(true);
        e.target.innerHTML = '<img src="images/Unmuted.png" />';
    };
};

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false);
        e.target.innerHTML = '<img src="images/CameraOff.png" />';
    }else{
        await localTracks[1].setMuted(true);
        e.target.innerHTML = '<img src="images/CameraOn.png" />';
    };
};

joinBtn.addEventListener('click', joinStream);
leaveBtn.addEventListener('click', leaveAndRemoveLocalStream);
micBtn.addEventListener('click', toggleMic);
cameraBtn.addEventListener('click', toggleCamera);