return {
  -- the opts function can also be used to change the default opts:
  {
    "nvim-lualine/lualine.nvim",
    event = "VeryLazy",
    -- TODO: enable nvim-navic at the top and not in the status line at the bottom
    opts = {
      -- sections = {
      --   lualine_c = {
      --     {
      --       function()
      --         local navic = require("nvim-navic")
      --         return navic.get_location()
      --       end,
      --       cond = function()
      --         local navic = require("nvim-navic")
      --         return navic.is_available()
      --       end,
      --     },
      --   },
      -- },
    },
  },
}
