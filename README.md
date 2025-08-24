# 🔴 Manchester United Custom Card

A beautiful, animated Home Assistant custom card that displays Manchester United match information, team statistics, and live match updates.

![Manchester United Card Demo](https://via.placeholder.com/600x300/DA020E/FFFFFF?text=Manchester+United+Card)

## ✨ Features

- **Live Match Information** - Real-time scores, match time, and events
- **Dynamic States** - Different layouts for upcoming matches, live matches, and data unavailable
- **Team Crests** - Displays both team logos
- **Statistics Dropdown** - League position, points, goal difference, form, and match statistics  
- **Smooth Animations** - Sliding dropdowns with different animations based on match state
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Competition Scrolling** - Long competition names scroll automatically
- **Color-coded States** - Visual indicators for match status

## 🚀 Installation

### Via HACS (Recommended)

1. **Add Custom Repository**:
   - Go to HACS → Frontend
   - Click ⋯ (three dots) → Custom repositories
   - Repository: `https://github.com/YOUR-USERNAME/manchester-united-card`
   - Category: `Dashboard`
   - Click **ADD**

2. **Install the Card**:
   - Search for "Manchester United Card" in HACS Frontend
   - Click **INSTALL**
   - Restart Home Assistant

3. **Add to Dashboard**:
   ```yaml
   type: custom:manchester-united-card
   entity: sensor.manchester_united_main
   ```

### Manual Installation

1. Download `manchester-united-card.js`
2. Copy to `/config/www/` or `/config/www/community/`  
3. Add resource in Configuration → Lovelace Dashboards → Resources:
   ```
   /local/manchester-united-card.js
   ```
4. Restart Home Assistant

## 🔧 Configuration

### Required

| Name | Type | Description |
|------|------|-------------|
| `entity` | string | Manchester United sensor entity ID |

### Optional  

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | **Required** | Must be `custom:manchester-united-card` |

### Example Configurations

**Basic Configuration:**
```yaml
type: custom:manchester-united-card
entity: sensor.manchester_united_main
```

**In a Grid:**
```yaml
type: grid
columns: 2
cards:
  - type: custom:manchester-united-card
    entity: sensor.manchester_united_main
  - type: entity
    entity: sensor.next_match_countdown
```

## 📋 Requirements

### Entities Required
- `sensor.manchester_united_main` - Main Manchester United sensor
- `input_boolean.mufc_dropdown_toggle` - Controls dropdown visibility

### Entity Attributes Expected

The main sensor should provide these attributes:

**Match Information:**
- `home_team` - Home team name (for crest image)
- `away_team` - Away team name (for crest image)  
- `competition` - Competition/tournament name
- `location` - Match venue
- `next_match_date` - Date/time of next match

**Live Match Data:**
- `home_score` - Home team score
- `away_score` - Away team score
- `match_time` - Current match time (e.g., "45+2'")
- `home_events` - Home team events (goals, cards, etc.)
- `away_events` - Away team events

**League Statistics:**
- `league_rank` - Current league position
- `league_points` - Points in league
- `league_goal_difference` - Goal difference (+/-)
- `league_form` - Recent form (e.g., "WWLDW")
- `league_played` - Matches played
- `league_wins` - Wins
- `league_draws` - Draws  
- `league_losses` - Losses

**Status Information:**
- `calendar_status` - Calendar integration status
- `api_status` - API connection status

### Team Crest Images

Place team crest images in `/config/www/icon/` folder:
- Format: PNG files
- Naming: Use the exact team name from `home_team`/`away_team` attributes
- Example: `/config/www/icon/Manchester United.png`

## 🎨 Card States

### Default State
Shows upcoming match information with team crests, competition name, date/time, and venue.

### Match In Progress  
- **Background**: Red tint
- **Display**: Live score prominently displayed
- **Content**: Match time, team events in dropdown
- **Animation**: Bouncy dropdown animation

### Match Starting Soon
- **Background**: Yellow/amber tint  
- **Display**: "STARTING SOON" message in orange
- **Content**: Countdown and venue information
- **Animation**: Fast dropdown animation

### Data Unavailable
- **Background**: Dark red tint
- **Display**: "DATA UNAVAILABLE" error message
- **Content**: API and calendar status information
- **Behavior**: Hides team crests, shows diagnostic info

## 🎯 Interaction

- **Click anywhere on card** to toggle the statistics dropdown
- **Dropdown content** changes based on current match state
- **Hover effects** provide visual feedback  

## 🎨 Styling

The card automatically adapts to your Home Assistant theme:

- Uses `--ha-card-background` for card background
- Uses `--primary-text-color` for text
- Uses `--ha-card-box-shadow` for shadows
- Supports both light and dark themes

### Custom Styling

You can override styles using card-mod:

```yaml
type: custom:manchester-united-card
entity: sensor.manchester_united_main
card_mod:
  style: |
    manchester-united-card {
      --mufc-red: #DA020E;
      --mufc-yellow: #FFF200;
    }
```

## 🐛 Troubleshooting

### Card Not Loading
1. Check browser console for JavaScript errors
2. Verify the resource is added correctly
3. Clear browser cache and restart HA

### "Entity not found" Error  
1. Verify `sensor.manchester_united_main` exists
2. Check entity ID spelling in configuration
3. Ensure the sensor is providing data

### Images Not Loading
1. Check team crest images are in `/config/www/icon/`  
2. Verify image filenames match `home_team`/`away_team` attributes exactly
3. Ensure images are PNG format

### Dropdown Not Working
1. Verify `input_boolean.mufc_dropdown_toggle` exists
2. Check entity permissions
3. Look for JavaScript errors in browser console

## 🔄 Updates

The card will automatically update when:
- Entity state changes  
- Entity attributes change
- Dropdown toggle state changes

## 📱 Mobile Support

The card is fully responsive and includes:
- Smaller team crests on mobile devices
- Adjusted font sizes for readability
- Touch-friendly click targets
- Optimized animations for mobile performance

## 🤝 Support

This is a personal project created for Manchester United fans. Feel free to:
- Fork and modify for other teams
- Report issues via GitHub Issues  
- Submit pull requests for improvements
- Share your customizations with the community

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚽ GGMU!

Glory Glory Man United! 🔴

---

*This card is not officially affiliated with Manchester United Football Club.*
