-----------------------------------------------------------
-- Plugin manager configuration file
-----------------------------------------------------------

-- Plugin manager: packer.nvim
-- url: https://github.com/wbthomason/packer.nvim

-- For information about installed plugins see the README:
-- neovim-lua/README.md
-- https://github.com/brainfucksec/neovim-lua#readme

-- Automatically install packer
local fn = vim.fn
local install_path = fn.stdpath("data") .. "/site/pack/packer/start/packer.nvim"

if fn.empty(fn.glob(install_path)) > 0 then
	packer_bootstrap = fn.system({
		"git",
		"clone",
		"--depth",
		"1",
		"https://github.com/wbthomason/packer.nvim",
		install_path,
	})
end

-- Autocommand that reloads neovim whenever you save the packer_init.lua file
vim.cmd([[
  augroup packer_user_config
    autocmd!
    autocmd BufWritePost packer_init.lua source <afile> | PackerSync
  augroup end
]])

-- Use a protected call so we don't error out on first use
local status_ok, packer = pcall(require, "packer")
if not status_ok then
	return
end

packer.init({
	display = {
		open_fn = function()
			return require("packer.util").float({ border = "rounded" })
		end,
	},
})

-- Install plugins
return packer.startup(function(use)
	-- Add you plugins here:
	use("wbthomason/packer.nvim") -- packer can manage itself
	use("nvim-lua/popup.nvim")
	use("nvim-lua/plenary.nvim")

	-- File explorer
	use("kyazdani42/nvim-tree.lua")

	-- Telescope
	use({
		"nvim-telescope/telescope.nvim",
		requires = {
			"nvim-lua/plenary.nvim",
		},
	})
	use("nvim-telescope/telescope-media-files.nvim")

	-- Sessions
	use("rmagatti/auto-session")
	use({
		"rmagatti/session-lens",
		requires = {
			"rmagatti/auto-session",
			"nvim-telescope/telescope.nvim",
		},
	})

	-- Indent line
	use("lukas-reineke/indent-blankline.nvim")

	-- Autopair
	use({
		"windwp/nvim-autopairs",
		config = function()
			require("nvim-autopairs").setup()
		end,
	})

	-- Icons
	use("kyazdani42/nvim-web-devicons")

	-- Tag viewer
	use("preservim/tagbar")

	-- Treesitter interface
	use({
		"nvim-treesitter/nvim-treesitter",
		run = ":TSUpdate",
	})
	use("p00f/nvim-ts-rainbow")
	use("JoosepAlviste/nvim-ts-context-commentstring")
	use("Badhi/nvim-treesitter-cpp-tools")

	-- Color schemes
	use("navarasu/onedark.nvim")
	use("tanvirtin/monokai.nvim")
	use({ "rose-pine/neovim", as = "rose-pine" })
	use("folke/tokyonight.nvim")
	use({ "jacoborus/tender.vim", as = "tender" })
	-- use("RRethy/nvim-base16")
	use("arcticicestudio/nord-vim")
	use("cocopon/iceberg.vim")
	use("/home/beat/workspace/git/beat/gravel-pit.nvim")
	use("nvim-treesitter/playground")

	-- Autocomplete
	use({
		"hrsh7th/nvim-cmp",
		requires = {
			"hrsh7th/cmp-nvim-lsp",
			"hrsh7th/cmp-path",
			"hrsh7th/cmp-buffer",
			"hrsh7th/cmp-cmdline",
			"saadparwaiz1/cmp_luasnip",
		},
	})

	-- Commenting
	use({
		"terrortylor/nvim-comment",
		config = function()
			require("nvim_comment").setup()
		end,
	})

	-- Tasks
	use("tpope/vim-dispatch")
	use("NoahTheDuke/vim-just")
	use("/home/beat/workspace/git/beat/just.nvim")

	-- snippets
	use("L3MON4D3/LuaSnip")
	use("rafamadriz/friendly-snippets")

	-- LSP
	use("neovim/nvim-lspconfig")
	use("williamboman/nvim-lsp-installer")
	use("jose-elias-alvarez/null-ls.nvim")

	-- Debugger
	use("mfussenegger/nvim-dap")
	use({ "rcarriga/nvim-dap-ui", requires = { "mfussenegger/nvim-dap" } })
	use("theHamsta/nvim-dap-virtual-text")
	use("nvim-telescope/telescope-dap.nvim")

	-- buffer line
	use({
		"akinsho/bufferline.nvim",
		requires = {
			"kyazdani42/nvim-web-devicons",
		},
	})

	use({ "nvim-lualine/lualine.nvim", requires = {
		{ "SmiteshP/nvim-gps", opt = false },
	} })

	-- git
	use({
		"lewis6991/gitsigns.nvim",
		requires = { "nvim-lua/plenary.nvim" },
	})
	use({
		"sindrets/diffview.nvim",
		requires = { "nvim-lua/plenary.nvim" },
	})
	use("f-person/git-blame.nvim")
	use({
		"TimUntersberger/neogit",
		requires = { "nvim-lua/plenary.nvim" },
	})
	use("tpope/vim-fugitive")

	-- Dashboard (start screen)
	use({
		"goolord/alpha-nvim",
		requires = { "kyazdani42/nvim-web-devicons" },
	})

	-- Terminal
	use("akinsho/toggleterm.nvim")

	-- misc
	use({
		"norcalli/nvim-colorizer.lua",
		config = function()
			require("colorizer").setup()
		end,
	})
	use("karb94/neoscroll.nvim")

	-- Automatically set up your configuration after cloning packer.nvim
	-- Put this at the end after all plugins
	if packer_bootstrap then
		packer.sync()
	end
end)
