local status_ok, dap = pcall(require, "dap")
if not status_ok then
	vim.notify("could not find dap")
end

local dap_install_status_ok, dap_install = pcall(require, "dap-install")
if not dap_install_status_ok then
	vim.notify("could not find 'dap-install'")
	return
end

dap_install.setup()

vim.fn.sign_define("DapBreakpoint", { text = "", texthl = "DiagnosticSignError", linehl = "", numhl = "" })

-- Adapters
dap.adapters.lldb = {
	type = "executable",
	command = "/usr/sbin/lldb-vscode",
	name = "lldb",
}
dap.adapters.coreclr = {
	type = "executable",
	command = "/usr/sbin/netcoredbg",
	args = { "--interpreter=vscode" },
}

-- Configurations
dap.configurations.cpp = {
	{
		name = "Launch",
		type = "lldb",
		request = "launch",
		program = function()
			return vim.fn.input("Path to executable: ", vim.fn.getcwd() .. "/", "file")
		end,
		cwd = "${workspaceFolder}",
		stopOnEntry = false,
		args = {},
		-- 💀
		-- if you change `runInTerminal` to true, you might need to change the yama/ptrace_scope setting:
		--
		--    echo 0 | sudo tee /proc/sys/kernel/yama/ptrace_scope
		--
		-- Otherwise you might get the following error:
		--
		--    Error on launch: Failed to attach to the target process
		--
		-- But you should be aware of the implications:
		-- https://www.kernel.org/doc/html/latest/admin-guide/LSM/Yama.html
		-- runInTerminal = false,
	},
}
dap.configurations.c = dap.configurations.cpp
dap.configurations.rust = dap.configurations.cpp
dap.configurations.cs = {
	{
		type = "coreclr",
		name = "launch - netcoredbg",
		request = "launch",
		program = function()
			return vim.fn.input("Path to dll ", vim.fn.getcwd() .. "/bin/Debug/", "file")
		end,
	},
}
