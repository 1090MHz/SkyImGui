// Theme Visualizer - applies theme colors to the preview
class ThemeVisualizer {
    constructor() {
        this.currentTheme = null;
    }

    rgbaToString(rgba) {
        return `rgba(${Math.round(rgba[0] * 255)}, ${Math.round(rgba[1] * 255)}, ${Math.round(rgba[2] * 255)}, ${rgba[3]})`;
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        const colors = theme.colors;
        const root = document.documentElement;

        // Map ImGui colors to CSS variables
        const colorMap = {
            '--imgui-text': 'Text',
            '--imgui-text-disabled': 'TextDisabled',
            '--imgui-window-bg': 'WindowBg',
            '--imgui-child-bg': 'ChildBg',
            '--imgui-popup-bg': 'PopupBg',
            '--imgui-border': 'Border',
            '--imgui-border-shadow': 'BorderShadow',
            '--imgui-frame-bg': 'FrameBg',
            '--imgui-frame-bg-hovered': 'FrameBgHovered',
            '--imgui-frame-bg-active': 'FrameBgActive',
            '--imgui-titlebar': 'TitleBg',
            '--imgui-titlebar-active': 'TitleBgActive',
            '--imgui-titlebar-collapsed': 'TitleBgCollapsed',
            '--imgui-menubar-bg': 'MenuBarBg',
            '--imgui-scrollbar-bg': 'ScrollbarBg',
            '--imgui-scrollbar-grab': 'ScrollbarGrab',
            '--imgui-scrollbar-grab-hovered': 'ScrollbarGrabHovered',
            '--imgui-scrollbar-grab-active': 'ScrollbarGrabActive',
            '--imgui-checkmark': 'CheckMark',
            '--imgui-slider-grab': 'SliderGrab',
            '--imgui-slider-grab-active': 'SliderGrabActive',
            '--imgui-button': 'Button',
            '--imgui-button-hovered': 'ButtonHovered',
            '--imgui-button-active': 'ButtonActive',
            '--imgui-header': 'Header',
            '--imgui-header-hovered': 'HeaderHovered',
            '--imgui-header-active': 'HeaderActive',
            '--imgui-separator': 'Separator',
            '--imgui-separator-hovered': 'SeparatorHovered',
            '--imgui-separator-active': 'SeparatorActive',
            '--imgui-resize-grip': 'ResizeGrip',
            '--imgui-resize-grip-hovered': 'ResizeGripHovered',
            '--imgui-resize-grip-active': 'ResizeGripActive',
            '--imgui-tab': 'Tab',
            '--imgui-tab-hovered': 'TabHovered',
            '--imgui-tab-selected': 'TabSelected',
            '--imgui-tab-selected-overline': 'TabSelectedOverline',
            '--imgui-tab-dimmed': 'TabDimmed',
            '--imgui-tab-dimmed-selected': 'TabDimmedSelected',
            '--imgui-table-header-bg': 'TableHeaderBg',
            '--imgui-table-border-strong': 'TableBorderStrong',
            '--imgui-table-border-light': 'TableBorderLight',
            '--imgui-table-row-bg': 'TableRowBg',
            '--imgui-table-row-bg-alt': 'TableRowBgAlt',
            '--imgui-text-selected-bg': 'TextSelectedBg',
            '--imgui-drag-drop-target': 'DragDropTarget',
            '--imgui-nav-cursor': 'NavCursor'
        };

        // Apply all colors
        console.log('applyTheme - about to apply colors');
        for (const [cssVar, colorName] of Object.entries(colorMap)) {
            if (colors[colorName]) {
                const rgbaString = this.rgbaToString(colors[colorName]);
                if (cssVar === '--imgui-button' || cssVar === '--imgui-button-hovered' || cssVar === '--imgui-button-active') {
                    console.log(`Setting ${colorName} (${cssVar}):`, { 
                        rgba: colors[colorName].map(v => v.toFixed(2)), 
                        cssString: rgbaString 
                    });
                }
                root.style.setProperty(cssVar, rgbaString);
            }
        }
        console.log('applyTheme - finished applying colors');

        // Update color details grid
        this.updateColorGrid(colors);
    }

    updateColorGrid(colors) {
        console.log('updateColorGrid called with', Object.keys(colors).length, 'colors');
        const grid = document.getElementById('colorGrid');
        if (!grid) {
            console.error('colorGrid element not found!');
            return;
        }

        grid.innerHTML = '';

        // Helper to calculate HSV
        const rgbToHsv = (r, g, b) => {
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const delta = max - min;
            
            let h = 0;
            if (delta !== 0) {
                if (max === r) h = 60 * (((g - b) / delta) % 6);
                else if (max === g) h = 60 * (((b - r) / delta) + 2);
                else h = 60 * (((r - g) / delta) + 4);
            }
            if (h < 0) h += 360;
            
            const s = max === 0 ? 0 : (delta / max) * 100;
            const v = max * 100;
            
            return { h, s, v };
        };

        // Create array of all colors with HSV
        const colorList = [];
        for (const [name, rgba] of Object.entries(colors)) {
            const hsv = rgbToHsv(rgba[0], rgba[1], rgba[2]);
            colorList.push({ name, rgba, hsv });
        }

        // Sort strictly by HSV: hue first, then saturation, then value
        colorList.sort((a, b) => {
            // Sort by hue
            if (Math.abs(a.hsv.h - b.hsv.h) > 1) return a.hsv.h - b.hsv.h;
            // Then by saturation
            if (Math.abs(a.hsv.s - b.hsv.s) > 1) return a.hsv.s - b.hsv.s;
            // Then by value (brightness)
            return a.hsv.v - b.hsv.v;
        });

        // Create header
        const heading = document.createElement('h4');
        heading.className = 'category-heading';
        heading.textContent = `Current Theme Colors`;
        grid.appendChild(heading);

        // Create grid container
        const colorGrid = document.createElement('div');
        colorGrid.className = 'color-grid-compact';

        // Add each color to the grid
        let lastHue = -1;
        for (const { name, rgba, hsv } of colorList) {
            // Add separator after all Hue=0 items (grayscale section)
            if (lastHue === 0 && hsv.h > 0) {
                const separator = document.createElement('div');
                separator.className = 'color-separator';
                colorGrid.appendChild(separator);
            }
            // Add separator after Hue=60 items (yellow/plot colors)
            if (lastHue > 0 && lastHue <= 60 && hsv.h > 60) {
                const separator = document.createElement('div');
                separator.className = 'color-separator';
                colorGrid.appendChild(separator);
            }
            lastHue = hsv.h;

            const item = document.createElement('div');
            item.className = 'color-item-compact';

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch-compact';
            
            // Left half: opaque color (no alpha)
            const opaqueHalf = document.createElement('div');
            opaqueHalf.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: 50%;
                height: 100%;
                background: rgb(${Math.round(rgba[0] * 255)}, ${Math.round(rgba[1] * 255)}, ${Math.round(rgba[2] * 255)});
                border-radius: 4px 0 0 4px;
            `;
            
            // Right half: color with alpha over checkerboard
            const alphaHalf = document.createElement('div');
            alphaHalf.style.cssText = `
                position: absolute;
                right: 0;
                top: 0;
                width: 50%;
                height: 100%;
                background: ${this.rgbaToString(rgba)};
                border-radius: 0 4px 4px 0;
            `;
            
            swatch.appendChild(opaqueHalf);
            swatch.appendChild(alphaHalf);

            const info = document.createElement('div');
            info.className = 'color-info';

            const colorName = document.createElement('div');
            colorName.className = 'color-name';
            colorName.textContent = name;

            const colorValue = document.createElement('div');
            colorValue.className = 'color-value';
            colorValue.textContent = `H:${hsv.h.toFixed(0)}° S:${hsv.s.toFixed(0)}% V:${hsv.v.toFixed(0)}% A:${(rgba[3] * 100).toFixed(0)}%`;

            info.appendChild(colorName);
            info.appendChild(colorValue);
            item.appendChild(swatch);
            item.appendChild(info);
            colorGrid.appendChild(item);
        }

        grid.appendChild(colorGrid);
    }

    exportToJSON() {
        if (!this.currentTheme) return null;
        
        // Convert RGBA arrays to hex format
        const rgbaToHex = (rgba) => {
            const r = Math.max(0, Math.min(255, Math.round(rgba[0] * 255)));
            const g = Math.max(0, Math.min(255, Math.round(rgba[1] * 255)));
            const b = Math.max(0, Math.min(255, Math.round(rgba[2] * 255)));
            const a = Math.max(0, Math.min(255, Math.round(rgba[3] * 255)));
            return '#' + [r, g, b, a].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
        };
        
        const hexColors = {};
        for (const [name, rgba] of Object.entries(this.currentTheme.colors)) {
            hexColors[name] = rgbaToHex(rgba);
        }
        
        // Format like airline JSON files
        const output = {
            name: this.currentTheme.name || "Custom Theme",
            author: "SkyImGui",
            description: this.currentTheme.description || "Custom theme created with ImGui Theme Studio",
            brand_colors: this.currentTheme.brand_colors || [],
            colors: hexColors
        };
        
        return JSON.stringify(output, null, 2);
    }

    exportToCpp() {
        if (!this.currentTheme) return null;

        const colors = this.currentTheme.colors;
        const functionName = this.currentTheme.name.replace(/\s+/g, '');

        let cpp = `#include <imgui.h>\n#include <imgui_internal.h>\n\n`;
        cpp += `void ImGui::StyleColors${functionName}(ImGuiStyle* dst)\n{\n`;
        cpp += `    ImGuiStyle* style = dst ? dst : &ImGui::GetStyle();\n`;
        cpp += `    ImVec4* colors = style->Colors;\n\n`;

        for (const [name, rgba] of Object.entries(colors)) {
            cpp += `    colors[ImGuiCol_${name}] = ImVec4(${rgba[0].toFixed(2)}f, ${rgba[1].toFixed(2)}f, ${rgba[2].toFixed(2)}f, ${rgba[3].toFixed(2)}f);\n`;
        }

        cpp += `}\n`;
        return cpp;
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeVisualizer;
}
