local opts = { noremap = true, silent = true }

local function keymap(mode, lhs, rhs, opts)
	local options = { noremap = true, silent = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- TODO move respective keymaps to plugin configs

-- Leader key
keymap("", "<Space>", "<Nop>")
vim.g.mapleader = " "
vim.g.maplocalleader = " "

-- Disable arrow keys
keymap("", "<up>", "<nop>")
keymap("", "<down>", "<nop>")
keymap("", "<left>", "<nop>")
keymap("", "<right>", "<nop>")

-- Clear search highlighting with <leader> and c
keymap("n", "<leader>c", ":nohl<CR>")

-- Window navigation, clashes with lsp keymappings, maybe set the tmux
-- prefix to <C-w> for consistency
keymap("n", "<C-w>v", "<C-w>v;")
keymap("n", "<C-w>h", "<C-w>s;")
keymap("n", "<C-h>", "<C-w>h")
keymap("n", "<C-j>", "<C-w>j")
keymap("n", "<C-k>", "<C-w>k")
keymap("n", "<C-l>", "<C-w>l")

-- Resize with arrows
keymap("n", "<C-Up>", ":resize +2<CR>")
keymap("n", "<C-Down>", ":resize -2<CR>")
keymap("n", "<C-Left>", ":vertical resize +2<CR>")
keymap("n", "<C-Right>", ":vertical resize -2<CR>")

-- Navigate buffers
keymap("n", "<leader>bl", "<cmd>bnext<cr>")
keymap("n", "<leader>bh", "<cmd>bprevious<cr>")
keymap("n", "<leader>bf", "<cmd>Telescope buffer<cr>")

-- Fast config access
keymap("n", "<leader>vs", "<cmd>source ~/.config/nvim/init.lua<cr>")
keymap("n", "<leader>ve", "<cmd>edit ~/.config/nvim/init.lua<cr>")

-- stay in visual mode wen indenting
keymap("v", "<", "<gv")
keymap("v", ">", ">gv")

-- quickfix shortcuts
keymap("n", "<leader>qf", "<cmd>cf<cr>")
keymap("n", "<leader>qn", "<cmd>cn<cr>")
keymap("n", "<leader>qp", "<cmd>cp<cr>")

-- Move text up and down, TODO
--keymap("v", "<A-j>", ":m .+1<CR>===", opts)
--keymap("v", "<A-k>", ":m -1<CR>==", opts)
keymap("v", "p", '"_dP') -- keep beuffe when pasting

-- NvimTree
keymap("n", "<C-t>", "<cmd>NvimTreeToggle<cr>") -- open/close

-- Telescope
keymap("n", "<leader>ff", "<cmd>Telescope find_files<cr>")
keymap("n", "<leader>fb", "<cmd>Telescope buffers<cr>")
keymap("n", "<leader>fl", "<cmd>Telescope live_grep<cr>")
keymap("n", "<leader>fs", "<cmd>Telescope lsp_document_symbols<cr>")
keymap("n", "<leader>fw", "<cmd>Telescope lsp_dynamic_workspace_symbols<cr>")
keymap("n", "<leader>fr", "<cmd>Telescope lsp_references<cr>")
keymap("n", "<leader>fg", "<cmd>Telescope grep_string<cr>")
keymap("n", "<leader>fo", "<cmd>Telescope resume<cr>")
keymap("n", "<leader>f?", "<cmd>Telescope help_tags<cr>")

-- git
keymap("n", "<leader>gc", "<cmd>Telescope git_commits<cr>")
keymap("n", "<leader>gb", "<cmd>Telescope git_branches<cr>")
keymap("n", "<leader>gs", "<cmd>Telescope git_status<cr>")

-- minimap
keymap("n", "<leader>mt", "<cmd>MinimapToggle<cr>")
keymap("n", "<leader>cf", "<cmd>Format<cr>")
keymap("n", "<C-\\>", "<cmd>ToggleTerm<cr>")
keymap("n", "<A-o>", "<cmd>ClangdSwitchSourceHeader<cr>")

-- dap
keymap("n", "<leader>dc", "<cmd>lua require'dap'.continue()<cr>")
keymap("n", "<leader>dn", "<cmd>lua require'dap'.step_over()<cr>")
keymap("n", "<leader>di", "<cmd>lua require'dap'.step_into()<cr>")
keymap("n", "<leader>do", "<cmd>lua require'dap'.step_out()<cr>")
keymap("n", "<leader>db", "<cmd>lua require'dap'.toggle_breakpoint()<cr>")
keymap("n", "<leader>dB", "<cmd>lua require'dap'.set_breakpoint(vim.fn.input('Breakpoint condition: '))<cr>")
