<<<<<<< HEAD
local status_ok, lualine = pcall(require, "lualine")

if not status_ok then
	vim.notify("could not load lualine")
	return
end

local status_ok, navic = pcall(require, "nvim-navic")
if not status_ok then
	vim.notify("could not load nvim-navic")
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
		lualine_c = {
			"filename",
		},
		lualine_x = { "encoding", "fileformat", "filetype" },
		lualine_y = { "progress" },
		lualine_z = { "location" },
	},
	winbar = {
		lualine_c = {
			{
				function()
					return navic.get_location()
				end,
				cond = function()
					return navic.is_available()
				end,
			},
		},
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
=======
return {
  -- the opts function can also be used to change the default opts:
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    opts = function(_, opts)
      table.insert(opts.sections.lualine_x, "😄")
    end,
  },
}
>>>>>>> ea299d0309eb2c4cff46f3c6c077eb6b55e34691
