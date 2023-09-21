#!/bin/bash -i

SELECTION=$(find ~/.config/herbstluftwm/layouts -type f -exec basename {} \; | rofi -dmenu -p "Choose a Layout" -i)
herbstclient load "$(cat "${HOME}/.config/herbstluftwm/layouts/${SELECTION}")"
