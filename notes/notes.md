# GUI

The GUI around the tool will show the nodes prior to them being rendered, i.e. in the same structure as your code. You can click on one of the rendered parts, e.g. "MyCoolGraphics", and the properties panel will open any configurable props.

# Sketch Settings

Usually you configure your sketch with settings in code. This includes things like the dimensions, working units, whether or not its animated, whether or not to restart the loop on each change (useful for parametric sketches, not desirable for simulations), and whether to clear or append the output, see here:

- Clear is default, the canvas will be cleared prior to being rendered into.
- Disabling clear means the canvas won't get cleared, and you'll have to do the first background frame if you want a solid fill
- How to handle SVG and other outputs with clear/no-clear?

# Overrides

Some settings you might want to override in the GUI editor. For example, you are coding as landscape, but you want to rotate it to portrait and export a frame, or import a previously fix-seeded work and change the random seed. You might do this in the UI.

# Meta Settings

Settings not defined in code, such as overrides, tweakable UI sliders/parameters, the current playing time and GUI window state, and other config would be applied in a `.meta` file that gets committed to the repository. This way, years later, you can re-open the file to the exact same configuration.

When a config is changed, like the background color, the meta file is written to. Writing/modifying the meta file does not cause a re-bundle.