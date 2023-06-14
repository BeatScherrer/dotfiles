-- Options are automatically loaded before lazy.nvim startup
-- Default options that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/options.lua
-- Add any additional options here

vim.opt.fillchars = [[diff: ,eob: ,fold: ,foldopen:,foldsep: ,foldclose:]]

SCHROOT_NAME="ub18"
vim.opt.makeprg = "cd build && schroot -c chroot:" .. SCHROOT_NAME .. ' -- /bin/bash -ic "mm"; cd - '
