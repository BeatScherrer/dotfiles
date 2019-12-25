# dotfiles
Repo with linux dot files for different WMs and DEs. Every setup has a dedicated separate branch. The master branch only serves to hold this README file to not pollute the home directory for any configuration.

This way of using git to version dot files is taken from the following [tutorial](https://www.atlassian.com/git/tutorials/dotfiles). It allows to work in the home directory directly and version the used dot files instead of creating symlinks in different approaches.

# Clone dot files to new system:
create the following alias first
```
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
```
clone the repo:

```
git clone --bare git@github.com:BeatScherrer/dotfiles.git $HOME/.cfg
```

checkout the wanted configuration
```
config checkout <branch>
```

set the config to not show untracked files:
```
config config --local status.showUntrackedFiles no
```
