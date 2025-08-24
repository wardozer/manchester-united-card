// Manchester United Card - Custom Button Card Configuration
// This file contains your entire card configuration

class ManchesterUnitedCard extends HTMLElement {
  setConfig(config) {
    this.config = config;
    this.render();
  }

  render() {
    // Your card HTML will go here
    this.innerHTML = `
      <div class="card-content">
        <h2>🔴 Manchester United Card</h2>
        <p>Your custom card configuration goes here!</p>
        <p>Entity: ${this.config.entity || 'sensor.manchester_united_main'}</p>
      </div>
      <style>
        .card-content {
          padding: 16px;
          background: var(--ha-card-background, white);
          border-radius: 8px;
          box-shadow: var(--ha-card-box-shadow);
        }
      </style>
    `;
  }

  set hass(hass) {
    // This is where you'll put your dynamic updates
    if (!this.config) return;
    
    const entity = hass.states[this.config.entity];
    if (entity) {
      // Update your card with entity data
      console.log('Entity state:', entity.state);
    }
  }

  getCardSize() {
    return 3;
  }
}

// Register the card
customElements.define('manchester-united-card', ManchesterUnitedCard);

// Tell Home Assistant about your card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'manchester-united-card',
  name: 'Manchester United Card',
  description: 'A custom card for Manchester United match information',
  preview: true,
});

console.info(
  '%c MANCHESTER-UNITED-CARD %c Version 1.0.0 ',
  'color: white; background: crimson; font-weight: bold;',
  'color: crimson; background: white; font-weight: bold;'
);
