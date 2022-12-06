-----------------------------------------------------------
-- Treesitter configuration file
----------------------------------------------------------

-- Plugin: nvim-treesitter
-- url: https://github.com/nvim-treesitter/nvim-treesitter

local status_ok, nvim_treesitter = pcall(require, "nvim-treesitter.configs")
if not status_ok then
	vim.notify("could not find 'nvim-treesitter.configs'")
	return
end

--vim.opt.foldmethod = "expr"
--vim.opt.foldexpr = "nvim_treesitter#foldexpr()"

-- See: https://github.com/nvim-treesitter/nvim-treesitter#quickstart
nvim_treesitter.setup({
	-- A list of parser names, or "all"
	ensure_installed = {
		"vim",
		"bash",
		"c",
		"cpp",
		"rust",
		"lua",
		"python",
		"typescript",
		"javascript",
		"html",
		"toml",
		"yaml",
		"json",
	},
	ignore_install = { "" },
	autopairs = {
		enable = true,
	},
	-- Install parsers synchronously (only applied to `ensure_installed`)
	sync_install = false,
	highlight = {
		-- `false` will disable the whole extension
		enable = true,
		disable = { "" },
		additional_vim_regex_highlighting = true,
	},
	indent = { enable = true, disable = { "" } },
	rainbow = {
		enable = true,
		extended_mode = false,
		colors = {
			"#ffeac3",
			"#cc6666",
			"#81a2be",
			"#b5bd68",
		}, --table with hex strings
		--termcolors = {} -- table of colour name strings
	},
	playground = {
		enable = true,
		disable = {},
		updatetime = 25, -- Debounced time for highlighting nodes in the playground from source code
		persist_queries = false, -- Whether the query persists across vim sessions
		keybindings = {
			toggle_query_editor = "o",
			toggle_hl_groups = "i",
			toggle_injected_languages = "t",
			toggle_anonymous_nodes = "a",
			toggle_language_display = "I",
			focus_language = "f",
			unfocus_language = "F",
			update = "R",
			goto_node = "<cr>",
			show_help = "?",
		},
	},
	nt_cpp_tools = {
		enable = true,
		preview = {
			quit = "q", -- optional keymapping for quit preview
			accept = "<tab>", -- optional keymapping for accept preview
		},
		header_extension = "h", -- optional
		source_extension = "cxx", -- optional
		custom_define_class_function_commands = { -- optional
			TSCppImplWrite = {
				output_handle = require("nvim-treesitter.nt-cpp-tools.output_handlers").get_add_to_cpp(),
			},
			--[[
        <your impl function custom command name> = {
            output_handle = function (str, context) 
                -- string contains the class implementation
                -- do whatever you want to do with it
            end
        }
        ]]
		},
	},
})
