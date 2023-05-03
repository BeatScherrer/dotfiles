local util = require("lspconfig.util")

local root_files = {
	".clangd",
	"compile_commands.json",
}

return {
	root_dir = function(fname)
		return util.root_pattern(unpack(root_files))(fname) or util.find_git_ancestor(fname)
	end,
	cmd = {
		"/usr/bin/schroot",
		"-c",
		"chroot:ub22",
		"--",
		"/home/beat/.local/share/nvim/mason/bin/clangd",
		"--path-mappings=/usr=/srv/chroot/ub22/usr,/opt=/srv/chroot/ub22/opt",
	},
	settings = {},
}
