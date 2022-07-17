local status_ok, gitsigns = pcall(require, "gitsigns")
if not status_ok then
  vim.notify("could not find gitsigns")
end

gitsigns.setup()
