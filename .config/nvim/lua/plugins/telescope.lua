local status_ok, telescope = pcall(require, "telescope")
if not status_ok then
	vim.notify("could not find telescope")
	return
end

local actions = telescope.actions

telescope.load_extension("git_worktree")
telescope.load_extension("just")

telescope.setup({
	defaults = {
		layout_strategy = "vertical",
		layout_config = { height = 0.95, width = 0.95 },
		-- Default configuration for telescope goes here:
		-- config_key = value,
		mappings = {
			i = {
				-- map actions.which_key to <C-h> (default: <C-/>)
				-- actions.which_key shows the mappings for your picker,
				-- e.g. git_{create, delete, ...}_branch for the git_branches picker
				["<C-h>"] = "which_key",
			},
		},
	},
	pickers = {
		-- Default configuration for builtin pickers goes here:
		-- picker_name = {
		--   picker_config_key = value,
		--   ...
		-- }
		-- Now the picker_config_key will be applied every time you call this
		-- builtin picker
	},
	-- Your extension configuration goes here:
	-- extension_name = {
	--   extension_config_key = value,
	-- }
	-- please take a look at the readme of the extension you want to configure
	--
	extensions = {
		media_files = {
			filetypes = { "png", "webp", "jpg", "jpeg" },
			find_cmd = "rg",
		},
	},
})
