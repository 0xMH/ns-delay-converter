# NS Delay Time Converter

A Tampermonkey userscript that shows actual departure/arrival times on [NS.nl](https://www.ns.nl) by calculating scheduled time + delay.

## The Problem

NS.nl shows train delays like `+12` next to the scheduled time `10:00`, requiring you to mentally calculate the actual departure time.

## The Solution

This script automatically calculates and displays the actual time:

- **Before:** `10:00 +12`
- **After:** `10:00 +12 (10:12)`

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser
2. Click [here to install the script](https://raw.githubusercontent.com/0xMH/ns-delay-converter/main/ns-delay-converter.user.js)
3. Click "Install" in Tampermonkey

## Features

- Shows actual times in blue next to delays
- Works on journey planner results and trip details
- Hover over the delay to see scheduled vs actual time
- Handles both positive delays (+12) and early arrivals (-5)
- Automatically updates when navigating between trips

## Screenshot

| Before | After |
|--------|-------|
| `09:46 +32` | `09:46 +32 (10:18)` |

## License

MIT
