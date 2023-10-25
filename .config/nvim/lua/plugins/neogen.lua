return {
  "danymat/neogen",
  dependencies = "nvim-treesitter/nvim-treesitter",
  config = true,
  keys = {
    { "<leader>cd", "<cmd>Neogen<cr>", desc = "Generate Documentation" },
  },
  -- Uncomment next line if you want to follow only stable versions
  -- version = "*"
}
