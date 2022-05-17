local keymap = vim.api.nvim_set_keymap
local opts = { noremap = true, silent = true}

-- Leader key
keymap("", "<Space>", "<Nop>", opts)
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Window navigation
keymap("n", "<C-h>", "<C-w>h", opts)
keymap("n", "<C-j>", "<C-w>j", opts)
keymap("n", "<C-k>", "<C-w>k", opts)
keymap("n", "<C-l>", "<C-w>l", opts)

keymap("n", "<leader>e", ":Lex 30<cr>", opts)

-- Resize with arrows
keymap("n", "<C-Up>", ":resize +2<CR>", opts)
keymap("n", "<C-Down>", ":resize -2<CR>", opts)
keymap("n", "<C-Left>", ":vertical resize +2<CR>", opts)
keymap("n", "<C-Right>", ":vertical resize -2<CR>", opts)

-- Navigate buffers
keymap("n", "<S-l>", "bnext<CR>", opts)
keymap("n", "<S-h>", "bprevious<CR>", opts)

-- Fast config access
keymap("n", "<leader>vs", ":source ~/.config/nvim/init.lua<cr>", opts)
keymap("n", "<leader>ve", ":edit ~/.config/nvim/init.lua<cr>", opts)

-- stay in visual mode wen indenting
keymap("v", "<", "<gv", opts)
keymap("v", ">", ">gv", opts)

-- Move text up and down, TODO
--keymap("v", "<A-j>", ":m .+1<CR>===", opts)
--keymap("v", "<A-k>", ":m -1<CR>==", opts)
keymap("v", "p", '"_dP', opts) -- keep buffer when pasting

