// Theme Generator - generates ImGui themes using canonical algorithm
// Based on reverse-engineered ImGui Dark theme design principles
class ThemeGenerator {
    constructor() {
        this.baseColors = {
            primary: '#4296f9',
            background: '#0f0f0f',
            accent: '#f96854'
        };
    }

    // ========================================================================
    // COLOR UTILITIES
    // ========================================================================
    
    hexToRgba(hex, alpha = 1.0) {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b, alpha];
    }

    rgbaToHex(rgba) {
        const r = Math.round(rgba[0] * 255).toString(16).padStart(2, '0');
        const g = Math.round(rgba[1] * 255).toString(16).padStart(2, '0');
        const b = Math.round(rgba[2] * 255).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    adjustAlpha(color, alpha) {
        return [color[0], color[1], color[2], alpha];
    }

    mix(color1, color2, ratio) {
        return [
            color1[0] + (color2[0] - color1[0]) * ratio,
            color1[1] + (color2[1] - color1[1]) * ratio,
            color1[2] + (color2[2] - color1[2]) * ratio,
            color1[3] + (color2[3] - color1[3]) * ratio
        ];
    }

    // ========================================================================
    // CANONICAL THEME ALGORITHM
    // Based on ImGui Dark theme design principles
    // ========================================================================

    /**
     * Grayscale values as percentages of anchor (accent R channel)
     * This maintains consistent visual hierarchy across themes
     */
    pctOfAnchor(anchor, percentage) {
        return Math.round(anchor * percentage / 100) / 255.0;
    }

    /**
     * Alpha transparency as percentages of 255
     * Standard alpha values used throughout ImGui
     */
    pctOf255(percentage) {
        return Math.round(255 * percentage / 100) / 255.0;
    }

    /**
     * Multiples of 5 for simple backgrounds
     * Creates clean RGB values (5, 10, 15, etc.)
     */
    mult5(value) {
        return value / 255.0;
    }

    /**
     * Grayscale RGB tuple using multiples of 5
     * Returns [gray, gray, gray] for spreading into RGBA arrays
     */
    rgb(value) {
        const gray = this.mult5(value);
        return [gray, gray, gray];
    }

    /**
     * Grayscale RGB tuple using percentage of 255
     * Returns [gray, gray, gray] for spreading into RGBA arrays
     */
    rgbPct(value) {
        const gray = this.pctOf255(value);
        return [gray, gray, gray];
    }

    /**
     * Grayscale RGB tuple based on anchor percentage
     * Returns [gray, gray, gray] for spreading into RGBA arrays
     */
    rgbAnchor(anchor, percentage) {
        const gray = this.pctOfAnchor(anchor, percentage);
        return [gray, gray, gray];
    }

    /**
     * Scale RGB vector by percentage (for visual hierarchy)
     * Reduces/increases color intensity while maintaining hue
     */
    scaleVector(rgb, percentage) {
        return [
            rgb[0] * percentage / 100,
            rgb[1] * percentage / 100,
            rgb[2] * percentage / 100
        ];
    }

    /**
     * Adjust HSV independently while maintaining hue
     * Used for separator colors and special variants
     */
    adjustHSV(rgb, satFactor = 1.0, valFactor = 1.0) {
        const r = rgb[0];
        const g = rgb[1];
        const b = rgb[2];
        
        // RGB to HSV
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        
        let h = 0;
        const s = max === 0 ? 0 : delta / max;
        const v = max;
        
        if (delta !== 0) {
            if (max === r) {
                h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
            } else if (max === g) {
                h = ((b - r) / delta + 2) / 6;
            } else {
                h = ((r - g) / delta + 4) / 6;
            }
        }
        
        // Apply adjustments
        const sNew = Math.min(1.0, s * satFactor);
        const vNew = Math.min(1.0, v * valFactor);
        
        // HSV to RGB
        const hSix = h * 6;
        const hFloor = Math.floor(hSix);
        const f = hSix - hFloor;
        const p = vNew * (1 - sNew);
        const q = vNew * (1 - f * sNew);
        const t = vNew * (1 - (1 - f) * sNew);
        
        let rNew, gNew, bNew;
        switch (hFloor % 6) {
            case 0: rNew = vNew; gNew = t; bNew = p; break;
            case 1: rNew = q; gNew = vNew; bNew = p; break;
            case 2: rNew = p; gNew = vNew; bNew = t; break;
            case 3: rNew = p; gNew = q; bNew = vNew; break;
            case 4: rNew = t; gNew = p; bNew = vNew; break;
            case 5: rNew = vNew; gNew = p; bNew = q; break;
        }
        
        return [rNew, gNew, bNew];
    }

    generateTheme(primaryHex, bgHex, accentHex, secondaryHex = null, tertiaryHex = null, quaternaryHex = null, tableHex = null) {
        // ====================================================================
        // CANONICAL THEME GENERATION
        // Using ImGui Dark theme design principles
        // ====================================================================
        
        // Convert hex to RGB [0-1]
        const primary = this.hexToRgba(primaryHex);
        const bg = this.hexToRgba(bgHex);
        const accent = this.hexToRgba(accentHex);
        const secondary = secondaryHex ? this.hexToRgba(secondaryHex) : null;
        const tertiary = tertiaryHex ? this.hexToRgba(tertiaryHex) : null;
        const quaternary = quaternaryHex ? this.hexToRgba(quaternaryHex) : null;
        
        // Table color (if not specified, derive from background)
        const tableColor = tableHex ? this.hexToRgba(tableHex) : null;

        // ====================================================================
        // CANONICAL COLOR ASSIGNMENT (Multi-color support)
        // ====================================================================
        // Color mode strategy:
        // 1-color: Primary for everything (title+frame+button+header+tab+table)
        // 2-color: Primary (title+frame), Secondary (button+header+tab+table)
        // 3-color: Primary (title+frame), Secondary (button), Tertiary (header+tab+table)
        // 4-color: Primary (title+frame), Secondary (button), Tertiary (header+tab), Quaternary (table)
        
        const titleAccent = primary;
        const buttonAccent = secondary ? secondary : primary;
        const headerAccent = tertiary ? tertiary : buttonAccent;
        const tabAccent = headerAccent;  // Tabs always follow headers
        const tableAccent = quaternary ? quaternary : (tableColor ? tableColor : null);
        
        // ====================================================================
        // ANCHORS - Use red channel as base for grayscale ladder
        // ====================================================================
        const titleAnchor = Math.round(titleAccent[0] * 255);
        const buttonAnchor = Math.round(buttonAccent[0] * 255);
        const headerAnchor = Math.round(headerAccent[0] * 255);
        const tableAnchor = tableAccent ? Math.round(tableAccent[0] * 255) : titleAnchor;
        
        // ====================================================================
        // DERIVED COLORS using canonical transformations
        // ====================================================================
        
        // Title/Frame colors (Primary accent)
        const titleFrameBg = this.scaleVector(titleAccent, 50);  // 50% vector magnitude
        const titleSliderGrab = this.scaleVector(titleAccent, 90);  // 90% vector magnitude
        const titleSeparator = this.adjustHSV(titleAccent, 1.15, 0.75);  // Increased sat, moderate brightness
        
        // Button colors (Secondary accent or Primary)
        const buttonFrameBg = this.scaleVector(buttonAccent, 50);
        const buttonSliderGrab = this.scaleVector(buttonAccent, 90);
        
        // Table colors (Quaternary accent or custom table color or grayscale)
        const tableGray73 = tableAccent ? this.pctOfAnchor(tableAnchor, 73) : gray73;
        const tableGray90 = tableAccent ? this.pctOfAnchor(tableAnchor, 90) : gray90;
        const tableGray120 = tableAccent ? this.pctOfAnchor(tableAnchor, 120) : gray120;
        
        // ====================================================================
        // GRAYSCALE LADDER (from title anchor for UI chrome)
        // ====================================================================
        const gray73 = this.pctOfAnchor(titleAnchor, 73);   // TableHeaderBg
        const gray90 = this.pctOfAnchor(titleAnchor, 90);   // TableBorderLight
        const gray120 = this.pctOfAnchor(titleAnchor, 120); // ScrollbarGrab
        const gray235 = this.pctOfAnchor(titleAnchor, 235); // PlotLines
        const gray300 = this.pctOfAnchor(titleAnchor, 300); // SeparatorHovered alpha
        
        // Determine theme description based on mode
        let description = "Generated theme (canonical algorithm)";
        if (quaternary) {
            description = "Four-color theme: Primary (title/frame), Secondary (button), Tertiary (header/tab), Quaternary (table)";
        } else if (tertiary) {
            description = "Three-color theme: Primary (title/frame), Secondary (button), Tertiary (header/tab/table)";
        } else if (secondary) {
            description = "Two-color theme: Primary (title/frame), Secondary (button/header/tab/table)";
        }

        // ====================================================================
        // THEME COLOR PALETTE - Using canonical transformations
        // ====================================================================
        
        const theme = {
            name: "Custom",
            author: "Theme Generator",
            description: description,
            colors: {
                // Text colors (canonical standard)
                Text: [this.mult5(255), this.mult5(255), this.mult5(255), this.mult5(255)],
                TextDisabled: [this.pctOf255(50), this.pctOf255(50), this.pctOf255(50), this.mult5(255)],
                
                // Background colors (multiples of 5)
                WindowBg: [this.mult5(15), this.mult5(15), this.mult5(15), this.pctOf255(94)],
                ChildBg: [this.mult5(0), this.mult5(0), this.mult5(0), this.mult5(0)],
                PopupBg: [this.mult5(20), this.mult5(20), this.mult5(20), this.pctOf255(94)],
                
                // Border (canonical)
                Border: [this.mult5(110), this.mult5(110), this.pctOf255(50), this.pctOf255(50)],
                BorderShadow: [this.mult5(0), this.mult5(0), this.mult5(0), this.mult5(0)],
                
                // ============================================================
                // FRAME COLORS - Using PRIMARY accent (title/frame group)
                // ============================================================
                FrameBg: [...titleFrameBg, this.pctOf255(54)],
                FrameBgHovered: [...titleAccent.slice(0, 3), this.pctOf255(40)],
                FrameBgActive: [...titleAccent.slice(0, 3), this.pctOf255(67)],
                
                // ============================================================
                // TITLE COLORS - Using PRIMARY accent
                // ============================================================
                TitleBg: [...this.scaleVector(titleAccent, 10), this.mult5(255)],  // 10% of primary accent (unfocused - very dark)
                TitleBgActive: [...titleFrameBg, this.mult5(255)],  // Same as FrameBg - 50% of primary accent (focused window)
                TitleBgCollapsed: [...this.scaleVector(titleAccent, 5), this.pctOf255(51)],  // 5% of primary accent, translucent
                
                // Menu bar (darkened primary accent)
                MenuBarBg: [...this.scaleVector(titleAccent, 35), this.mult5(255)],
                
                // Scrollbar (grayscale ladder)
                ScrollbarBg: [this.mult5(5), this.mult5(5), this.mult5(5), this.pctOf255(53)],
                ScrollbarGrab: [gray120, gray120, gray120, this.mult5(255)],
                ScrollbarGrabHovered: [this.mult5(105), this.mult5(105), this.mult5(105), this.mult5(255)],
                ScrollbarGrabActive: [this.mult5(130), this.mult5(130), this.mult5(130), this.mult5(255)],
                
                // ============================================================
                // INTERACTIVE ELEMENTS - Using PRIMARY for sliders/checkmarks
                // ============================================================
                CheckMark: [...titleAccent.slice(0, 3), this.mult5(255)],
                SliderGrab: [...titleSliderGrab, this.mult5(255)],
                SliderGrabActive: [...titleAccent.slice(0, 3), this.mult5(255)],
                
                // ============================================================
                // BUTTONS - Using SECONDARY accent (or primary if 1-color)
                // Web-style: Bright by default, dimmer on hover for feedback
                // ============================================================
                Button: [...buttonAccent.slice(0, 3), this.mult5(255)],  // 100% - bright, shows brand
                ButtonHovered: [...buttonAccent.slice(0, 3), this.pctOf255(80)],  // 80% - dimmer on hover
                ButtonActive: (() => {
                    const active = [buttonAccent[0] * 0.23, buttonAccent[1] * 0.90, buttonAccent[2], this.mult5(255)];
                    console.log('ButtonActive calc:', { 
                        buttonAccent: buttonAccent.map(v => v.toFixed(2)), 
                        active: active.map(v => v.toFixed(2)),
                        hex: '#' + Math.round(active[0]*255).toString(16).padStart(2,'0') + 
                             Math.round(active[1]*255).toString(16).padStart(2,'0') + 
                             Math.round(active[2]*255).toString(16).padStart(2,'0')
                    });
                    return active;
                })(),  // Darker - pressed effect
                
                // ============================================================
                // HEADERS - Using TERTIARY accent (or button if 2-color, or primary if 1-color)
                // Web-style: Bright by default, dimmer on hover for feedback
                // ============================================================
                Header: [...headerAccent.slice(0, 3), this.mult5(255)],  // 100% - bright, shows brand
                HeaderHovered: [...headerAccent.slice(0, 3), this.pctOf255(80)],  // 80% - dimmer on hover
                HeaderActive: [...headerAccent.slice(0, 3), this.pctOf255(80)],  // 80% - stays dimmed
                
                // ============================================================
                // SEPARATOR - Using PRIMARY accent with HSV adjustment
                // ============================================================
                Separator: [this.mult5(110), this.mult5(110), this.pctOf255(50), this.pctOf255(50)],  // Same as Border
                SeparatorHovered: [...titleSeparator, gray300],
                SeparatorActive: [...titleSeparator, this.mult5(255)],
                
                // ============================================================
                // RESIZE GRIP - Using BUTTON accent
                // ============================================================
                ResizeGrip: [...buttonAccent.slice(0, 3), this.pctOf255(20)],
                ResizeGripHovered: [...buttonAccent.slice(0, 3), this.pctOf255(67)],
                ResizeGripActive: [...buttonAccent.slice(0, 3), this.pctOf255(95)],
                
                // ============================================================
                // TABS - Using QUATERNARY accent (or tertiary/header if 3-color, etc.)
                // Using ImLerp as in canonical theme
                // ============================================================
                TabHovered: [...headerAccent.slice(0, 3), this.pctOf255(80)],  // Same as HeaderHovered
                
                // Tab = ImLerp(Header, TitleBgActive, 0.90) - darker inactive tabs
                Tab: this.mix(
                    [...headerAccent.slice(0, 3), this.mult5(255)],
                    [...titleFrameBg, this.mult5(255)],
                    0.90
                ),
                
                // TabSelected = ImLerp(HeaderActive, TitleBgActive, 0.20) - brightest (active tab)
                TabSelected: this.mix(
                    [...headerAccent.slice(0, 3), this.pctOf255(80)],
                    [...titleFrameBg, this.mult5(255)],
                    0.20
                ),
                
                TabSelectedOverline: [...headerAccent.slice(0, 3), this.mult5(255)],  // Same as HeaderActive
                
                // TabDimmed = ImLerp(Tab, TitleBg, 0.80)
                TabDimmed: this.mix(
                    this.mix([...headerAccent.slice(0, 3), this.mult5(255)], [...titleFrameBg, this.mult5(255)], 0.80),
                    [...this.scaleVector(titleAccent, 10), this.mult5(255)],
                    0.80
                ),
                
                // TabDimmedSelected = ImLerp(TabSelected, TitleBg, 0.40)
                TabDimmedSelected: this.mix(
                    this.mix([...headerAccent.slice(0, 3), this.mult5(255)], [...titleFrameBg, this.mult5(255)], 0.60),
                    [...this.scaleVector(titleAccent, 10), this.mult5(255)],
                    0.40
                ),
                
                TabDimmedSelectedOverline: [this.pctOf255(50), this.pctOf255(50), this.pctOf255(50), this.mult5(0)],
                
                // ============================================================
                // PLOTS (canonical grayscale)
                // ============================================================
                PlotLines: [gray235, gray235, gray235, this.mult5(255)],
                PlotLinesHovered: [this.mult5(255), this.mult5(110), this.pctOf255(35), this.mult5(255)],
                PlotHistogram: [this.pctOf255(90), this.pctOf255(70), this.mult5(0), this.mult5(255)],
                PlotHistogramHovered: [this.mult5(255), this.pctOf255(60), this.mult5(0), this.mult5(255)],
                
                // ============================================================
                // TABLES - Using QUATERNARY accent (or grayscale if not in 4-color mode)
                // ============================================================
                TableHeaderBg: tableAccent ? [...tableAccent.slice(0, 3), tableGray73] : [gray73, gray73, gray73, this.mult5(255)],
                TableBorderStrong: tableAccent ? [tableGray120, tableGray120, tableGray120, this.mult5(255)] : [gray120, gray120, gray120, this.mult5(255)],
                TableBorderLight: tableAccent ? [tableGray90, tableGray90, tableGray90, this.mult5(255)] : [gray90, gray90, gray90, this.mult5(255)],
                TableRowBg: [this.mult5(0), this.mult5(0), this.mult5(0), this.mult5(0)],
                TableRowBgAlt: tableAccent ? [...tableAccent.slice(0, 3), this.mult5(15)] : [this.mult5(255), this.mult5(255), this.mult5(255), this.mult5(15)],
                
                // ============================================================
                // NAVIGATION & SELECTION - Using BUTTON accent
                // ============================================================
                TextLink: [...headerAccent.slice(0, 3), this.mult5(255)],  // Same as HeaderActive
                TextSelectedBg: [...buttonAccent.slice(0, 3), this.pctOf255(35)],
                DragDropTarget: [this.mult5(255), this.mult5(255), this.mult5(0), this.pctOf255(90)],
                NavCursor: [...buttonAccent.slice(0, 3), this.mult5(255)],
                NavWindowingHighlight: [this.mult5(255), this.mult5(255), this.mult5(255), this.pctOf255(70)],
                NavWindowingDimBg: [this.pctOf255(80), this.pctOf255(80), this.pctOf255(80), this.pctOf255(20)],
                ModalWindowDimBg: [this.pctOf255(80), this.pctOf255(80), this.pctOf255(80), this.pctOf255(35)]
            }
        };

        return theme;
    }

    updateBaseColors(primary, background, accent) {
        this.baseColors.primary = primary;
        this.baseColors.background = background;
        this.baseColors.accent = accent;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeGenerator;
}
