local opt = vim.opt
local g = vim.g

opt.clipboard = "unnamedplus"
opt.mouse = "a"
opt.ignorecase = true
opt.smartcase = true
opt.smartindent = true
opt.expandtab = true
opt.shiftwidth = 2
opt.tabstop = 2
opt.cursorline = true
opt.number = true
opt.relativenumber = true
opt.numberwidth = 4
opt.scrolloff = 10
opt.sidescrolloff = 10
opt.termguicolors = true
opt.laststatus = 3
opt.fillchars = {
	diff = " ",
	eob = " ",
}

-- treesitter folding
-- opt.foldcolumn = "3"
opt.foldmethod = "expr"
opt.foldexpr = "nvim_treesitter#foldexpr()"
opt.foldlevel = 20

-- opt.errorformat:append("./%f: line %l: %m") --shell

vim.wo.signcolumn = "yes"
g.do_filetype_lua = 1

-- TODO: How can we get this project based??
opt.makeprg = 'cd build && schroot -c chroot:ub22 -- /bin/bash -ic "mm"; cd - '

-- Neovide settings
if g.neovide then
	g.neovide_refresh_rate = 60
	g.neovide_remember_window_size = true
	g.neovide_cursor_animation_length = 0.05
	g.neovide_cursor_trail_length = 0.6
	opt.guifont = { "JetBrainsMonoNL Nerd Font", ":h8" }
end
