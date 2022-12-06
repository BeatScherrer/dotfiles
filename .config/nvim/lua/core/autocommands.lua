-- Treesitter open folds
vim.api.nvim_create_autocmd({ "BufReadPost", "FileReadPost" }, { pattern = "*", command = "normal zR" })
