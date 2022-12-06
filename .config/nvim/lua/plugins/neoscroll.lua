local status_ok, neoscroll = pcall(require, "neoscroll")

if not status_ok then
	vim.notify("could not find neoscroll")
	return
end

neoscroll.setup()
