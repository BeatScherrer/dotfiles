local status_ok, dap = pcall(require, "dap")
if not status_ok then
	vim.notify("could not find dap")
end

-- keymaps
vim.keymap.set("n", "<F5>", ":lua require'dap'.continue()<cr>")
vim.keymap.set("n", "<F10>", ":lua require'dap'.step_over()<cr>")
vim.keymap.set("n", "<F11>", ":lua require'dap'.step_into()<cr>")
vim.keymap.set("n", "<F12>", ":lua require'dap'.step_out()<cr>")
vim.keymap.set("n", "<leader>b", ":lua require'dap'.toggle_breakpoint()<cr>")
vim.keymap.set("n", "<leader>B", ":lua require'dap'.set_breakpoint(vim.fn.input('Breakpoint condition: '))<cr>")

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
