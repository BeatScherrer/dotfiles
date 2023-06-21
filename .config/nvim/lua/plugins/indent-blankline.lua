-- vim.cmd([[highlight IndentBlanklineContextChar guifg=#ff0000 gui=nocombine]])
vim.cmd([[highlight IndentBlanklineIndent1 guibg=#1e1e1e gui=nocombine]])
-- vim.cmd([[highlight IndentBlanklineIndent2 guibg=#202020 gui=nocombine]])

return {
  "lukas-reineke/indent-blankline.nvim",
  opts = {
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
  },
}
