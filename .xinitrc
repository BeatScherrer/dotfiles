[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources

systemctl --user import-environment DISPLAY

## bspwm
if [[ $(tty) == /dev/tty1 ]];then
  echo "starting i3 on $(tty)..."
  exec i3
## LeftWM
elif [[ $(tty) == /dev/tty2 ]]; then
  echo "starting bspwm on $(TTY)..."
  exec bspwm
else
  echo "not starting a graphical interface on this tty!"
fi
