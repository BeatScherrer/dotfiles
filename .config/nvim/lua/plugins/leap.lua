local status_ok, leap = pcall(require, "leap")

if not status_ok then
	vim.notify("'leap' not found")
	return
end

leap.add_default_mappings()
