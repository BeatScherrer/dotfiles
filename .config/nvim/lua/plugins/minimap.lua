local status_ok, minimap = pcall(require, "minimap")
if not status_ok then
  return
end

vim.g.minimap_git_colors = 1
vim.g.minimap_highlight_search = 1
vim.g.minimap_highlight_range = 1
