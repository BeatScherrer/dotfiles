#!/bin/bash
source "./colors.bash"

export VERBOSE=true

export ERROR=0
export WARN=1
export INFO=2
export DEBUG=3

# default log level
export LOG_LEVEL="$INFO"

log() {
  if [[ "${VERBOSE}" == true ]]; then
    "$@"
  else
    "$@" >/dev/null
  fi
}

debug() {
  if ((LOG_LEVEL >= DEBUG)); then
    echo -en "${LGRAY}"
    log "$@"
    echo -en "${RESET}"
  else
    "$@" >/dev/null
  fi
}

info() {
  if ((LOG_LEVEL >= INFO)); then
    echo -en "${LGREEN}"
    log "$@"
    echo -en "${RESET}"
  else
    "$@" >/dev/null
  fi
}

warn() {
  if ((LOG_LEVEL >= WARN)); then
    echo -en "${YELLOW}"
    log "$@"
    echo -en "${RESET}"
  else
    "$@" >/dev/null
  fi
}

error() {
  if ((LOG_LEVEL >= ERROR)); then
    echo -en "${RED}"
    log "$@"
    echo -en "${RESET}"
  else
    "$@" >/dev/null
  fi
}

# debug echo "debug"
# info echo "info"
# warn echo "warn"
# error echo "error"
