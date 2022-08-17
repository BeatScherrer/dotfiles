local status_ok, cokeline = pcall(require, "cokeline")

if not status_ok then
	vim.notify("could not find 'cokeline'")
	return
end

local get_hex = require("cokeline/utils").get_hex

local active_fg = "#FFFFFF"
local active_bg = "#5e8d87"
local inactive_fg = "#c7c7c7"
local inactive_bg = "#262626"

cokeline.setup({
	default_hl = {
		fg = function(buffer)
			return buffer.is_focused and active_fg or inactive_fg
		end,
		bg = function(buffer)
			return buffer.is_focused and active_bg or inactive_bg
		end,
	},

	components = {
		{
			text = " ",
			bg = get_hex("Normal", "bg"),
		},
		{
			text = "",
			fg = function(buffer)
				return buffer.is_focused and active_bg or inactive_bg
			end,
			bg = get_hex("Normal", "bg"),
		},
		{
			text = function(buffer)
				return buffer.devicon.icon
			end,
			fg = function(buffer)
				return buffer.devicon.color
			end,
		},
		{
			text = " ",
		},
		{
			text = function(buffer)
				return buffer.filename .. "  "
			end,
			style = function(buffer)
				return buffer.is_focused and "bold" or nil
			end,
		},
		{
			text = "",
			delete_buffer_on_left_click = true,
		},
		{
			text = "",
			fg = function(buffer)
				return buffer.is_focused and active_bg or inactive_bg
			end,
			bg = get_hex("Normal", "bg"),
		},
	},
})
