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
    
    // Update dropdown display
    const dropdown = this.shadowRoot.querySelector('.dropdown-content');
    if (dropdown) {
      dropdown.style.display = isDropdownOpen ? 'block' : 'none';
    }

    // Update card state based on match status
    card.className = `mufc-card ${this.getStateClass(entity.state)}`;
    
    // Update dynamic content
    this.updateContent(entity);
  }

  getStateClass(state) {
    switch (state) {
      case 'Match in progress':
        return 'match-in-progress';
      case 'Match starting soon':
        return 'match-starting-soon';
      case 'Data unavailable':
        return 'data-unavailable';
      default:
        return 'default-state';
    }
  }

  updateContent(entity) {
    const attrs = entity.attributes;
    
    // Update team crests
    const homeCrest = this.shadowRoot.querySelector('.home-crest');
    const awayCrest = this.shadowRoot.querySelector('.away-crest');
    
    if (homeCrest && attrs.home_team) {
      homeCrest.src = `/local/icon/${attrs.home_team}.png`;
    }
    if (awayCrest && attrs.away_team) {
      awayCrest.src = `/local/icon/${attrs.away_team}.png`;
    }

    // Update main content based on state
    if (entity.state === 'Match in progress') {
      this.updateMatchInProgress(attrs);
    } else if (entity.state === 'Match starting soon') {
      this.updateMatchStartingSoon(attrs);
    } else if (entity.state === 'Data unavailable') {
      this.updateDataUnavailable(attrs);
    } else {
      this.updateDefaultState(attrs);
    }

    // Update dropdown stats
    this.updateDropdownStats(attrs);
  }

  updateMatchInProgress(attrs) {
    this.updateElement('.score', `${attrs.home_score || 0} - ${attrs.away_score || 0}`);
    this.updateElement('.match-time', attrs.match_time || '');
    
    // Update match events
    this.updateElement('.home-events', attrs.home_events || '');
    this.updateElement('.away-events', attrs.away_events || '');
  }

  updateMatchStartingSoon(attrs) {
    this.updateElement('.competition', '<span style="color: orange; font-weight: bold;">STARTING SOON</span>');
    this.updateElement('.countdown', attrs.next_match_date || '');
    this.updateElement('.location', attrs.location || '');
  }

  updateDataUnavailable(attrs) {
    this.updateElement('.error-message', 'DATA UNAVAILABLE');
    this.updateElement('.calendar-status', `Calendar Status: ${attrs.calendar_status || 'unknown'}`);
    this.updateElement('.api-status', `API Status: ${attrs.api_status || 'unknown'}`);
  }

  updateDefaultState(attrs) {
    const competition = attrs.competition || '';
    let competitionHtml = `
      <div class="competition-container">
        <span class="competition-text">${competition}</span>
      </div>
    `;
    
    // Add scrolling animation for long text
    if (competition.length > 20) {
      competitionHtml += `
        <style>
          .competition-text {
            animation: scroll-text 8s linear infinite;
          }
        </style>
      `;
    }
    
    this.updateElement('.competition', competitionHtml, true);
    this.updateElement('.countdown', attrs.next_match_date || '');
    this.updateElement('.location', attrs.location || '');
  }

  updateDropdownStats(attrs) {
    this.updateElement('.league-rank', attrs.league_rank || '');
    this.updateElement('.league-points', attrs.league_points || '');
    this.updateElement('.league-goal-difference', attrs.league_goal_difference || '');
    this.updateElement('.league-form', attrs.league_form || '');
    this.updateElement('.league-played', attrs.league_played || '');
    this.updateElement('.league-wins', attrs.league_wins || '');
    this.updateElement('.league-draws', attrs.league_draws || '');
    this.updateElement('.league-losses', attrs.league_losses || '');
  }

  updateElement(selector, content, isHtml = false) {
    const element = this.shadowRoot.querySelector(selector);
    if (element) {
      if (isHtml) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }
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
      <div class="error">
        <ha-card>
          <div class="card-content">
            <div class="error-message">⚠️ ${error}</div>
          </div>
        </ha-card>
      </div>
      <style>
        .error { padding: 20px; }
        .error-message { color: red; font-weight: bold; text-align: center; }
      </style>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="mufc-card default-state" @click="${() => this.toggleDropdown()}">
        <div class="card-grid">
          <!-- Home Crest -->
          <div class="home-crest-container">
            <img class="home-crest" src="" alt="Home Team">
          </div>
          
          <!-- Main Content Area -->
          <div class="main-content">
            <div class="competition"></div>
            <div class="score" style="display: none;"></div>
            <div class="match-time" style="display: none;"></div>
            <div class="countdown"></div>
            <div class="location"></div>
            <div class="error-message" style="display: none;"></div>
          </div>
          
          <!-- Away Crest -->
          <div class="away-crest-container">
            <img class="away-crest" src="" alt="Away Team">
          </div>
        </div>
        
        <!-- Dropdown Content -->
        <div class="dropdown-content" style="display: none;">
          <div class="stats-grid">
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value league-rank"></div>
                <div class="stat-label">Rank</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-points"></div>
                <div class="stat-label">Points</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-goal-difference"></div>
                <div class="stat-label">GD</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-form"></div>
                <div class="stat-label">Form</div>
              </div>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-value league-played"></div>
                <div class="stat-label">Played</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-wins"></div>
                <div class="stat-label">Win</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-draws"></div>
                <div class="stat-label">Draw</div>
              </div>
              <div class="stat-item">
                <div class="stat-value league-losses"></div>
                <div class="stat-label">Lose</div>
              </div>
            </div>
          </div>
          
          <!-- Match Events (for live matches) -->
          <div class="match-events" style="display: none;">
            <div class="events-row">
              <div class="home-events"></div>
              <div class="away-events"></div>
            </div>
          </div>
          
          <!-- Error Status (for data unavailable) -->
          <div class="error-status" style="display: none;">
            <div class="calendar-status"></div>
            <div class="api-status"></div>
          </div>
        </div>
      </div>
      
      <style>
        /* Main Card Styles */
        .mufc-card {
          border-radius: 30px;
          box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.1));
          padding: 12px;
          transition: all 0.3s ease-out;
          cursor: pointer;
          transform: scale(1);
          background: var(--ha-card-background, white);
          color: var(--primary-text-color);
        }
        
        .mufc-card:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .mufc-card:active {
          transform: scale(0.98);
          transition: all 0.1s ease-out;
        }
        
        /* State-specific backgrounds */
        .match-in-progress {
          background-color: rgba(220, 53, 69, 0.09);
        }
        
        .match-starting-soon {
          background-color: rgba(255, 193, 7, 0.09);
        }
        
        .data-unavailable {
          background-color: rgba(220, 53, 69, 0.15);
        }
        
        /* Grid Layout */
        .card-grid {
          display: grid;
          grid-template-columns: 0.8fr 1.4fr 0.8fr;
          grid-template-rows: 1fr 1fr 1fr;
          gap: 8px;
          align-items: center;
        }
        
        .match-in-progress .card-grid {
          grid-template-areas: 
            "home-crest score away-crest"
            "home-crest score away-crest"
            "home-crest time away-crest";
        }
        
        .match-starting-soon .card-grid,
        .default-state .card-grid {
          grid-template-areas: 
            "home-crest competition away-crest"
            "home-crest location away-crest"
            "home-crest countdown away-crest";
        }
        
        .data-unavailable .card-grid {
          grid-template-areas: 
            "error error error"
            "error error error"
            "error error error";
        }
        
        /* Crest Styles */
        .home-crest-container,
        .away-crest-container {
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        
        .home-crest,
        .away-crest {
          height: 100px;
          width: auto;
          object-fit: contain;
        }
        
        /* Main Content */
        .main-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }
        
        .competition {
          font-size: 0.6em;
          text-align: center;
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
        }
        
        .competition-container {
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
          position: relative;
        }
        
        .competition-text {
          display: inline-block;
        }
        
        .score {
          font-size: 3.5em;
          font-weight: 900;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          text-align: center;
        }
        
        .match-time {
          font-size: 0.8em;
          color: green;
          font-weight: bold;
          text-align: center;
        }
        
        .countdown {
          font-size: 0.6em;
          text-align: center;
        }
        
        .match-starting-soon .countdown {
          color: orange;
          font-weight: bold;
        }
        
        .location {
          font-size: 0.6em;
          text-align: center;
        }
        
        .error-message {
          font-size: 1.2em;
          color: red;
          font-weight: bold;
          text-align: center;
        }
        
        /* Dropdown Styles */
        .dropdown-content {
          border-top: 1px solid rgba(255, 255, 255, 0.2);
          margin: 8px 0;
          padding-top: 12px;
          animation: slideDown 0.3s ease-out;
        }
        
        .match-in-progress .dropdown-content {
          animation: slideDownBounce 0.4s ease-out;
        }
        
        .match-starting-soon .dropdown-content {
          animation: slideDownFast 0.2s ease-out;
        }
        
        .stats-grid {
          display: grid;
          grid-template-rows: min-content min-content;
          row-gap: 12px;
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
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
        
        /* Match Events */
        .match-events {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          margin: 8px 0;
          padding-top: 16px;
        }
        
        .events-row {
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
        
        /* Error Status */
        .error-status {
          text-align: center;
          color: rgba(255,255,255,0.6);
        }
        
        /* Animations */
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
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .home-crest,
          .away-crest {
            height: 80px;
          }
          
          .score {
            font-size: 2.5em;
          }
        }
        
        /* Show/hide elements based on state */
        .match-in-progress .main-content .score,
        .match-in-progress .main-content .match-time {
          display: block !important;
        }
        
        .match-in-progress .main-content .competition,
        .match-in-progress .main-content .countdown,
        .match-in-progress .main-content .location {
          display: none !important;
        }
        
        .match-in-progress .dropdown-content .match-events {
          display: block !important;
        }
        
        .data-unavailable .main-content .error-message {
          display: block !important;
        }
        
        .data-unavailable .main-content .competition,
        .data-unavailable .main-content .countdown,
        .data-unavailable .main-content .location {
          display: none !important;
        }
        
        .data-unavailable .home-crest-container,
        .data-unavailable .away-crest-container {
          display: none !important;
        }
        
        .data-unavailable .dropdown-content .error-status {
          display: block !important;
        }
        
        .data-unavailable .dropdown-content .stats-grid {
          display: none !important;
        }
      </style>
    `;

    // Add click event listener
    this.shadowRoot.querySelector('.mufc-card').addEventListener('click', () => {
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
  documentationURL: 'https://github.com/YOUR-USERNAME/manchester-united-card',
});

// Console info
console.info(
  '%c MANCHESTER-UNITED-CARD %c Version 1.0.0 ',
  'color: white; background: #DA020E; font-weight: bold;',
  'color: #DA020E; background: white; font-weight: bold;'
);
