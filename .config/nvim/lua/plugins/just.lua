local status_ok, just = pcall(require, "just")

if not status_ok then
	vim.notify("could not find 'just'")
end

just.setup()
