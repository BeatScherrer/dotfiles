# only startx if not in schroot
export CHROOT="$SCHROOT_CHROOT_NAME"

if [[ -z "$CHROOT" && $(tty) == "/dev/tty1" ]]; then
  exec startx
  true
fi


export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# for java top task 
export _JAVA_AWT_WM_NONREPARENTING=1
. "$HOME/.cargo/env"

export QT_AUTO_SCREEN_SCALE_FACTOR=1
