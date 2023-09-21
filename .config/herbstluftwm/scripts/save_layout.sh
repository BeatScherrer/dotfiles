#!/bin/bash -i

LAYOUT_PATH="$HOME/.config/herbstluftwm/layouts"

if [[ -d "$LAYOUT_PATH" ]]; then
  mkdir -p "$LAYOUT_PATH"
fi

LAYOUT_NAME=$(rofi -dmenu -p "Enter the name of the new layout")
herbstclient dump >"${LAYOUT_PATH}/${LAYOUT_NAME}"
