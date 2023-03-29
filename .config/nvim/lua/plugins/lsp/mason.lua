local status_ok, mason = pcall(require, "mason")
if not status_ok then
	return
end

local status_ok_1, mason_lspconfig = pcall(require, "mason-lspconfig")
if not status_ok_1 then
	return
end

local servers = {
	"lua_ls",
	"clangd",
	"jsonls",
	"yamlls",
	"cmake",
	"angularls",
	"pylsp",
	"omnisharp",
	"rust_analyzer",
	"taplo",
	"tsserver",
	"tailwindcss",
	"prismals",
	"bashls",
}

-- Here we declare which settings to pass to the mason, and also ensure servers are installed. If not, they will be installed automatically.
local settings = {
	ui = {
		border = "rounded",
		icons = {
			package_installed = "◍",
			package_pending = "◍",
			package_uninstalled = "◍",
		},
	},
	log_level = vim.log.levels.INFO,
	max_concurrent_installers = 4,
}

mason.setup(settings)
mason_lspconfig.setup({
	ensure_installed = servers,
	automatic_installation = true,
})

-- we'll need to call lspconfig to pass our server to the native neovim lspconfig.
local lspconfig_status_ok, lspconfig = pcall(require, "lspconfig")
if not lspconfig_status_ok then
	return
end

-- loop through the servers
for _, server in pairs(servers) do
	local opts = {
		-- getting "on_attach" and capabilities from handlers
		on_attach = require("plugins.lsp.handlers").on_attach,
		capabilities = require("plugins.lsp.handlers").capabilities,
	}

	local has_custom_opts, server_custom_opts = pcall(require, "plugins.lsp.settings." .. server)

	if has_custom_opts then
		opts = vim.tbl_deep_extend("force", server_custom_opts, opts)
	end

	-- Treat the rust analyzer server differently
	if server == "rust_analyzer" then
		require("rust-tools").setup({
			server = {
				on_attach = require("plugins.lsp.handlers").on_attach,
				capabilities = require("plugins.lsp.handlers").capabilities,
			},
			tools = {
				--options: [termopen, quickfix] (note: quickfix has a hard time with colors)
				executor = require("rust-tools/executors").termopen,
				inlay_hints = {
					only_current_line = false,
					parameter_hints_prefix = "<- ",
					other_hints_prefix = ": ",
				},
			},
		})
		-- let rust_analyzer set up the remaining parts
		goto continue
	end

	lspconfig[server].setup(opts)
	::continue::
end
