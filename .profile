# only startx if not in schroot
if [[ -f "/etc/debian_chroot" ]];then
  export CHROOT=$(cat /etc/debian_chroot)
fi

if [[ -z "$CHROOT" ]]; then
  #exec startx
  true
fi


export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# for java top task 
export _JAVA_AWT_WM_NONREPARENTING=1
. "$HOME/.cargo/env"
