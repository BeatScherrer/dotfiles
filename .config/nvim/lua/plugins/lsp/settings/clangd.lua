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
		"chroot:mt_ubuntu18-cpp17",
		"--",
		"/home/beat/.local/share/nvim/lsp_servers/clangd/clangd/bin/clangd",
		"--path-mappings=/usr=/srv/chroot/mt_ubuntu18-cpp17/usr,/opt=/srv/chroot/mt_ubuntu18-cpp17/opt",
	},
	settings = {},
}
