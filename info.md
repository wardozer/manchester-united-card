# 🔴 Manchester United Card

A custom Home Assistant card to display Manchester United match information with beautiful styling and animations.

## Features
- Live match information
- Team crests and colors
- League statistics dropdown
- Animated transitions
- Responsive design

## Installation via HACS

1. Add this repository as a custom repository in HACS:
   - Go to HACS → Frontend → ⋯ → Custom repositories  
   - Repository: `https://github.com/YOUR-USERNAME/manchester-united-card`
   - Category: Dashboard
   - Click ADD

2. Install the card:
   - Find "Manchester United Card" in HACS Frontend
   - Click Install

3. Add to your dashboard:
```yaml
type: custom:manchester-united-card
entity: sensor.manchester_united_main
```

## Configuration Options

| Name | Type | Default | Description |
|------|------|---------|-------------|
| entity | string | **Required** | Manchester United sensor entity |
| show_dropdown | boolean | true | Show league statistics dropdown |

## Example Configuration

```yaml
type: custom:manchester-united-card
entity: sensor.manchester_united_main
show_dropdown: true
```

## Requirements
- sensor.manchester_united_main entity
- input_boolean.mufc_dropdown_toggle entity
- Team crest images in /local/icon/ folder

## Support
This is a personal project. Feel free to fork and modify!
