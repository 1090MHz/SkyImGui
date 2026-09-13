# SkyImGui

SkyImGui is an interactive theme visualizer and generator for Dear ImGui, with a collection of themes inspired by airline brand colors.

[Open SkyImGui](https://skyimgui.netlify.app/)

## Features

- Preview Dear ImGui color roles in a browser
- Generate themes from one to four colors
- Browse airline-inspired color palettes
- Customize background, table, and accent colors
- Export themes as JSON or C++
- Import previously exported JSON themes
- Inspect each generated `ImGuiCol` value

Near-white livery colors remain visible in brand swatches but are excluded from interactive control roles when a more suitable brand color is available. This keeps controls legible and representative of the airline palette.

## Local Development

SkyImGui is a static site built with [Hugo](https://gohugo.io/). Netlify currently builds it with Hugo Extended 0.120.0.

```powershell
hugo server
```

Open `http://localhost:1313/`.

To run the production build used by Netlify:

```powershell
hugo --gc --minify
```

The generated site is written to `public/`.

## Project Structure

- `content/` contains page content and front matter.
- `themes/imgui-studio/layouts/` contains Hugo templates.
- `themes/imgui-studio/static/js/` contains the theme generator, presets, visualizer, and application logic.
- `themes/imgui-studio/static/css/` contains the site and preview styles.
- `themes/imgui-studio/static/data/` contains airline color data.
- `netlify.toml` defines the deployment build and response headers.

## Theme Exports

JSON exports identify `SkyImGui` as their author. C++ exports produce a Dear ImGui style function containing the selected `ImGuiCol_*` values.

The built-in Dark, Classic, and Light presets are based on Dear ImGui color definitions. Other presets and airline-inspired themes are community mappings and are not official Dear ImGui themes.

## Trademarks and Attribution

Dear ImGui is a third-party project and is not affiliated with or responsible for SkyImGui.

Airline names, trademarks, liveries, and brand colors belong to their respective owners. Their use in SkyImGui is descriptive and does not imply affiliation, sponsorship, or endorsement.

## License

SkyImGui is available under the [MIT License](LICENSE).