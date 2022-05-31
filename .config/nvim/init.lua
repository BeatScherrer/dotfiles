require("core/options")
require("core/keymaps")

require("packer_init")

require("plugins")

vim.cmd([[colorscheme rose-pine]])

-- TODO:
-- Quickfix setup to jump to the compilation error location directly (requires to overwrite the make command?)
-- set up task runner, e.g jedrzejboczar/toggletasks.nvim
-- move plugin configs from packer_init to plugin setting
-- make splits/tabs with own buffer list
