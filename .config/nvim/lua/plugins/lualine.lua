local status_ok, lualine = pcall(require, "lualine")

if not status_ok then
	vim.notify("could not load lualine")
	return
end

local status_ok, gps = pcall(require, "nvim-gps")
if not status_ok then
	vim.notify("could not load nvim-gps")
end

lualine.setup({
	options = {
		icons_enabled = true,
		theme = "gravel_pit",
		component_separators = { left = "", right = "" },
		section_separators = { left = "", right = "" },
		disabled_filetypes = {},
		always_divide_middle = true,
		globalstatus = false,
	},
	sections = {
		lualine_a = { "mode" },
		lualine_b = { "branch", "diff", "diagnostics" },
		lualine_c = { "filename", { gps.get_location, cond = gps.is_available } },
		lualine_x = { "encoding", "fileformat", "filetype" },
		lualine_y = { "progress" },
		lualine_z = { "location" },
	},
	inactive_sections = {
		lualine_a = {},
		lualine_b = {},
		lualine_c = { "filename" },
		lualine_x = { "location" },
		lualine_y = {},
		lualine_z = {},
	},
	tabline = {},
	extensions = {},
})
