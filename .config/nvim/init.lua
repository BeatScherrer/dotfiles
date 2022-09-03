require("packer_init")

require("plugins")

-- load these at the end to overwrite settings that were set somewhere unpredictable
require("core/keymaps")
require("core/colorscheme")
require("core/options")
require("core/filetypes")

-- TODO:
-- Quickfix setup to jump to the compilation error location directly (requires to overwrite the make command?)
-- set up task runner, e.g jedrzejboczar/toggletasks.nvim
-- move plugin configs from packer_init to plugin setting
-- make splits/tabs with own beuffe list
-- create gravel-pit theme
