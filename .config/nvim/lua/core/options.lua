vim.opt.clipboard = "unnamedplus"
vim.opt.mouse = "a"
vim.opt.smartcase = true
vim.opt.smartindent = true
vim.opt.expandtab = true
vim.opt.shiftwidth = 2
vim.opt.tabstop = 2
vim.opt.cursorline = true
vim.opt.number = true
vim.opt.relativenumber = true
vim.opt.numberwidth = 4
vim.opt.scrolloff = 10
vim.opt.sidescrolloff = 10
vim.opt.termguicolors = true
vim.opt.laststatus = 3
vim.opt.fillchars = {
	diff = " ",
	eob = " ",
}
vim.wo.signcolumn = "yes"
vim.g.do_filetype_lua = 1

-- TODO: How can we get this project based??
vim.opt.makeprg = 'cd build && schroot -c chroot:mt_ubuntu18 -- /usr/bin/zsh -ic "make"; cd - '

-- Neovide settings
if vim.g.neovide then
	vim.g.neovide_refresh_rate = 60
	vim.g.neovide_remember_window_size = true
	vim.g.neovide_cursor_animation_length = 0.05
	vim.g.neovide_cursor_trail_length = 0.6
	vim.opt.guifont = { "JetBrainsMonoNL Nerd Font", ":h8" }
end
