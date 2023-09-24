case $- in
# Enable the subsequent settings only in interactive sessions
*i*) ;;
*) return ;;
esac

export XDG_CONFIG_HOME="$HOME/.config"
export XDG_CACHE_HOME="$HOME/.cache"
export XDG_DATA_HOME="$HOME/.local/share"
export XDG_STATE_HOME="$HOME/.local/state"

# Path to your oh-my-bash installation.
export OSH="${HOME}/.oh-my-bash"
export SYSTEMD_EDITOR=vim
# export GIT_EDITOR="NVR --remote-tab-wait + 'set bufhidden=delete'"

export FZF_DEFAULT_COMMAND="rg --files --hidden --follow --glob '!.git'"
fzfe() {
  echo -n "" | fzf --print-query --prompt="Enter regex> " --preview='echo {} | highlight --syntax regex'
}

PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# Set name of the theme to load. Optionally, if you set this to "random"
# it'll load a random theme each time that oh-my-bash is loaded.
OSH_THEME="beat"

[[ $- == *i* ]] && source "$HOME/.local/share/blesh/ble.sh" --rcfile "$HOME/.config/blesh/init.sh"

PATH="$HOME/.local/bin/:$PATH"

# To disable the uses of "sudo" by oh-my-bash, please set "false" to
# this variable.  The default behavior for the empty value is "true".
OMB_USE_SUDO=true

# Which completions would you like to load? (completions can be found in ~/.oh-my-bash/completions/*)
# Custom completions may be added to ~/.oh-my-bash/custom/completions/
# Example format: completions=(ssh git bundler gem pip pip3)
# Add wisely, as too many completions slow down shell startup.
completions=(
  git
  composer
  ssh
)

# Which aliases would you like to load? (aliases can be found in ~/.oh-my-bash/aliases/*)
# Custom aliases may be added to ~/.oh-my-bash/custom/aliases/
# Example format: aliases=(vagrant composer git-avh)
# Add wisely, as too many aliases slow down shell startup.
aliases=(
  # general
)

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-bash/plugins/*)
# Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(
  git
  bashmarks
)

# Which plugins would you like to conditionally load? (plugins can be found in ~/.oh-my-bash/plugins/*)
# Custom plugins may be added to ~/.oh-my-bash/custom/plugins/
# Example format:
#  if [ "$DISPLAY" ] || [ "$SSH" ]; then
#      plugins+=(tmux-autoattach)
#  fi

# shellcheck source=/home/beat/.oh-my-bash/oh-my-bash.sh
source "$OSH"/oh-my-bash.sh

# User configuration
# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="~/.ssh/rsa_id"

export DISPLAY=${DISPLAY:-:1}

vpn() {
  local target="$1"
  local state="$2"

  nmcli connection "$state" "$target"
}

wake() {
  local target="$1"

  if [[ "$target" == "smolboi" ]]; then
    wakeonlan b4:2e:99:a1:4d:aa
  else
    echo "target not found"
  fi
}

pacmanSearch() {
  pacman -Qq | fzf --preview 'pacman -Qil {}' --layout=reverse --bind 'enter:execute(pacman -Qil {} | less)'
}

export FZF_DEFAULT_COMMAND="rg --files --hidden --follow --glob '!.git'"

. "$HOME/.aliases"
. "$HOME/.aliases_mt"
. "$HOME/.bashrc_mt"

export NVM_DIR="$HOME/.nvm"
# shellcheck source=/dev/null
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
# shellcheck source=/dev/null
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

export SIMULATION_CONFIG="$HOME/sim_config.xml"

. "$HOME/.cargo/env"
[[ -f "/home/beat/workspace/mtrsys/sim/build/sim/sim_helpers.bash" ]] && source "/home/beat/workspace/mtrsys/sim/build/sim/sim_helpers.bash"
