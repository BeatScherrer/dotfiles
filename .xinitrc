[[ -f ~/.Xresources ]] && xrdb -merge ~/.Xresources

systemctl --user import-environment DISPLAY

if [[ $(tty) == /dev/tty1 ]];then
  #echo "starting i3 on $(tty)..."
  #exec i3
## LeftWM
else
  echo "not starting a graphical interface on this tty!"
fi
