var updateListTimer = null;

function updateDownloadList() {
  var active = chrome.extension.getBackgroundPage().downloadsActive;
  var queued = chrome.extension.getBackgroundPage().downloadsQueued;
  var complete = chrome.extension.getBackgroundPage().downloadsComplete;
  var listActive = $('#active');
  var listQueued = $('#queued');
  var listComplete = $('#complete');

  listActive.html('');
  for (var i = 0; i < active.length; ++i) {
    var item = active[i];
    var html = '<div>';
    html += '<span class="number">' + item.number + '</span>';
    html += '. ';
    html += '<span class="artist">' + item.artist + '</span>';
    html += ' - ';
    html += '<span class="name">' + item.name + '</span>';
    html += '</div>'
    listActive.append($(html));
  }

  listQueued.html('');
  for (var i = 0; i < queued.length; ++i) {
    var item = queued[i];
    var html = '<div>';
    html += '<span class="number">' + item.number + '</span>';
    html += '. ';
    html += '<span class="artist">' + item.artist + '</span>';
    html += ' - ';
    html += '<span class="name">' + item.name + '</span>';
    html += '</div>'
    listQueued.append($(html));
  }

  listComplete.html('');
  for (var i = 0; i < complete.length; ++i) {
    var item = complete[i];
    var html = '<div>';
    html += '<span class="number">' + item.number + '</span>';
    html += '. ';
    html += '<span class="artist">' + item.artist + '</span>';
    html += ' - ';
    html += '<span class="name">' + item.name + '</span>';
    html += '</div>'
    listComplete.append($(html));
  }
}

$(document).ready(function(){
  updateDownloadList();
  updateListTimer = setInterval(updateDownloadList, 1000);
});
