local status_ok, neogit = pcall(require, "neogit")

if not status_ok then
	vim.notify("could not find 'neogit'")
	return
end

neogit.setup()
