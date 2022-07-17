local util = require("lspconfig.utils")

local omnisharp_bin = "/usr/sbin/omnisharp"
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
		"--languageserver",
		"--hostPID",
		tostring(pid),
		"--source /home/beat/workspace/ucc/web-gui/src/MTRobot.UCC",
	},
}
