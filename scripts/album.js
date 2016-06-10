var createSongRow = function(songNumber, songName, songLength) {
    var template = 
         '<tr class="album-view-song-item">'
        +   '<td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
        +   '<td class="song-item-title">' + songName + '</td>'
        +   '<td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
        +'</tr>'
        ;
    
    var $row = $(template);
    
    var onHover = function(event){
        var element = $(this).find('.song-item-number');
        if(element.data('song-number') != currentlyPlayingSongNumber){
            element.html(playButtonTemplate);
        } else if(currentSoundFile.isPaused()) {
            element.html(playButtonTemplate);
        }

    };
    
    var offHover = function(event){
        var element = $(this).find('.song-item-number');
        if(element.data('song-number') != currentlyPlayingSongNumber){
            element.html(element.data('song-number'));
        } else if(element.data('song-number') == currentlyPlayingSongNumber){
            if(currentSoundFile.isPaused()){
                element.html(element.data('song-number'));
            } else {
                element.html(pauseButtonTemplate);
            }   
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
    currentSoundFile.play();
    updatePlayerBarSong();
    updateSeekBarWhileSongPlays();
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
    currentSoundFile.play();
    updatePlayerBarSong();
    updateSeekBarWhileSongPlays();
};

var setSong = function(songNumber){
    if(currentSoundFile) {
        currentSoundFile.stop();
    }
    
    currentlyPlayingSongNumber = parseInt(songNumber);
    currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
    
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
    });
    
    setVolume(currentVolume);
};

var seek = function(){
    if(currentSoundFile){
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume){
    if(currentSoundFile){
        currentSoundFile.setVolume(volume);
    }
};

var getSongNumberCell = function(number){
    var $currentSongNumberElement = $('.song-item-number[data-song-number="' + number + '"]');
    return $currentSongNumberElement;
};

var updatePlayerBarSong = function(option){
    var songName = $('.song-name');
    var artist = $('.artist-name');
    var artistSongMobile = $('.artist-song-mobile');
    
    songName.html(currentSongFromAlbum.title);
    artist.html(currentAlbum.artist);
    artistSongMobile.html(currentSongFromAlbum.title + ' - ' + currentAlbum.artist);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
    
    $('.main-controls .play-pause').html(option === "play" ? playerBarPlayButton : playerBarPauseButton);
};

var setupSeekBars = function(){
    var $seekBars = $('.player-bar .seek-bar');
    
    
    $seekBars.click(function(event){
        var offsetX = event.pageX - $(this).offset().left;
        var barWidth = $(this).width();

        var seekBarFillRatio = offsetX / barWidth;

        updateSeekPercentage($(this), seekBarFillRatio);
        if($(this).parents('.currently-playing').length){
            if(currentSoundFile){
                currentSoundFile.setTime(Math.round(currentSoundFile.getDuration() * seekBarFillRatio));
            }
            
        } else {
            if(currentSoundFile){
                currentVolume = Math.round(seekBarFillRatio * 100)
                currentSoundFile.setVolume(currentVolume);
            }
        }
       
    });
    
    $seekBars.find('.thumb').mousedown(function(event){
        var $seekBar = $(this).parent();
        
        $(document).bind('mousemove.thumb', function(event){
            var offsetX = event.pageX - $seekBar.offset().left;
            var barWidth = $seekBar.width();
            var seekBarFillRatio = offsetX / barWidth;
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
        });
        
        $(document).bind('mouseup.thumb', function(){
            $(document).unbind('mousemove.thumb');
            $(document).unbind('mouseup.thumb');
        });
    });
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio){
    var offsetXPercent = seekBarFillRatio * 100;
    
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(100, offsetXPercent);
    
    var percentageString = offsetXPercent + '%';
    $seekBar.find('.fill').width(percentageString);
    $seekBar.find('.thumb').css({left: percentageString});
};

var updateSeekBarWhileSongPlays = function(){
    if(currentSoundFile){
        currentSoundFile.bind('timeupdate', function(event){
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');
            
            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime());
        });
    }
};

var setCurrentTimeInPlayerBar = function(currentTime){
    $('.current-time').html(filterTimeCode(currentTime));
};


var setTotalTimeInPlayerBar = function(totalTime){
    $('.total-time').html(filterTimeCode(totalTime));
};

var filterTimeCode = function(timeInSeconds){
    var minutes = Math.floor(parseFloat(timeInSeconds)/60);
    var seconds = ((parseFloat(timeInSeconds)/60 - minutes) * 60).toFixed(0);
    var formattedSeconds = seconds.length === 2 ? seconds : '0' + seconds;
    return minutes + ":" + formattedSeconds;
    
};

var clickHandler = function() {
	var songNumber = parseInt($(this).attr('data-song-number'));
    
	if (currentlyPlayingSongNumber != null) {
        if(currentlyPlayingSongNumber == songNumber){
            if(currentSoundFile.isPaused()){
                $(this).html(pauseButtonTemplate);
                currentSoundFile.play();
                updatePlayerBarSong("pause");
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                currentSoundFile.pause();
                updatePlayerBarSong("play");
            } 
        } else {
            var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
		currentlyPlayingCell.html(currentlyPlayingSongNumber);
            setSong(songNumber);
            currentSoundFile.play();
            $(this).html(pauseButtonTemplate);
            updatePlayerBarSong("pause");
            updateSeekBarWhileSongPlays();
        }
		
    } else {
        $(this).html(pauseButtonTemplate);
        setSong(songNumber);
        currentSoundFile.play();
        updatePlayerBarSong("pause");
        updateSeekBarWhileSongPlays();
    }
    
    currentSoundFile.setVolume(currentVolume);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentlyPlayingSongNumber = null;
var currentAlbum = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    setupSeekBars();
    $('.volume .seek-bar .fill').css('width', currentVolume);
    $('.volume .seek-bar .thumb').css('left', currentVolume);
    
});