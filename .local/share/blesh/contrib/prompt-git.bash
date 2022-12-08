# blesh/contrib/prompt-git.bash (C) 2020-2021, akinomyoga

# bleopt prompt_rps1='\q{contrib/git-info}'
# bleopt prompt_rps1='\q{contrib/git-name}'
# bleopt prompt_rps1='\q{contrib/git-hash}'
# bleopt prompt_rps1='\q{contrib/git-branch}'
# bleopt prompt_rps1='\q{contrib/git-path}'

ble-import contrib/prompt-defer

#------------------------------------------------------------------------------

_ble_contrib_prompt_git_data=()
_ble_contrib_prompt_git_base=
_ble_contrib_prompt_git_base_dir=
_ble_contrib_prompt_git_vars=(git_base git_base_dir)

## @fn ble/contrib/prompt-git/.check-gitdir path
##   @var[out] git_base git_base_dir
function ble/contrib/prompt-git/.check-gitdir {
  local path=$1
  [[ -f $path/.git/HEAD ]] || return 1
  ble/prompt/unit/assign _ble_contrib_prompt_git_base     "$path"
  ble/prompt/unit/assign _ble_contrib_prompt_git_base_dir "$path/.git"
  return 0
}
## @fn ble/contrib/prompt-git/.check-submodule path
##   @var[out] git_base git_base_dir
function ble/contrib/prompt-git/.check-submodule {
  local path=$1 content
  [[ -f $path/.git ]] || return 1
  ble/util/mapfile content < "$path/.git"
  [[ $content == 'gitdir:'* ]] || return 1
  local git_base=$path
  local git_base_dir=${content#'gitdir:'}
  git_base_dir=${git_base_dir#' '}
  [[ $git_base_dir == /* ]] ||
    git_base_dir=$path/$git_base_dir
  [[ -f $git_base_dir/HEAD ]]
  ble/prompt/unit/assign _ble_contrib_prompt_git_base     "$git_base"
  ble/prompt/unit/assign _ble_contrib_prompt_git_base_dir "$git_base_dir"
  return 0
}
function ble/prompt/unit:_ble_contrib_prompt_git/update {
  ble/prompt/unit/add-hash '$PWD'

  type git &>/dev/null || return 1
  # [[ $(git rev-parse --is-inside-work-tree 2> /dev/null) ]]
  local path=$PWD found=
  while
    if ble/contrib/prompt-git/.check-gitdir "$path"; then
      [[ $prompt_unit_changed ]]
      return "$?"
    elif ble/contrib/prompt-git/.check-submodule "$path"; then
      [[ $prompt_unit_changed ]]
      return "$?"
    fi
    [[ $path == */* ]]
  do path=${path%/*}; done

  ble/prompt/unit/assign _ble_contrib_prompt_git_base ''
  [[ $prompt_unit_changed ]]
}

## @fn ble/contrib/prompt-git/initialize
##   @var[out] git_base git_base_dir
function ble/contrib/prompt-git/initialize {
  ble/prompt/unit#update _ble_contrib_prompt_git
  ble/util/restore-vars _ble_contrib_prompt_ "${_ble_contrib_prompt_git_vars[@]}"
  [[ $git_base ]]
}

## @fn ble/contrib/prompt-git/check-dirty
##   現在の working tree に編輯があるかどうかを非同期で取得します。
##   @var[in] git_base
_ble_contrib_prompt_git_dirty=0
ble/contrib/prompt-defer/clear _ble_contrib_prompt_git_dirty
function ble/contrib/prompt-defer:_ble_contrib_prompt_git_dirty/clear { _ble_contrib_prompt_git_dirty=0; }
function ble/contrib/prompt-defer:_ble_contrib_prompt_git_dirty/worker {
  # git 1.7.2 (2010-09) supports --ignore-submodules=untracked
  git status --porcelain --ignore-submodules=untracked | ble/bin/awk '
    /^[^ ?]./ { staged = 1;}
    /^.[^ ?]/ { unstaged = 1;}
    /^\?\?/ { untracked = 1; }
    END {
      if (unstaged) exit 1;
      if (staged) exit 2;
      if (untracked) exit 3;
      exit 0
    }
  '
}
function ble/contrib/prompt-defer:_ble_contrib_prompt_git_dirty/callback { _ble_contrib_prompt_git_dirty=$?; }
function ble/contrib/prompt-git/check-dirty {
  [[ $_ble_contrib_prompt_git_base ]] || return 0
  ble/contrib/prompt-defer/submit _ble_contrib_prompt_git_dirty "$_ble_contrib_prompt_git_base" ''
  ble/prompt/unit/add-hash '$_ble_contrib_prompt_git_dirty'
  return "$_ble_contrib_prompt_git_dirty"
}
function ble/contrib/prompt-git/is-dirty { ble/contrib/prompt-git/check-dirty; (($?!=0&&$?!=3)); }

## @fn ble/contrib/prompt-git/get-head-information
##   @var[out] hash branch
function ble/contrib/prompt-git/get-head-information {
  branch= hash=

  local head_file=$git_base_dir/HEAD
  [[ -s $head_file ]] || return
  local content; ble/util/mapfile content < "$head_file"

  if [[ $content == *'ref: refs/heads/'* ]]; then
    branch=${content#*refs/heads/}

    local branch_file=$git_base_dir/refs/heads/$branch
    [[ -s $branch_file ]] || return
    local content; ble/util/mapfile content < "$branch_file"
  fi

  [[ ! ${content//[0-9a-fA-F]} ]] && hash=$content
  return 0
}
## @fn ble/contrib/prompt-git/get-tag-name hash
##   @var[out] tag
function ble/contrib/prompt-git/get-tag-name {
  # ble/util/assign-array tag 'git describe --tags --exact-match 2>/dev/null'
  tag=
  local hash=$1; [[ $hash ]] || return 1

  local file tagsdir=$git_base_dir/refs/tags hash1
  local files ret; ble/util/eval-pathname-expansion '"$tagsdir"/*'; files=("${ret[@]}")
  for file in "${files[@]}"; do
    local tag1=${file#$tagsdir/}
    [[ -s $file ]] || continue
    ble/util/mapfile hash1 < "$file"
    if [[ $hash1 == "$hash" ]]; then
      tag=$tag1
      return
    fi
  done
}

function ble/contrib/prompt-git/describe-head/.determine-state {
  local opts=$1
  # https://github.com/git/git/blob/4fd6c5e44459e6444c2cd93383660134c95aabd1/contrib/completion/git-prompt.sh#L452-L475
  # https://github.com/git/git/blob/4fd6c5e44459e6444c2cd93383660134c95aabd1/contrib/completion/git-prompt.sh#L312-L333
  if [[ -d $git_base_dir/rebase-merge ]]; then
    ret=REBASE
  elif [[ -d $git_base_dir/rebase-apply ]]; then
    if [[ -f $git_base_dir/rebase-apply/rebasing ]]; then
      ret=REBASE
    elif [[ -f $git_base_dir/rebase-apply/applying ]]; then
      ret=AM
    else
      ret=AM/REBASE
    fi
  elif [[ -f $git_base_dir/MERGE_HEAD ]]; then
    ret=MERGING
  elif [[ -f $git_base_dir/CHERRY_PICK_HEAD ]]; then
    ret=CHERRY-PICKING
  elif [[ -f $git_base_dir/REVERT_HEAD ]]; then
    ret=REVERTING
  elif
    local todo= rest IFS=$_ble_term_IFS TMOUT= 2>/dev/null # #D1630 WA readonly TMOUT
    [[ -f $git_base_dir/sequencer/todo ]] &&
      builtin read "${_ble_bash_tmout_wa[@]}" -r todo rest < "$git_base_dir/sequencer/todo"
    [[ $todo == p || $todo == pick ]]; then
    ret=CHERRY-PICKING
  elif [[ $todo == revert ]]; then
    ret=REVERTING
  elif [[ -f $git_base_dir/BISECT_LOG ]]; then
    ret=BISECTING
  elif [[ :$opts: == *:detached:* ]]; then
    ret=DETACHED
  else
    ret=
  fi

  case $ret in
  (REBASE)         ret=$'\e[1;48;5;27;38;5;231m '$ret$' \e[m' ;;
  (AM | AM/REBASE) ret=$'\e[1;48;5;34;38;5;231m '$ret$' \e[m' ;;
  (MERGING)        ret=$'\e[1;48;5;172;38;5;231m '$ret$' \e[m' ;;
  (CHERRY-PICKING) ret=$'\e[1;48;5;200;38;5;231m '$ret$' \e[m' ;;
  (REVERTING)      ret=$'\e[1;48;5;124;38;5;231m '$ret$' \e[m' ;;
  (BISECTING)      ret=$'\e[1;48;5;93;38;5;231m '$ret$' \e[m' ;;
  (DETACHED)       ret=$'\e[91m'$ret$'\e[m' ;;
  (?*)             ret=$'\e[1;48;5;242;38;5;231m '$ret$' \e[m' ;;
  esac

  [[ $ret ]]
}

function ble/contrib/prompt-git/describe-head {
  local opts=:$1:
  ret=

  local dirty_mark=
  [[ $opts == *:check-dirty:* ]] &&
    { ble/contrib/prompt-git/check-dirty;
      case $? in
      (1) dirty_mark=$'\e[1;38:5:202m*\e[m' ;;
      (2) dirty_mark=$'\e[1;32m*\e[m' ;;
      (3) dirty_mark=$'\e[1;94m+\e[m' ;;
      esac }

  local hash branch
  ble/contrib/prompt-git/get-head-information
  if [[ $branch ]]; then
    local sgr=$'\e[1;34m' sgr0=$'\e[m'
    local out=$sgr$branch$sgr0
    if [[ $opts == *:add-hash:* && $hash ]]; then
      out="$out (${hash::7}$dirty_mark)"
    else
      out=$out$dirty_mark
    fi

    [[ $opts == *:check-state:* ]] &&
      ble/contrib/prompt-git/describe-head/.determine-state &&
      out="$ret $out"
    ret=$out
    return
  fi

  local tag
  ble/contrib/prompt-git/get-tag-name "$hash"
  if [[ $tag ]]; then
    local sgr=$'\e[1;32m' sgr0=$'\e[m'
    local out=$sgr$tag$sgr0
    [[ $opts == *:add-hash:* && $hash ]] &&
      out="$out ${hash::7}"
    out=$out$dirty_mark
    [[ $opts == *:check-state:* ]] &&
      ble/contrib/prompt-git/describe-head/.determine-state detached &&
      out="$ret ($out)"
    ret=$out
    return
  fi

  # "master~23" 等の分かりにくい説明なのでこれは使わない
  # ble/util/assign-array ret 'git describe --contains --all 2>/dev/null'
  # if [[ $ret ]]; then
  #   local DETACHED=$'\e[91mDETACHED\e[m'
  #   local sgr=$'\e[32m' sgr0=$'\e[m'
  #   ret="($DETACHED at $sgr$ret$sgr0)"
  #   return
  # fi

  if [[ $hash ]]; then
    local out=${hash::7}$dirty_mark
    [[ $opts == *:check-state:* ]] &&
      ble/contrib/prompt-git/describe-head/.determine-state detached &&
      out="$ret ($out)"
    ret=$out
    return
  fi

  ret=$'\e[91mUNKNOWN\e[m'
}

#------------------------------------------------------------------------------

function ble/prompt/backslash:contrib/git-info {
  local "${_ble_contrib_prompt_git_vars[@]/%/=}" # WA #D1570 checked
  if ble/contrib/prompt-git/initialize; then
    local sgr=$'\e[1m' sgr0=$'\e[m'
    local name=$sgr${git_base##*?/}$sgr0
    local ret; ble/contrib/prompt-git/describe-head add-hash:check-dirty:check-state; local branch=$ret
    ble/prompt/print "$name $branch"
    [[ $PWD == "$git_base"/?* ]] &&
      ble/prompt/print " /${PWD#$git_base/}"
    return 0
  else
    return 1
  fi
}
function ble/prompt/backslash:contrib/git-name {
  local "${_ble_contrib_prompt_git_vars[@]/%/=}" # WA #D1570 checked
  if ble/contrib/prompt-git/initialize; then
    local name=${git_base%.git}
    name=${name%/}
    name=${name##*?/}
    ble/prompt/print "${git_base##*?/}"
  fi
}
function ble/prompt/backslash:contrib/git-hash {
  local "${_ble_contrib_prompt_git_vars[@]/%/=}" # WA #D1570 checked
  if ble/contrib/prompt-git/initialize; then
    local hash branch
    ble/contrib/prompt-git/get-head-information
    ble/prompt/print "${hash::${1:-7}}"
  fi
}
function ble/prompt/backslash:contrib/git-branch {
  local "${_ble_contrib_prompt_git_vars[@]/%/=}" # WA #D1570 checked
  if ble/contrib/prompt-git/initialize; then
    local ret; ble/contrib/prompt-git/describe-head check-dirty
    ble/prompt/print "$ret"
  fi
}
function ble/prompt/backslash:contrib/git-path {
  local "${_ble_contrib_prompt_git_vars[@]/%/=}" # WA #D1570 checked
  if ble/contrib/prompt-git/initialize; then
    if [[ $PWD == "$git_base"/?* ]]; then
      ble/prompt/print "/${PWD#$git_base/}"
    elif [[ $PWD == "$git_base" ]]; then
      ble/prompt/print /
    fi
  fi
}
