local util = require("lspconfig.utils")

local omnisharp_bin = "/home/beat/.local/share/nvim/mason/bin/omnisharp"
local pid = vim.fn.getpid()

local root_dir = function(fname)
	return util.root_pattern("*sln")(fname)
		or util.root_pattern("*.csproj")(fname)
		or util.find_git_ancestor(fname)
		or "MTrobot.UCC"
end

return {
	root_dir = root_dir,
	cmd = {
		omnisharp_bin,
		"-lsp",
		"--hostPID",
		tostring(pid),
	},
}
