-- Autocmds are automatically loaded on the VeryLazy event
-- Default autocmds that are always set: https://github.com/LazyVim/LazyVim/blob/main/lua/lazyvim/config/autocmds.lua
-- Add any additional autocmds here

-- Set the comment string of cpp to always use //
vim.api.nvim_create_autocmd({ "BufEnter", "BufFilePost" }, {
  pattern = { "*.c", "*.cpp", "*.h", "*.hpp" },
  callback = function()
    vim.api.nvim_buf_set_option(0, "commentstring", "// %s")
  end,
})

-- Disable autoformat for lua files
vim.api.nvim_create_autocmd({ "FileType" }, {
  pattern = { "" },
  callback = function()
    vim.b.autoformat = false
  end,
})