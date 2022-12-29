local mason_dap = require("mason-nvim-dap")

mason_dap.setup({
	ensure_installed = {},
	automatic_setup = true,
})

mason_dap.setup_handlers({
	function(source_name)
		-- all sources with no handler get passed here

		-- Keep original functionality of automatic setup.
		require("mason-nvim-dap.automatic_setup")(source_name)
	end,
	python = require("plugins.dap.settings.python").setup(),
})
