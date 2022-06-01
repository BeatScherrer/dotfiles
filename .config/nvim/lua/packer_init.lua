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

	-- Color schemes
	use("navarasu/onedark.nvim")
	use("tanvirtin/monokai.nvim")
	use({ "rose-pine/neovim", as = "rose-pine" })
	use("folke/tokyonight.nvim")
	use({ "jacoborus/tender.vim", as = "tender" })
	use("RRethy/nvim-base16")

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

	use({
		"terrortylor/nvim-comment",
		config = function()
			require("nvim_comment").setup()
		end,
	})

	-- unit test
	use({
		"rcarriga/vim-ultest",
		requires = { "vim-test/vim-test" },
		run = ":UpdateRemotePlugins",
	})

	-- snippets
	use("L3MON4D3/LuaSnip")
	use("rafamadriz/friendly-snippets")

	-- LSP
	use("neovim/nvim-lspconfig")
	use("williamboman/nvim-lsp-installer")
	use("jose-elias-alvarez/null-ls.nvim")

	-- buffer line
	use({
		"akinsho/bufferline.nvim",
		requires = {
			"kyazdani42/nvim-web-devicons",
		},
	})

	-- Statusline
	use({
		"glepnir/galaxyline.nvim",
		branch = "main",
		-- your statusline
		-- some optional icons
		requires = {
			{ "kyazdani42/nvim-web-devicons", opt = true },
			{ "SmiteshP/nvim-gps", opt = false },
		},
	})

	-- git
	use({
		"lewis6991/gitsigns.nvim",
		requires = { "nvim-lua/plenary.nvim" },
		config = function()
			require("gitsigns").setup()
		end,
	})
	use({
		"sindrets/diffview.nvim",
		requires = { "nvim-lua/plenary.nvim" },
	})
	use("f-person/git-blame.nvim")

	-- markdown preview
	use({
		"iamcco/markdown-preview.nvim",
		run = "cd app && npm install",
		setup = function()
			vim.g.mkdp_filetypes = { "markdown" }
		end,
		ft = { "markdown" },
	})

	-- Dashboard (start screen)
	use({
		"goolord/alpha-nvim",
		requires = { "kyazdani42/nvim-web-devicons" },
	})

	-- Terminal
	use("akinsho/toggleterm.nvim")

	-- misc
	use("wfxr/minimap.vim")
	use({
		"norcalli/nvim-colorizer.lua",
		config = function()
			require("colorizer").setup()
		end,
	})

	-- Automatically set up your configuration after cloning packer.nvim
	-- Put this at the end after all plugins
	if packer_bootstrap then
		packer.sync()
	end
end)
