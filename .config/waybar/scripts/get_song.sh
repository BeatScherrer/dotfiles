#!/bin/sh

# This script retrieves the information of the song currently played

#ARTIST=$(playerctl metadata artist)
#TITLE=$(playerctl metadata title)
#echo "$TITLE - $ARTIST"

# if spotify is started
if [ "$(pidof spotify)" ]; then
  # status can be: Playing, Paused or Stopped
  artist=$(dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata' 2>/dev/null | grep -A 2 -E "artist" | grep -vE "artist" | grep -vE "array" | cut -b 27- | cut -d '"' -f 1 | grep -vE ^$)
  title=$(dbus-send --print-reply --dest=org.mpris.MediaPlayer2.spotify /org/mpris/MediaPlayer2 org.freedesktop.DBus.Properties.Get string:'org.mpris.MediaPlayer2.Player' string:'Metadata' 2>/dev/null | grep -A 1 -E "title" | grep -vE "title" | cut -b 44- | cut -d '"' -f 1 | grep -vE ^$)

  echo "$title | $artist"
else
  title="$(playerctl metadata title)"
  artist="$(playerctl metadata artist)"
  echo "$title | $artist"
fi
