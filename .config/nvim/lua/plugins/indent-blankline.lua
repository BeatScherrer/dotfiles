local status_ok, indent_blankline = pcall(require, "indent_blankline")
if not status_ok then
	vim.notify("could not find 'indent_blankline'")
	return
end

vim.cmd([[highlight IndentBlanklineContextChar guifg=#ff0000 gui=nocombine]])
-- version 1 with bg
vim.cmd([[highlight IndentBlanklineIndent1 guibg=#1f1f1f gui=nocombine]])
vim.cmd([[highlight IndentBlanklineIndent2 guibg=#1a1a1a gui=nocombine]])
-- version 2 with bright fg
-- vim.cmd([[highlight IndentBlanklineIndent1 guifg=#444444 gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent2 guifg=#333333 gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent3 guifg=#98C379 gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent4 guifg=#56B6C2 gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent5 guifg=#61AFEF gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent6 guifg=#C678DD gui=nocombine]])

vim.opt.termguicolors = true

indent_blankline.setup({
	char = "",
	show_current_context = true,
	default_group = "SpecialKey",
	show_current_context_start = false,
	char_highlight_list = {
		"IndentBlanklineIndent1",
		"IndentBlanklineIndent2",
		"IndentBlanklineContextChar",
		-- "IndentBlanklineIndent3",
		-- "IndentBlanklineIndent4",
		-- "IndentBlanklineIndent5",
		-- "IndentBlanklineIndent6",
	},
	space_char_highlight_list = {
		"IndentBlanklineIndent1",
		"IndentBlanklineIndent2",
	},
	show_trailing_blankline_indent = false,
})
