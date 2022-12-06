-- Treesitter open folds
vim.api.nvim_create_autocmd({ "BufRead", "FileRead" }, { pattern = "*", command = "normal zR" })
