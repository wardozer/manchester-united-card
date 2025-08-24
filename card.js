class ManchesterUnitedCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config) {
      throw new Error('Invalid configuration');
    }
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
    this.render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.shadowRoot.lastChild) return;
    
    const entity = hass.states[this.config.entity];
    const dropdownEntity = hass.states['input_boolean.mufc_dropdown_toggle'];
    
    if (!entity) {
      this.showError(`Entity not found: ${this.config.entity}`);
      return;
    }

    this.updateCard(entity, dropdownEntity);
  }

  updateCard(entity, dropdownEntity) {
    const card = this.shadowRoot.querySelector('.mufc-card');
    const isDropdownOpen = dropdownEntity?.state === 'on';
    
    // Update card classes based on state
    this.updateCardState(card, entity.state);
    
    // Update dropdown visibility
    const dropdown = this.shadowRoot.querySelector('.dropdown-content');
    if (dropdown) {
      dropdown.style.display = isDropdownOpen ? 'block' : 'none';
      // Add animation class
      if (isDropdownOpen) {
        dropdown.className = `dropdown-content visible ${this.getAnimationClass(entity.state)}`;
      } else {
        dropdown.className = 'dropdown-content';
      }
    }
    
    // Update all content
    this.updateContent(entity);
  }

  updateCardState(card, state) {
    // Remove all state classes
    card.classList.remove('match-in-progress', 'match-starting-soon', 'data-unavailable');
    
    // Add appropriate state class
    switch (state) {
      case 'Match in progress':
        card.classList.add('match-in-progress');
        break;
      case 'Match starting soon':
        card.classList.add('match-starting-soon');
        break;
      case 'Data unavailable':
        card.classList.add('data-unavailable');
        break;
    }
  }

  getAnimationClass(state) {
    switch (state) {
      case 'Match in progress':
        return 'bounce-animation';
      case 'Match starting soon':
        return 'fast-animation';
      default:
        return 'normal-animation';
    }
  }

  updateContent(entity) {
    const attrs = entity.attributes;
    
    // Update team crests
    this.updateElement('.home-crest', 'src', `/local/icon/${attrs.home_team || 'default'}.png`);
    this.updateElement('.away-crest', 'src', `/local/icon/${attrs.away_team || 'default'}.png`);

    // Update content based on match state
    if (entity.state === 'Match in progress') {
      this.showMatchInProgress(attrs);
    } else if (entity.state === 'Match starting soon') {
      this.showMatchStartingSoon(attrs);
    } else if (entity.state === 'Data unavailable') {
      this.showDataUnavailable(attrs);
    } else {
      this.showDefaultState(attrs);
    }

    // Always update dropdown stats
    this.updateDropdownStats(attrs);
  }

  showDefaultState(attrs) {
    // Show default elements
    this.showElement('.competition-area');
    this.showElement('.location-area');
    this.showElement('.countdown-area');
    this.hideElement('.score-area');
    this.hideElement('.time-area');
    this.hideElement('.error-area');
    this.showElement('.home-crest');
    this.showElement('.away-crest');

    // Update content
    const competition = attrs.competition || '';
    this.updateElement('.competition-text', 'textContent', competition);
    this.updateElement('.location-text', 'textContent', attrs.location || '');
    this.updateElement('.countdown-text', 'textContent', attrs.next_match_date || '');

    // Handle long competition names with scrolling
    const competitionEl = this.shadowRoot.querySelector('.competition-text');
    if (competitionEl && competition.length > 25) {
      competitionEl.classList.add('scrolling-text');
    } else if (competitionEl) {
      competitionEl.classList.remove('scrolling-text');
    }
  }

  showMatchInProgress(attrs) {
    // Hide default, show match elements
    this.hideElement('.competition-area');
    this.hideElement('.location-area');
    this.hideElement('.countdown-area');
    this.hideElement('.error-area');
    this.showElement('.score-area');
    this.showElement('.time-area');
    this.showElement('.home-crest');
    this.showElement('.away-crest');

    // Update match content
    this.updateElement('.score-text', 'textContent', `${attrs.home_score || 0} - ${attrs.away_score || 0}`);
    this.updateElement('.time-text', 'textContent', attrs.match_time || '');
  }

  showMatchStartingSoon(attrs) {
    // Show default layout with special styling
    this.showDefaultState(attrs);
    this.updateElement('.competition-text', 'innerHTML', '<span style="color: orange; font-weight: bold;">STARTING SOON</span>');
  }

  showDataUnavailable(attrs) {
    // Hide crests, show error
    this.hideElement('.competition-area');
    this.hideElement('.location-area');
    this.hideElement('.countdown-area');
    this.hideElement('.score-area');
    this.hideElement('.time-area');
    this.hideElement('.home-crest');
    this.hideElement('.away-crest');
    this.showElement('.error-area');

    this.updateElement('.error-text', 'textContent', 'DATA UNAVAILABLE');
  }

  updateDropdownStats(attrs) {
    // League stats
    this.updateElement('.stat-rank', 'textContent', attrs.league_rank || '');
    this.updateElement('.stat-points', 'textContent', attrs.league_points || '');
    this.updateElement('.stat-gd', 'textContent', attrs.league_goal_difference || '');
    this.updateElement('.stat-form', 'textContent', attrs.league_form || '');
    this.updateElement('.stat-played', 'textContent', attrs.league_played || '');
    this.updateElement('.stat-wins', 'textContent', attrs.league_wins || '');
    this.updateElement('.stat-draws', 'textContent', attrs.league_draws || '');
    this.updateElement('.stat-losses', 'textContent', attrs.league_losses || '');

    // Match events (for live matches)
    this.updateElement('.home-events', 'innerHTML', attrs.home_events || '');
    this.updateElement('.away-events', 'innerHTML', attrs.away_events || '');

    // Error status (for data unavailable)
    this.updateElement('.calendar-status', 'textContent', `Calendar Status: ${attrs.calendar_status || 'unknown'}`);
    this.updateElement('.api-status', 'textContent', `API Status: ${attrs.api_status || 'unknown'}`);
  }

  updateElement(selector, property, value) {
    const element = this.shadowRoot.querySelector(selector);
    if (element && value !== undefined) {
      if (property === 'src') {
        element.src = value;
      } else if (property === 'textContent') {
        element.textContent = value;
      } else if (property === 'innerHTML') {
        element.innerHTML = value;
      }
    }
  }

  showElement(selector) {
    const element = this.shadowRoot.querySelector(selector);
    if (element) element.style.display = '';
  }

  hideElement(selector) {
    const element = this.shadowRoot.querySelector(selector);
    if (element) element.style.display = 'none';
  }

  toggleDropdown() {
    if (this._hass) {
      this._hass.callService('input_boolean', 'toggle', {
        entity_id: 'input_boolean.mufc_dropdown_toggle'
      });
    }
  }

  showError(error) {
    this.shadowRoot.innerHTML = `
      <ha-card>
        <div class="error-container">
          <div class="error-message">⚠️ ${error}</div>
        </div>
      </ha-card>
      <style>
        .error-container { padding: 20px; text-align: center; }
        .error-message { color: red; font-weight: bold; font-size: 16px; }
      </style>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="mufc-card" @click="${() => this.toggleDropdown()}">
        <!-- Main Grid Layout -->
        <div class="main-grid">
          <!-- Home Team Crest -->
          <div class="home-crest-container">
            <img class="home-crest" src="" alt="Home Team">
          </div>
          
          <!-- Center Content Area -->
          <div class="center-content">
            <!-- Competition/Score Area -->
            <div class="competition-area">
              <div class="competition-text scrollable-container"></div>
            </div>
            <div class="score-area" style="display: none;">
              <div class="score-text"></div>
            </div>
            
            <!-- Location/Time Area -->
            <div class="location-area">
              <div class="location-text"></div>
            </div>
            <div class="time-area" style="display: none;">
              <div class="time-text"></div>
            </div>
            
            <!-- Countdown Area -->
            <div class="countdown-area">
              <div class="countdown-text"></div>
            </div>
            
            <!-- Error Area -->
            <div class="error-area" style="display: none;">
              <div class="error-text"></div>
            </div>
          </div>
          
          <!-- Away Team Crest -->
          <div class="away-crest-container">
            <img class="away-crest" src="" alt="Away Team">
          </div>
        </div>
        
        <!-- Dropdown Section -->
        <div class="dropdown-content">
          <!-- League Stats Grid -->
          <div class="stats-section">
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value stat-rank"></div>
                <div class="stat-label">Rank</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-points"></div>
                <div class="stat-label">Points</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-gd"></div>
                <div class="stat-label">GD</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-form"></div>
                <div class="stat-label">Form</div>
              </div>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value stat-played"></div>
                <div class="stat-label">Played</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-wins"></div>
                <div class="stat-label">Win</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-draws"></div>
                <div class="stat-label">Draw</div>
              </div>
              <div class="stat-item">
                <div class="stat-value stat-losses"></div>
                <div class="stat-label">Lose</div>
              </div>
            </div>
          </div>
          
          <!-- Match Events Section -->
          <div class="events-section">
            <div class="events-grid">
              <div class="home-events"></div>
              <div class="away-events"></div>
            </div>
          </div>
          
          <!-- Error Status Section -->
          <div class="error-status-section">
            <div class="calendar-status"></div>
            <div class="api-status"></div>
          </div>
        </div>
      </div>
      
      <style>
        :host {
          display: block;
        }
        
        /* Automatic theme detection */
        .mufc-card {
          background: var(--ha-card-background, var(--card-background-color, var(--primary-background-color, #1c1c1c)));
          border-radius: 30px;
          padding: 12px;
          box-shadow: var(--ha-card-box-shadow, var(--box-shadow, 0 2px 8px rgba(0,0,0,0.3)));
          transition: all 0.3s ease-out;
          cursor: pointer;
          color: var(--primary-text-color, #ffffff);
          position: relative;
          overflow: hidden;
          border: 1px solid var(--divider-color, rgba(255,255,255,0.1));
        }
        
        .mufc-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .mufc-card:active {
          transform: scale(0.98);
          transition: all 0.1s ease-out;
        }
        
        /* State-specific styling */
        .mufc-card.match-in-progress {
          background: rgba(220, 53, 69, 0.09);
        }
        
        .mufc-card.match-starting-soon {
          background: rgba(255, 193, 7, 0.09);
        }
        
        .mufc-card.data-unavailable {
          background: rgba(220, 53, 69, 0.15);
        }
        
        /* Main Grid Layout - Exactly like your original */
        .main-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.4fr 0.8fr;
          grid-template-rows: 1fr 1fr 1fr;
          align-items: center;
          gap: 8px;
          min-height: 120px;
        }
        
        /* Team Crests - Proper sizing like original */
        .home-crest-container,
        .away-crest-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
          grid-row: 1 / -1;
        }
        
        .home-crest,
        .away-crest {
          height: 100px;
          width: auto;
          object-fit: contain;
          position: relative;
        }
        
        /* Center Content Area */
        .center-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          gap: 4px;
          grid-row: 1 / -1;
        }
        
        /* Competition Area */
        .competition-area {
          font-size: 0.6em;
          font-weight: normal;
        }
        
        .competition-text {
          white-space: nowrap;
          overflow: hidden;
          max-width: 150px;
        }
        
        .competition-text.scrolling-text {
          animation: scroll-text 8s linear infinite;
        }
        
        /* Score Area - Large like original */
        .score-area {
          font-size: 3.5em;
          font-weight: 900;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          line-height: 1;
        }
        
        /* Time Area */
        .time-area {
          font-size: 0.8em;
          color: green;
          font-weight: bold;
        }
        
        /* Location Area */
        .location-area {
          font-size: 0.6em;
          font-weight: normal;
        }
        
        /* Countdown Area */
        .countdown-area {
          font-size: 0.6em;
          font-weight: normal;
        }
        
        .mufc-card.match-starting-soon .countdown-text {
          color: orange;
          font-weight: bold;
        }
        
        /* Error Area */
        .error-area {
          font-size: 1.2em;
          color: red;
          font-weight: bold;
        }
        
        /* Dropdown Section */
        .dropdown-content {
          display: none;
          border-top: 1px solid var(--divider-color, rgba(255, 255, 255, 0.2));
          margin: 8px 0 0 0;
          padding-top: 12px;
          opacity: 0;
          transform: translateY(-10px);
        }
        
        .dropdown-content.visible {
          display: block;
          opacity: 1;
          transform: translateY(0);
        }
        
        .dropdown-content.visible.normal-animation {
          animation: slideDown 0.3s ease-out forwards;
        }
        
        .dropdown-content.visible.bounce-animation {
          animation: slideDownBounce 0.4s ease-out forwards;
        }
        
        .dropdown-content.visible.fast-animation {
          animation: slideDownFast 0.2s ease-out forwards;
        }
        
        /* Stats Section */
        .stats-section {
          display: grid;
          grid-template-rows: repeat(2, min-content);
          row-gap: 12px;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          column-gap: 7px;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-value {
          font-weight: bold;
          font-size: 14px;
          margin-top: 10px;
        }
        
        .stat-label {
          font-size: 12px;
          opacity: 0.4;
          font-weight: bold;
          margin-top: 5px;
        }
        
        /* Events Section */
        .events-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin-top: 8px;
          padding-top: 16px;
        }
        
        .events-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        
        .home-events,
        .away-events {
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          line-height: 1.6;
          text-align: left;
        }
        
        /* Error Status Section */
        .error-status-section {
          text-align: center;
          color: rgba(255,255,255,0.6);
          font-size: 12px;
          margin-top: 8px;
        }
        
        /* Animations - Same as your original */
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDownBounce {
          0% { 
            opacity: 0; 
            transform: translateY(-15px) scale(0.9); 
          }
          60% { 
            opacity: 1; 
            transform: translateY(5px) scale(1.02); 
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slideDownFast {
          from { 
            opacity: 0; 
            transform: translateY(-5px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes scroll-text {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .home-crest,
          .away-crest {
            height: 80px;
          }
          
          .score-area {
            font-size: 2.8em;
          }
        }
      </style>
    `;

    // Add click event listener
    this.shadowRoot.querySelector('.mufc-card').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDropdown();
    });
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      entity: 'sensor.manchester_united_main',
    };
  }
}

// Register the custom card
customElements.define('manchester-united-card', ManchesterUnitedCard);

// Tell Home Assistant about the card
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'manchester-united-card',
  name: 'Manchester United Card',
  description: 'A custom card for Manchester United match information with live updates and statistics',
  preview: true,
  documentationURL: 'https://github.com/wardozer/manchester-united-card',
});

// Console info
console.info(
  '%c MANCHESTER-UNITED-CARD %c Version 1.0.1 ',
  'color: white; background: #DA020E; font-weight: bold;',
  'color: #DA020E; background: white; font-weight: bold;'
);