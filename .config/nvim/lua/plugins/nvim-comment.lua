local status_ok, nvim_comment = pcall(require, "nvim_comment")

if not status_ok then
	vim.notify("could not find nvim_comment")
end

nvim_comment.setup()
