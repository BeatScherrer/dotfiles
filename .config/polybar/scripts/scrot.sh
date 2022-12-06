#!/bin/sh

# TODO add rofi menu to select between -s and fullscreen screenshots

# somehow sleep is needed to make this script work...
sleep 0.1

IMAGE_URL="/tmp/screenshot.png"

scrot -o -s -- $IMAGE_URL

if [[ $? == 0 ]]; then
  dunstify -h string:c-dunst-stack-tag:screenshot "screenshot taken" $IMAGE_URL  -i $IMAGE_URL
  xclip -selection clipboard -t image/png -i $IMAGE_URL
fi

