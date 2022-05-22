local util = require "lspconfig.util"

local root_files = {
  '.clangd',
  'compile_commands.json'
}


return {
  root_dir = function(fname)
    return util.root_pattern(unpack(root_files))(fname) or util.find_git_ancestor(fname)
  end,
  cmd = {"clangd"},
  settings = {
  },
}
