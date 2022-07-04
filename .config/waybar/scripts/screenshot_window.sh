#!/bin/sh

# TODO add rofi menu to select between -s and fullscreen screenshots

# somehow sleep is needed to make this script work...
sleep 0.1

IMAGE_URL="/tmp/screenshot.png"

# select window
window="$(swaymsg -t get_tree | jq -j '.. | select(.type?) | select(.focused).rect | "\(.x),\(.y) \(.width)x\(.height)"')"
success = $(grim -g "$window" "$IMAGE_URL" | wl-copy)

if $success; then
	dunstify -h string:c-dunst-stack-tag:screenshot "screenshot of window taken" $IMAGE_URL -i $IMAGE_URL
fi