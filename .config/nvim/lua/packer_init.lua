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

  -- PDE Plugins
  use({ "goolord/alpha-nvim", requires = { "kyazdani42/nvim-web-devicons" } })
  use("kyazdani42/nvim-tree.lua")
  use({
    "nvim-telescope/telescope.nvim",
    requires = {
      "nvim-lua/plenary.nvim",
    },
  })
  use("nvim-telescope/telescope-media-files.nvim")
  use("rmagatti/auto-session")
  use({
    "rmagatti/session-lens",
    requires = {
      "rmagatti/auto-session",
      "nvim-telescope/telescope.nvim",
    },
  })
  use("windwp/nvim-autopairs")
  use("kyazdani42/nvim-web-devicons")
  use({ "nvim-lualine/lualine.nvim", requires = { { "SmiteshP/nvim-gps", opt = false } } })
  use("karb94/neoscroll.nvim")

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
  use("arcticicestudio/nord-vim")
  use("cocopon/iceberg.vim")
  --use("BeatScherrer/gravel-pit.nvim")
  use("$HOME/workspace/git/beat/gravel-pit.nvim")
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
  use("github/copilot.vim")

  -- Commenting
  use("terrortylor/nvim-comment")

  -- Tasks
  -- use("tpope/vim-dispatch")
  -- use("NoahTheDuke/vim-just")
  -- use("BeatScherrer/just.nvim")
  use("$HOME/workspace/git/beat/just.nvim") -- use this for developing just.nvim

  -- snippets
  use("L3MON4D3/LuaSnip")
  use("rafamadriz/friendly-snippets")

  -- LSP & language support
  use("neovim/nvim-lspconfig")
  use("williamboman/nvim-lsp-installer")
  use("jose-elias-alvarez/null-ls.nvim")
  use("simrat39/rust-tools.nvim")

  -- Debugger
  use("mfussenegger/nvim-dap")
  use({ "rcarriga/nvim-dap-ui", requires = { "mfussenegger/nvim-dap" } })
  use("theHamsta/nvim-dap-virtual-text")
  use("ravenxrz/DAPInstall.nvim")
  use("nvim-telescope/telescope-dap.nvim")

  -- buffer line
  use({ "akinsho/bufferline.nvim", requires = { "kyazdani42/nvim-web-devicons" } })
  -- use({
  -- 	"noib3/nvim-cokeline",
  -- 	requires = "kyazdani42/nvim-web-devicons", -- If you want devicons
  -- 	config = function()
  -- 		require("cokeline").setup()
  -- 	end,
  -- })

  -- git
  use({ "lewis6991/gitsigns.nvim", requires = { "nvim-lua/plenary.nvim" } })
  use({ "sindrets/diffview.nvim", requires = { "nvim-lua/plenary.nvim" } })
  use({ "TimUntersberger/neogit", requires = { "nvim-lua/plenary.nvim" } })
  use("tpope/vim-fugitive")
  use("ThePrimeagen/git-worktree.nvim")

  -- Terminal
  use("akinsho/toggleterm.nvim")

  -- misc
  use("norcalli/nvim-colorizer.lua")
  use("lukas-reineke/indent-blankline.nvim")

  -- Automatically set up your configuration after cloning packer.nvim
  -- Put this at the end after all plugins
  if packer_bootstrap then
    packer.sync()
  end
end)
