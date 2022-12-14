local opts = { noremap = true, silent = true }

local function keymap(mode, lhs, rhs, opts)
	local options = { noremap = true, silent = true }
	if opts then
		options = vim.tbl_extend("force", options, opts)
	end
	vim.api.nvim_set_keymap(mode, lhs, rhs, options)
end

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

-- Buffers
keymap("n", "<leader>bl", "<cmd>bnext<cr>") -- buffer (vim-right)
keymap("n", "<leader>bh", "<cmd>bprevious<cr>") -- buffer (vim-left)
keymap("n", "<leader>bf", "<cmd>Telescope buffer<cr>") -- buffer find
keymap("n", "<leader>bdo", '<cmd>%bdelete|edit #|normal `"<cr>') -- buffer delete others

-- Fast config access
keymap("n", "<leader>vs", "<cmd>source ~/.config/nvim/init.lua<cr>")
keymap("n", "<leader>ve", "<cmd>edit ~/.config/nvim/init.lua<cr>")

-- stay in visual mode wen indenting
keymap("v", "<", "<gv")
keymap("v", ">", ">gv")

-- quickfix shortcuts
keymap("n", "<leader>qf", "<cmd>cfirst<cr>")
keymap("n", "<leader>ql", "<cmd>clast<cr>")
keymap("n", "<leader>qn", "<cmd>cnext<cr>")
keymap("n", "<leader>qp", "<cmd>cprevious<cr>")

-- Move text up and down, TODO
keymap("n", "<A-k>", "<cmd>m .-2<cr>==", opts)
keymap("n", "<A-j>", "<cmd>m .+1<cr>==", opts)
keymap("v", "p", '"_dP') -- keep buffer when pasting

-- Neotree
keymap("n", "<C-t>", "<cmd>NeoTreeShowToggle<cr>") -- open/close
keymap("n", "<leader>tf", "<cmd>Neotree focus %<cr>") -- focus the currently opened file
keymap("n", "<leader>tb", "<cmd>Neotree buffers<cr>") -- focus the currently opened file

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
keymap("n", "<leader>fh", "<cmd>Telescope highlights<cr>")
keymap("n", "<leader>fj", "<cmd>Telescope just<cr>")

-- git
keymap("n", "<leader>gc", "<cmd>Telescope git_commits<cr>")
keymap("n", "<leader>gb", "<cmd>Telescope git_branches<cr>")
keymap("n", "<leader>gs", "<cmd>Telescope git_status<cr>")
keymap("n", "<leader>gw", "<cmd>Telescope git_worktree<cr>")
keymap("n", "<leader>dvo", "<cmd>DiffviewOpen<cr>")
keymap("n", "<leader>dvfh", "<cmd>DiffviewFileHistory %<cr>")
keymap("n", "<leader>dvr", "<cmd>DiffviewRefresh %<cr>")

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

-- tabs
keymap("n", "<leader>tn", ":$tabnew<CR>", { noremap = true })
keymap("n", "<leader>tc", ":tabclose<CR>", { noremap = true })
keymap("n", "<leader>to", ":tabonly<CR>", { noremap = true })
keymap("n", "<leader>tl", ":tabn<CR>", { noremap = true })
keymap("n", "<leader>th", ":tabp<CR>", { noremap = true })
-- move current tab to previous position
keymap("n", "<leader>tmh", ":-tabmove<CR>", { noremap = true })
-- move current tab to next position
keymap("n", "<leader>tml", ":+tabmove<CR>", { noremap = true })
