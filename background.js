var sessionId = null;
var downloadsActive = [];
var downloadsQueued = [];
var downloadsComplete = [];
var queued = 0;
var downloaded = 0;

var canvas = document.createElement('canvas');
canvas.id     = "icon";
canvas.width  = 19;
canvas.height = 19;
document.body.appendChild(canvas);

function startIconDraw() {
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 19, 19);

  // Logo
  ctx.font = "bold 15px sans-serif";
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgb(120, 120, 120)';
  ctx.fillText('T', 8.5, 10);

  // Empty circle
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgb(180, 200, 180)';
  ctx.beginPath();
  ctx.arc(9.5, 9.5, 8, 0, 2 * Math.PI);
  ctx.stroke();

  return ctx;
}

function endIconDraw(ctx) {
  var imageData = ctx.getImageData(0, 0, 19, 19);
  chrome.browserAction.setIcon({
    imageData: imageData
  });
}

function setIconIdle() {
  var ctx = startIconDraw();
  endIconDraw(ctx);
}

function setIconProgress(progress) {
  var ctx = startIconDraw();

  // Progress circle
  progress = progress * 2 * Math.PI;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgb(20, 200, 20)';
  ctx.beginPath();
  ctx.arc(9.5, 9.5, 8, - 0.5 * Math.PI, progress - 0.5 * Math.PI);
  ctx.stroke();

  // Update icon
  endIconDraw(ctx);
}

function setIconError() {
  var ctx = startIconDraw();

  // Progress circle
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgb(250, 150, 150)';
  ctx.beginPath();
  ctx.arc(9.5, 9.5, 8, 0, 2 * Math.PI);
  ctx.stroke();

  // Update icon
  endIconDraw(ctx);
}

setIconIdle();

// Listen for downloadAlbum request
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.downloadAlbum) {
      downloadsQueued = downloadsQueued.concat(request.downloadAlbum.tracks);

      if (downloadsActive.length === 0) {
        downloaded = 0;
        queued = downloadsQueued.length;
        downloadNextTrack();
      } else {
        queued += request.downloadAlbum.tracks.length;
      }
    }
  }
);

// Download track
function downloadTrack(track) {
  var xhr = new XMLHttpRequest();
  var url = 'https://listen.tidalhifi.com/v1/tracks/' + track.id
          + '/streamUrl?soundQuality=LOSSLESS&sessionId=' + sessionId
          + '&countryCode=GB';

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
      var response = JSON.parse(xhr.responseText);
      chrome.downloads.download({
        url: response.url,
        filename: track.filename,
        headers: [{name: 'Range', value: 'bytes=0-9999999999'}]
      }, function(id) {
        if (id !== undefined && id !== null) {
          track.download = id;
        } else {
          console.log('Error downloading track', track);
        }
      });
    }
  }

  xhr.open("GET", url, true);
  xhr.send();
  downloadsActive.push(track);
}

// Start next download
function downloadNextTrack() {
  if (downloadsQueued.length) {
    downloadTrack(downloadsQueued.splice(0, 1)[0]);
  }
}

// Monitor downloads to find when track completes to move onto next track
chrome.downloads.onChanged.addListener(function(downloadDelta) {
  for (var i = 0; i < downloadsActive.length; ++i) {
    if (downloadsActive[i].download === downloadDelta.id) {
      if (downloadDelta.state && downloadDelta.state.current === 'complete') {
        downloadsComplete = downloadsComplete.concat(downloadsActive.splice(i, 1));
        downloaded++;
        downloadNextTrack();
        setIconProgress(downloaded / queued);
        break;
      }

      if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
        queued = 0;
        downloaded = 0;
        downloadsActive = [];
        downloadsQueued = [];
        setIconError();
        break;
      }
    }
  }
});

// Find sessionId by monitor http requests
chrome.webRequest.onBeforeRequest.addListener(
  function(info) {
    console.log(info.url);
    var match = info.url.match('sessionId=[a-zA-Z0-9\-]*');

    if (match) {
      match = match[0];
      match = match.substr(match.indexOf('=') + 1);
      sessionId = match;
    }

    return { cancel: false };
  },
  {
    urls: [
      "http://*.tidalhifi.com/*",
      "https://*.tidalhifi.com/*"
    ]
  },
  ["blocking"]
);
