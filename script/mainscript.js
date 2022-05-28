const socket = io("/");
const videoGrid = document.getElementById("video-grid");

//adding name in chatbox//
const username = prompt("Please enter your name", "<name goes here>");
$(".messages").append(`<div class="messages_center">you joined<br></div>`);
socket.emit("new-user", username);
//here it ends//

const peer = new Peer(undefined);
let myVideoStream;
const myVideo = document.createElement("video");

myVideo.muted = false;
const peers = {};
let currentPeer;

//const constraintsVideo = {
//  audio:false,
//  video:true,
//}
//const constraintsAudio = {
////  audio:true,
//}

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 44100,
    },
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      console.log("answering call");
      call.answer(stream);
      const video = document.createElement("video");

      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
        currentPeer = call.peerConnection;
      });
    });

    peer.on("close", (roomID, userID) => {
      socket.emit("video-disconnect", roomID, userID);
    });

    socket.on("user-connected", (userId) => {
      console.log("user-connected");
      connectToNewUser(userId, stream);
    });

    socket.on("user-joined", (username) => {
      console.log("user-name: " + username);
      $(".messages").append(
        `<div class="messages_center"><b>${username}</b> joined the chat<br></div>`
      );
    });

    peer.on("open", (id) => {
      console.log(id);
      socket.emit("join-room", ROOM_ID, id);
    });

    socket.on("chat-message", (data) => {
      console.log(data.name);
      $(".messages").append(
        `<div class="messages_left"><span> <img src="https://i1.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?fit=256%2C256&quality=100" class="chat_pic" /><b>${data.name}</b>:&nbsp${data.message}</div>`
      );
    });
    socket.on("raised-hand", (data) => {
      console.log(data.name);
      $(".messages").append(
        `<div class="messages_center raisehand "><b>${data.name}&nbsp </b>raised his hand &nbsp<i class="fa fa-hand-paper-o" aria-hidden="true"></i></div>`
      );
    });

    socket.on("disconnected", (username, userID) => {
      console.log(userID);
      console.log(" disconnected user-name: " + username);
      $(".messages").append(
        `<div class="messages_center"><b>${username}</b> left the chat<br></div>`
      );
      if (peers[socket.id]) peers[socket.id].close();
    });

    socket.on("user-disconnected", (userID) => {
      if (peers[userID]) {
        peers[userID].close();
        video.remove();
      }
    });
  });

const connectToNewUser = (userID, stream) => {
  console.log("new user connected");
  console.log(userID);
  const call = peer.call(userID, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
    currentPeer = call.peerConnection;
  });

  call.on("close", () => {
    video.remove();
  });

  peers[userID] = call;
};

const addVideoStream = (video, stream) => {
  console.log("my video appended");
  video.srcObject = stream;

  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

//Sending message on pressing enter button//
let msgtext = $("input#chat_message");
$("html").keydown((e) => {
  if (e.which == 13 && msgtext.val().length != 0) {
    console.log(msgtext);
    $(".messages").append(
      `<div class="messages_right"><span> <img src="https://i1.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?fit=256%2C256&quality=100" class="chat_pic" /></span><b>Me:&nbsp</b> ${msgtext.val()}</div>`
    );
    socket.emit("message", msgtext.val());

    msgtext.val("");
  }
});
function RaiseHand() {
  $(".messages").append(
    `<div class="messages_center raisehand"><b> ME raised the hand &nbsp <i class="fa fa-hand-paper-o" aria-hidden="true"></i></div>`
  );
  socket.emit("raise-hand");
}
// ------//

const scrollToBottom = () => {
  var d = $(".main__chat_window");
  d.scrollTop(d.prop("scrollHeight"));
};

//Code To Start and Stop our audio and Video//

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `;
  document.querySelector(".main__mute_button").innerHTML = html;
};

const playStop = () => {
  console.log("object");
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;

    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  const name = `<div class="video_name">MUKesh</div>`;
  document.querySelector(".main__video_button").innerHTML = html;
  document.querySelector("video").innerHTML = name;
};

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector(".main__video_button").innerHTML = html;
};
// Here it ends //

wt.onReady(() => console.log("ready"));

/*  <--Screen Sharing Code --> */

const shareScreen = () => {
  navigator.mediaDevices
    .getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    .then((stream) => {
      const videoTrack = stream.getVideoTracks()[0];

      videoTrack.onended = () => {
        const videoTrack = stream;
        // //const videoTrack = this.lazyStream.getVideoTracks()[0];
        const sender = currentPeer
          .getSenders()
          .find((s) => s.track.kind === videoTrack.kind);
        sender?.replaceTrack(videoTrack);
      };
      //console.log(currentPeer);
      // const sender = this.currentPeer
      const sender = currentPeer
        .getSenders()
        .find((s) => s.track.kind === videoTrack.kind);
      sender?.replaceTrack(videoTrack);
    })
    .catch((err) => {
      console.log("Unable to get display media " + err);
    });
};

/*  <--Screen Sharing Code ends --> */
