local status_ok, auto_session = pcall(require, "auto-session")

if not status_ok then
	vim.notify("could not load auto-session")
end

auto_session.setup({
	log_level = "info",
	auto_session_suppres_dirs = { "~/" },
})
