var findAlbumTimer = setInterval(findAlbum, 1000);

function findAlbum() {
  if ($('.album-header__number-of-tracks').length) {
    if ($('.album-download').length) {
      // We already added a download link to this album
      return;
    }

    var link = $('<a href="#" class="album-download">Download All</a>');
    $('.album-header__number-of-tracks').append('<span> - </span>');
    $('.album-header__number-of-tracks').append(link);

    link.click(function() {
      var album = {
        name: $('.album-header__title').text(),
        artist: $('.album-header__artist-name').text(),
        year: $('.album-header__release-year').text(),
        tracks: []
      };

      var folder = album.artist + ' - ' + album.name;
      folder = folder.replace(/[\/:*?"<>|]/g, '');

      $('.js-track-list').find('.js-tracklist__row').each(function() {
        var self = $(this);
        var track = {
          id: self.find('a[title=Play]').attr('data-id'),
          number: self.children('.track-list__number').text(),
          artist: self.children('.track-list__artist').text(),
          name: self.children('.track-list__title').text()
        };

        track.filename = track.number
                       + '. ' + track.artist
                       + ' - ' + track.name
                       + '.flac';

        track.filename = folder
                       + '/' + track.filename.replace(/[\/:*?"<>|]/g, '');

        album.tracks.push(track);
      });

      chrome.runtime.sendMessage({downloadAlbum: album});
    });
  }
}
