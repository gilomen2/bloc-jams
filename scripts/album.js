var createSongRow = function(songNumber, songName, songLength) {
    var template = 
         '<tr class="album-view-song-item">'
        +   '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        +   '<td class="song-item-title">' + songName + '</td>'
        +   '<td class="song-item-duration">' + songLength + '</td>'
        +'</tr>'
        ;
    
    var $row = $(template);
    
    var onHover = function(event){
        var element = $(this).find('.song-item-number');
        if(element.data('song-number') != currentlyPlayingSongNumber){
            element.html(playButtonTemplate);
        }

    };
    
    var offHover = function(event){
        var element = $(this).find('.song-item-number');
        if(element.data('song-number') != currentlyPlayingSongNumber){
            element.html(element.data('song-number'));
        } else if(element.data('song-number') == currentlyPlayingSongNumber){
            element.html(pauseButtonTemplate);
        }

    };
    
    $row.find('.song-item-number').click(clickHandler);
    $row.hover(onHover, offHover);
    
    return $row;
};

var setCurrentAlbum = function(album){
    currentAlbum = album;
    var $albumTitle = $('.album-view-title');
    var $albumArtist = $('.album-view-artist');
    var $albumReleaseInfo = $('.album-view-release-info');
    var $albumImage = $('.album-cover-art');
    var $albumSongList = $('.album-view-song-list');
    
    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);
    
    $albumSongList.empty();
    
    for(var i = 0; i < album.songs.length; i++){
        var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
        $albumSongList.append($newRow);
    }  
};

var trackIndex = function(album, song){
    return album.songs.indexOf(song);
};

var nextSong = function(){
    var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var $currentSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
    var songCount = currentAlbum.songs.length;
    
    if(currentIndex === songCount - 1){
        $currentSongNumberElement.html(currentlyPlayingSongNumber);
        setSong(1);
    } else {
        $currentSongNumberElement.html(currentlyPlayingSongNumber);
        setSong(currentlyPlayingSongNumber + 1);
    }
    var $nextSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
    $nextSongNumberElement.html(pauseButtonTemplate);
    updatePlayerBarSong();
};

var previousSong = function(){
    var currentIndex = trackIndex(currentAlbum, currentSongFromAlbum);
    var $currentSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
    var songCount = currentAlbum.songs.length;
    
    if(currentIndex === 0){
        $currentSongNumberElement.html(currentlyPlayingSongNumber);
        setSong(songCount);
    } else {
        $currentSongNumberElement.html(currentlyPlayingSongNumber);
        setSong(currentlyPlayingSongNumber - 1);
    }
    var $prevSongNumberElement = getSongNumberCell(currentlyPlayingSongNumber);
    $prevSongNumberElement.html(pauseButtonTemplate);
    updatePlayerBarSong();
};

var setSong = function(songNumber){
    currentlyPlayingSongNumber = songNumber;
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function(number){
    var $currentSongNumberElement = $('.song-item-number[data-song-number="' + number + '"]');
    return $currentSongNumberElement;
};

var updatePlayerBarSong = function(){
    var songName = $('.song-name');
    var artist = $('.artist-name');
    var artistSongMobile = $('.artist-song-mobile');
    
    songName.html(currentSongFromAlbum.title);
    artist.html(currentAlbum.artist);
    artistSongMobile.html(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
    
    $('.main-controls .play-pause').html(playerBarPauseButton);
};


var clickHandler = function() {
	var songNumber = parseInt($(this).attr('data-song-number'));
    
	if (currentlyPlayingSongNumber != null) {
        if(currentlyPlayingSongNumber == songNumber){
            $(this).html(playButtonTemplate);
            currentlyPlayingSongNumber = null;
            currentSongFromAlbum = null;
            $('.main-controls .play-pause').html(playerBarPlayButton);
        } else {
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
            setSong(songNumber);
            updatePlayerBarSong();
            
        }
		
    } else {
        $(this).html(pauseButtonTemplate);
        setSong(songNumber);
        updatePlayerBarSong();
    }
    
    
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentlyPlayingSongNumber = null;
var currentAlbum = null;
var currentSongFromAlbum = null;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
});