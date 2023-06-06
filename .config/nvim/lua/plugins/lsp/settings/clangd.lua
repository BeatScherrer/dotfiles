local status_ok, util = pcall(require, "lspconfig.util")

if not status_ok then
	vim.notify("could not find lspconfig utilities")
end

local root_files = {
	"core",
	".clangd",
	"compile_commands.json",
}

return {
	root_dir = util.root_pattern(root_files),
	cmd = {
		"/usr/bin/schroot",
		"-c",
		"chroot:ub18",
		"--",
		"/home/beat/.local/share/nvim/mason/bin/clangd",
		"--path-mappings=/usr=/srv/chroot/ub18/usr,/opt=/srv/chroot/ub18/opt",
	},
	settings = {},
}
