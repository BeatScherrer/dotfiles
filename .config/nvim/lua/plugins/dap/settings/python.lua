local dap = require("dap")

local M = {}

local adapter = {
	type = "executable",
	command = "/usr/bin/python3",
	args = {
		"-m",
		"debugpy.adapter",
	},
}

local config = {
	{
		type = "python",
		request = "launch",
		name = "Launch file",
		program = "${file}",
	},
}

M.setup = function(source_name)
	dap.adapters.python = adapter
	dap.configurations.python = config
end

return M
