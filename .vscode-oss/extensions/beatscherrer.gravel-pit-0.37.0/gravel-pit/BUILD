# Bazel target definition for the gravel-pit color-theme(s)

# ------------------------------------------------------------------------------
# Build
# ------------------------------------------------------------------------------
load("@io_bazel_rules_jsonnet//jsonnet:jsonnet.bzl", "jsonnet_to_json")

jsonnet_to_json(
  name = "gravel-pit-dark",
  src = "gravel-pit-color-theme-dark.jsonnet",
  outs = ["gravel-pit-color-theme-dark.json"]
)

jsonnet_to_json(
  name = "gravel-pit-light",
  src = "gravel-pit-color-theme-light.jsonnet",
  outs = ["gravel-pit-color-theme-light.json"]
)
