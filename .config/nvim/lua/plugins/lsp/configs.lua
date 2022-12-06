local status_ok, lsp_installer = pcall(require, "nvim-lsp-installer")
if not status_ok then
	vim.notify("could not find plugin 'nvim-lsp-installer'")
	return
end

local lspconfig = require("lspconfig")

local servers = {
	"sumneko_lua",
	"clangd",
	"jsonls",
	"yamlls",
	"cmake",
	"angularls",
	"pyright",
	"omnisharp",
	"rust_analyzer",
	"taplo",
	"tsserver",
	"tailwindcss",
	"prismals",
	"bashls",
}

lsp_installer.setup()

for _, server in pairs(servers) do
	local opts = {
		on_attach = require("plugins.lsp.handlers").on_attach,
		capabilities = require("plugins.lsp.handlers").capabilities,
	}

	local has_custom_opts, server_custom_opts = pcall(require, "plugins.lsp.settings." .. server)

	if has_custom_opts then
		opts = vim.tbl_deep_extend("force", server_custom_opts, opts)
	end

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
