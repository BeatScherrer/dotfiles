#!/usr/bin/env sh

## Add this to your wm startup file

# Terminate already running instances
killall -q polybar

# Wait until process have been shut down
while pgrep -u $UID -x polybar >/dev/null; do sleep 1; done

# Launch Polybar
polybar -c ~/.config/polybar/config.ini top &
polybar -c ~/.config/polybar/config.ini bottom &
