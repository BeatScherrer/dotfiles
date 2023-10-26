-- Default keymaps that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/keymaps.lua
-- Add any additional keymaps here
vim.keymap.set("n", "<leader>qf", "<cmd>cfirst<cr>")
vim.keymap.set("n", "<leader>ql", "<cmd>clast<cr>")
vim.keymap.set("n", "<leader>qn", "<cmd>cnext<cr>")
vim.keymap.set("n", "<leader>qp", "<cmd>cprevious<cr>")

vim.keymap.set("n", "<C-p>", "<Nop>")
vim.keymap.set("n", "<leader>mm", "<cmd>Make<cr>")
vim.keymap.set("n", "<C-w>u", "<cmd>split<cr>")
vim.keymap.set("n", "<C-w>o", "<cmd>vsplit<cr>")
