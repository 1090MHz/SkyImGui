// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    const generator = new ThemeGenerator();
    const visualizer = new ThemeVisualizer();

    // Input elements
    const primaryColorInput = document.getElementById('primaryColor');
    const secondaryColorInput = document.getElementById('secondaryColor');
    const tertiaryColorInput = document.getElementById('tertiaryColor');
    const quaternaryColorInput = document.getElementById('quaternaryColor');
    const bgColorInput = document.getElementById('bgColor');
    const tableColorInput = document.getElementById('tableColor');
    const accentColorInput = document.getElementById('accentColor');
    
    // Hex input elements
    const primaryColorHex = document.getElementById('primaryColorHex');
    const secondaryColorHex = document.getElementById('secondaryColorHex');
    const tertiaryColorHex = document.getElementById('tertiaryColorHex');
    const quaternaryColorHex = document.getElementById('quaternaryColorHex');
    const bgColorHex = document.getElementById('bgColorHex');
    const tableColorHex = document.getElementById('tableColorHex');
    const accentColorHex = document.getElementById('accentColorHex');
    
    const presetSelect = document.getElementById('themePreset');
    const airlineSelect = document.getElementById('airlinePreset');
    const colorModeRadios = document.querySelectorAll('input[name="colorMode"]');
    const secondaryColorGroup = document.getElementById('secondaryColorGroup');
    const tertiaryColorGroup = document.getElementById('tertiaryColorGroup');
    const quaternaryColorGroup = document.getElementById('quaternaryColorGroup');
    const accentColorGroup = document.getElementById('accentColorGroup');

    // Sync color picker with hex input
    function syncColorToHex(colorInput, hexInput) {
        colorInput.addEventListener('input', (e) => {
            hexInput.value = e.target.value.toUpperCase();
        });
    }

    // Sync hex input with color picker
    function syncHexToColor(hexInput, colorInput) {
        hexInput.addEventListener('input', (e) => {
            const hex = e.target.value;
            if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                colorInput.value = hex;
                // Trigger color input change event
                colorInput.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    // Set up bidirectional sync for all color inputs
    syncColorToHex(primaryColorInput, primaryColorHex);
    syncHexToColor(primaryColorHex, primaryColorInput);
    syncColorToHex(secondaryColorInput, secondaryColorHex);
    syncHexToColor(secondaryColorHex, secondaryColorInput);
    syncColorToHex(tertiaryColorInput, tertiaryColorHex);
    syncHexToColor(tertiaryColorHex, tertiaryColorInput);
    syncColorToHex(quaternaryColorInput, quaternaryColorHex);
    syncHexToColor(quaternaryColorHex, quaternaryColorInput);
    syncColorToHex(bgColorInput, bgColorHex);
    syncHexToColor(bgColorHex, bgColorInput);
    syncColorToHex(tableColorInput, tableColorHex);
    syncHexToColor(tableColorHex, tableColorInput);
    syncColorToHex(accentColorInput, accentColorHex);
    syncHexToColor(accentColorHex, accentColorInput);

    // Button elements
    const generateBtn = document.getElementById('generateTheme');
    const resetBtn = document.getElementById('resetTheme');
    const exportJsonBtn = document.getElementById('exportJson');
    const exportCppBtn = document.getElementById('exportCpp');
    const copyJsonBtn = document.getElementById('copyJson');
    const importBtn = document.getElementById('importBtn');
    const importFile = document.getElementById('importFile');

    // Initialize with dark theme
    // Don't apply preset - instead generate using canonical algorithm
    // This ensures consistency between initial load and user interactions
    // visualizer.applyTheme(THEME_PRESETS.dark);
    
    // Load and populate airline colors
    fetch('/data/csv/airline_brand_colors_all.csv')
        .then(response => {
            console.log('Airline CSV response status:', response.status);
            return response.text();
        })
        .then(csv => {
            console.log('CSV loaded, length:', csv.length);
            const lines = csv.trim().split('\n').slice(1); // Skip header
            console.log('Number of lines:', lines.length);
            const airlines = [];
            
            lines.forEach(line => {
                // Split on first comma to separate airline name from colors
                const firstComma = line.indexOf(',');
                if (firstComma === -1) return;
                
                const airline = line.substring(0, firstComma).trim();
                const colorPart = line.substring(firstComma + 1).trim();
                
                // Extract all hex colors using regex
                const colors = colorPart.match(/#[0-9A-Fa-f]{6}/g) || [];
                
                // Only include airlines with 1-4 colors
                if (colors.length <= 4 && colors.length > 0) {
                    airlines.push({ name: airline, colors: colors });
                }
            });
            
            console.log('Total airlines with 1-4 colors:', airlines.length);
            
            // Sort airlines alphabetically
            airlines.sort((a, b) => a.name.localeCompare(b.name));
            
            // Populate dropdown
            airlines.forEach(airline => {
                const option = document.createElement('option');
                option.value = JSON.stringify(airline.colors);
                option.textContent = `${airline.name} (${airline.colors.length} color${airline.colors.length > 1 ? 's' : ''})`;
                airlineSelect.appendChild(option);
            });
            
            console.log('Dropdown populated with', airlines.length, 'airlines');
            
            // Check if we need to apply an airline theme from sessionStorage (after dropdown is populated)
            const applyTheme = sessionStorage.getItem('applyTheme');
            if (applyTheme) {
                const theme = JSON.parse(applyTheme);
                sessionStorage.removeItem('applyTheme');
                
                console.log('Applying airline theme:', theme);
                
                // Set the color values FIRST before selecting airline
                primaryColorHex.value = theme.primaryColor;
                primaryColorInput.value = theme.primaryColor;
                secondaryColorHex.value = theme.secondaryColor || theme.accentColor; // fallback for old format
                secondaryColorInput.value = theme.secondaryColor || theme.accentColor;
                
                // Determine color mode based on available colors
                let colorMode = '2';
                const colors = theme.brandColors || [theme.primaryColor, theme.secondaryColor || theme.accentColor];
                
                if (theme.tertiaryColor && theme.tertiaryColor !== theme.secondaryColor) {
                    colorMode = '3';
                    tertiaryColorHex.value = theme.tertiaryColor;
                    tertiaryColorInput.value = theme.tertiaryColor;
                    
                    if (theme.quaternaryColor && theme.quaternaryColor !== theme.tertiaryColor) {
                        colorMode = '4';
                        quaternaryColorHex.value = theme.quaternaryColor;
                        quaternaryColorInput.value = theme.quaternaryColor;
                    }
                }
                
                // Switch to appropriate color mode
                const colorRadio = document.querySelector(`input[name="colorMode"][value="${colorMode}"]`);
                if (colorRadio) {
                    colorRadio.checked = true;
                    colorRadio.dispatchEvent(new Event('change'));
                }
                
                // Select the airline in the dropdown and manually update swatches
                if (theme.airline) {
                    const swatchContainer = document.getElementById('airlineColorSwatches');
                    // Find the option that matches the airline name
                    for (let i = 0; i < airlineSelect.options.length; i++) {
                        if (airlineSelect.options[i].text.startsWith(theme.airline)) {
                            airlineSelect.selectedIndex = i;
                            // Manually update swatches without triggering change event
                            swatchContainer.innerHTML = colors.map(color => 
                                `<span class="color-swatch" style="background-color: ${color};" title="${color}"></span>`
                            ).join('');
                            break;
                        }
                    }
                }
                
                // Trigger theme generation
                setTimeout(() => generateCustomTheme(), 150);
            }
        })
        .catch(err => console.error('Failed to load airline colors:', err));
    
    // Handle airline preset selection
    airlineSelect.addEventListener('change', (e) => {
        const swatchContainer = document.getElementById('airlineColorSwatches');
        
        if (!e.target.value) {
            swatchContainer.innerHTML = '';
            return;
        }
        
        const colors = JSON.parse(e.target.value);
        const themeColors = getAirlineThemeColors(colors);
        const numColors = themeColors.length;
        
        // Display color swatches
        swatchContainer.innerHTML = colors.map(color => 
            `<span class="color-swatch" style="background-color: ${color};" title="${color}"></span>`
        ).join('');
        
        // Set appropriate color mode
        const modeRadio = document.querySelector(`input[name="colorMode"][value="${numColors}"]`);
        if (modeRadio) {
            modeRadio.checked = true;
            modeRadio.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Apply colors to inputs
        if (themeColors[0]) {
            primaryColorInput.value = themeColors[0];
            primaryColorHex.value = themeColors[0].toUpperCase();
        }
        if (themeColors[1] && numColors >= 2) {
            secondaryColorInput.value = themeColors[1];
            secondaryColorHex.value = themeColors[1].toUpperCase();
        }
        if (themeColors[2] && numColors >= 3) {
            tertiaryColorInput.value = themeColors[2];
            tertiaryColorHex.value = themeColors[2].toUpperCase();
        }
        if (themeColors[3] && numColors === 4) {
            quaternaryColorInput.value = themeColors[3];
            quaternaryColorHex.value = themeColors[3].toUpperCase();
        }
        
        generateCustomTheme();
    });

    // Handle color mode changes
    colorModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const mode = e.target.value;
            updateLabelsForMode(mode);
            if (mode === '1') {
                secondaryColorGroup.style.display = 'none';
                tertiaryColorGroup.style.display = 'none';
                quaternaryColorGroup.style.display = 'none';
                accentColorGroup.style.display = 'block';
            } else if (mode === '2') {
                secondaryColorGroup.style.display = 'block';
                tertiaryColorGroup.style.display = 'none';
                quaternaryColorGroup.style.display = 'none';
                accentColorGroup.style.display = 'none';
            } else if (mode === '3') {
                secondaryColorGroup.style.display = 'block';
                tertiaryColorGroup.style.display = 'block';
                quaternaryColorGroup.style.display = 'none';
                accentColorGroup.style.display = 'none';
            } else if (mode === '4') {
                secondaryColorGroup.style.display = 'block';
                tertiaryColorGroup.style.display = 'block';
                quaternaryColorGroup.style.display = 'block';
                accentColorGroup.style.display = 'none';
            }
            generateCustomTheme();
        });
    });

    // Update labels based on color mode
    function updateLabelsForMode(mode) {
        const secondaryLabel = document.querySelector('label[for="secondaryColor"]');
        const tertiaryLabel = document.querySelector('label[for="tertiaryColor"]');
        const quaternaryLabel = document.querySelector('label[for="quaternaryColor"]');
        
        if (mode === '2') {
            secondaryLabel.textContent = 'Secondary Color (Buttons + Headers + Tabs + Tables)';
        } else if (mode === '3') {
            secondaryLabel.textContent = 'Secondary Color (Buttons)';
            tertiaryLabel.textContent = 'Tertiary Color (Headers + Tabs + Tables)';
        } else if (mode === '4') {
            secondaryLabel.textContent = 'Secondary Color (Buttons)';
            tertiaryLabel.textContent = 'Tertiary Color (Headers + Tabs)';
            quaternaryLabel.textContent = 'Quaternary Color (Tables)';
        }
    }

    // Generate theme from color inputs
    function generateCustomTheme() {
        console.log('generateCustomTheme called');
        const primary = primaryColorInput.value;
        const bg = bgColorInput.value;
        const table = tableColorInput.value;
        const colorMode = document.querySelector('input[name="colorMode"]:checked');
        
        if (!colorMode) {
            console.error('No color mode selected');
            return;
        }
        
        const mode = colorMode.value;
        console.log('Color mode:', mode);
        
        let theme;
        if (mode === '1') {
            // In 1-color mode, use primary for everything (including accent parameter)
            theme = generator.generateTheme(primary, bg, primary, null, null, null, table);
        } else if (mode === '2') {
            const secondary = secondaryColorInput.value;
            theme = generator.generateTheme(primary, bg, primary, secondary, null, null, table);
        } else if (mode === '3') {
            const secondary = secondaryColorInput.value;
            const tertiary = tertiaryColorInput.value;
            theme = generator.generateTheme(primary, bg, primary, secondary, tertiary, null, table);
        } else if (mode === '4') {
            const secondary = secondaryColorInput.value;
            const tertiary = tertiaryColorInput.value;
            const quaternary = quaternaryColorInput.value;
            theme = generator.generateTheme(primary, bg, primary, secondary, tertiary, quaternary, table);
        }
        
        if (theme) {
            console.log('Theme generated:', theme);
            visualizer.applyTheme(theme);
        } else {
            console.error('Failed to generate theme');
        }
    }

    // Live preview on color change
    let debounceTimer;
    function onColorChange() {
        console.log('onColorChange triggered');
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(generateCustomTheme, 300);
    }

    primaryColorInput.addEventListener('input', onColorChange);
    if (secondaryColorInput) secondaryColorInput.addEventListener('input', onColorChange);
    if (tertiaryColorInput) tertiaryColorInput.addEventListener('input', onColorChange);
    if (quaternaryColorInput) quaternaryColorInput.addEventListener('input', onColorChange);
    bgColorInput.addEventListener('input', onColorChange);
    tableColorInput.addEventListener('input', onColorChange);
    accentColorInput.addEventListener('input', onColorChange);

    console.log('Event listeners attached:', {
        primary: !!primaryColorInput,
        secondary: !!secondaryColorInput,
        tertiary: !!tertiaryColorInput,
        quaternary: !!quaternaryColorInput,
        bg: !!bgColorInput,
        table: !!tableColorInput,
        accent: !!accentColorInput
    });

    // Initialize with canonical ImGui Dark theme preset
    visualizer.applyTheme(THEME_PRESETS.dark);

    // Generate button
    generateBtn.addEventListener('click', generateCustomTheme);

    // Reset button
    resetBtn.addEventListener('click', () => {
        visualizer.applyTheme(THEME_PRESETS.dark);
        presetSelect.value = 'dark';
        primaryColorInput.value = '#4296f9';
        primaryColorHex.value = '#4296F9';
        bgColorInput.value = '#0f0f0f';
        bgColorHex.value = '#0F0F0F';
        accentColorInput.value = '#f96854';
        accentColorHex.value = '#F96854';
        tableColorInput.value = '#3a3a3a';
        tableColorHex.value = '#3A3A3A';
    });

    // Preset selection
    presetSelect.addEventListener('change', (e) => {
        const presetName = e.target.value;
        if (THEME_PRESETS[presetName]) {
            visualizer.applyTheme(THEME_PRESETS[presetName]);
            
            // Update color inputs to match preset (approximate)
            if (presetName === 'dark') {
                primaryColorInput.value = '#4296f9';
                bgColorInput.value = '#0f0f0f';
                accentColorInput.value = '#f96854';
            } else if (presetName === 'classic') {
                primaryColorInput.value = '#bd93f9';
                bgColorInput.value = '#282a36';
                accentColorInput.value = '#ff79c6';
            } else if (presetName === 'light') {
                primaryColorInput.value = '#4296f9';
                bgColorInput.value = '#f0f0f0';
                accentColorInput.value = '#f96854';
            } else if (presetName === 'nord') {
                primaryColorInput.value = '#88c0d0';
                bgColorInput.value = '#2e3440';
                accentColorInput.value = '#bf616a';
            } else if (presetName === 'gruvbox') {
                primaryColorInput.value = '#83997d';
                bgColorInput.value = '#282828';
                accentColorInput.value = '#fb4934';
            }
        }
    });

    // Export JSON
    exportJsonBtn.addEventListener('click', () => {
        const json = visualizer.exportToJSON();
        if (json) {
            // Get airline name if selected
            const airlineOption = airlineSelect.options[airlineSelect.selectedIndex];
            const airlineName = airlineOption && airlineOption.text && airlineOption.text !== '-- Select Airline --' 
                ? airlineOption.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                : null;
            
            const filename = airlineName 
                ? `imgui-theme-${airlineName}.json`
                : `imgui-theme-${Date.now()}.json`;
            visualizer.downloadFile(json, filename, 'application/json');
        }
    });

    // Export C++
    exportCppBtn.addEventListener('click', () => {
        const cpp = visualizer.exportToCpp();
        if (cpp) {
            // Get airline name if selected
            const airlineOption = airlineSelect.options[airlineSelect.selectedIndex];
            const airlineName = airlineOption && airlineOption.text && airlineOption.text !== '-- Select Airline --' 
                ? airlineOption.text.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                : null;
            
            const filename = airlineName 
                ? `imgui-theme-${airlineName}.cpp`
                : `imgui-theme-${Date.now()}.cpp`;
            visualizer.downloadFile(cpp, filename, 'text/x-c++src');
        }
    });

    // Copy JSON to clipboard
    copyJsonBtn.addEventListener('click', async () => {
        const json = visualizer.exportToJSON();
        if (json) {
            try {
                await navigator.clipboard.writeText(json);
                copyJsonBtn.textContent = '✓ Copied!';
                setTimeout(() => {
                    copyJsonBtn.textContent = '📋 Copy JSON';
                }, 2000);
            } catch (err) {
                alert('Failed to copy to clipboard');
            }
        }
    });

    // Import button
    importBtn.addEventListener('click', () => {
        importFile.click();
    });

    // Import file
    importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const theme = JSON.parse(event.target.result);
                visualizer.applyTheme(theme);
                presetSelect.value = ''; // Clear preset selection
            } catch (err) {
                alert('Failed to parse JSON file: ' + err.message);
            }
        };
        reader.readAsText(file);
    });

    // Add interactive effects to preview windows
    const windows = document.querySelectorAll('.imgui-window');
    windows.forEach(window => {
        const titlebar = window.querySelector('.imgui-titlebar');
        if (titlebar) {
            let isDragging = false;
            let startX = 0, startY = 0;
            let currentTranslateX = 0, currentTranslateY = 0;

            titlebar.style.cursor = 'move';

            titlebar.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX - currentTranslateX;
                startY = e.clientY - currentTranslateY;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                
                currentTranslateX = e.clientX - startX;
                currentTranslateY = e.clientY - startY;
                
                window.style.transform = `translate(${currentTranslateX}px, ${currentTranslateY}px)`;
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
    });

    // Add header collapse functionality
    const headers = document.querySelectorAll('.imgui-header');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            header.classList.toggle('active');
            const content = header.nextElementSibling;
            if (content && content.classList.contains('imgui-header-content')) {
                content.style.display = header.classList.contains('collapsed') ? 'none' : 'block';
            }
        });
    });

    // Add tab click functionality
    const tabs = document.querySelectorAll('.imgui-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs in this tab group
            const tabGroup = tab.parentElement;
            tabGroup.querySelectorAll('.imgui-tab').forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            tab.classList.add('active');
        });
    });

    // Add window active state functionality
    const previewWindows = document.querySelectorAll('.imgui-window');
    previewWindows.forEach(window => {
        // Add titlebar click to activate window
        const titlebar = window.querySelector('.imgui-titlebar');
        if (titlebar) {
            titlebar.addEventListener('click', () => {
                // Remove active class from all windows
                document.querySelectorAll('.imgui-window').forEach(w => w.classList.remove('active'));
                // Add active class to clicked window
                window.classList.add('active');
            });
        }
    });

    // Set all windows as active by default for preview (showcase theme colors)
    previewWindows.forEach(window => window.classList.add('active'));
});
