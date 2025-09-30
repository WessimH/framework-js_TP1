
/**
 * SYSTÈME DE GESTION DE MATCHS ESPORT
 * 
 * Ce programme implémente un système de gestion et d'analyse de matchs esport
 * avec deux classes principales : Match et Plateforme.
 */

// ============================
// DONNÉES DE TEST
// ============================

const calendrierMatchs = [
  {
    id: 'LFL_KC_SLY',
    jeu: 'League of Legends',
    competition: 'LFL',
    equipeA: 'Karmine Corp',
    equipeB: 'Solary',
    probabiliteA: 0.65, // 65% de chance pour KC
    statut: 'À venir'
  },
  {
    id: 'VCT_VIT_M8',
    jeu: 'Valorant',
    competition: 'VCT EMEA',
    equipeA: 'Team Vitality',
    equipeB: 'Mandatory',
    probabiliteA: 0.55, // 55% de chance pour Vitality
    statut: 'À venir'
  },
  {
    id: 'LFL_GO_BDS',
    jeu: 'League of Legends',
    competition: 'LFL',
    equipeA: 'Gentle Mates',
    equipeB: 'BDS Academy',
    probabiliteA: 0.48, // 48% de chance pour GM, donc BDS est favori
    statut: 'À venir'
  },
  {
    id: 'LFL_KC_M8',
    jeu: 'Valorant',
    competition: 'VCT EMEA',
    equipeA: 'Karmine Corp',
    equipeB: 'Mandatory',
    probabiliteA: 0.52,
    statut: 'À venir'
  }
];

// ============================
// CLASSE MATCH
// ============================

/**
 * Représente un match esport avec toutes ses informations
 */
class Match {
  constructor(id, jeu, competition, equipeA, equipeB, probabiliteA, statut) {
    this.id = id;
    this.jeu = jeu;
    this.competition = competition;
    this.equipeA = equipeA;
    this.equipeB = equipeB;
    this.probabiliteA = probabiliteA;
    this.statut = statut;
  }

  /**
   * Retourne l'équipe favorite basée sur la probabilité
   * @returns {string} Le nom de l'équipe favorite
   */
  getFavori() {
    return this.probabiliteA > 0.5 ? this.equipeA : this.equipeB;
  }
}

// ============================
// CLASSE PLATEFORME
// ============================

/**
 * Gestionnaire de matchs esport avec fonctionnalités d'analyse
 */
class Plateforme {
  constructor(nom) {
    this.nom = nom;
    this.matchs = [];
  }

  /**
   * Charge les données de matchs dans la plateforme
   * @param {Array} matchsACharger - Tableau d'objets contenant les données des matchs
   */
  chargerMatchs(matchsACharger) {
    matchsACharger.forEach(matchData => {
      const match = new Match(
        matchData.id,
        matchData.jeu,
        matchData.competition,
        matchData.equipeA,
        matchData.equipeB,
        matchData.probabiliteA,
        matchData.statut
      );
      this.matchs.push(match);
    });
  }

  /**
   * Simule le résultat d'un match basé sur les probabilités
   * @param {string} idMatch - L'ID du match à simuler
   */
  simulerResultat(idMatch) {
    const match = this.getMatchById(idMatch);
    if (!match) {
      console.log(`Match avec ID ${idMatch} non trouvé.`);
      return;
    }
    
    const random = Math.random();
    const gagnant = random < match.probabiliteA ? match.equipeA : match.equipeB;
    match.statut = `Terminé - Vainqueur: ${gagnant}`;
    console.log(`Le match ${match.id} est terminé. Vainqueur: ${gagnant}`);
  }

  /**
   * Calcule les statistiques d'une équipe
   * @param {string} equipe - Le nom de l'équipe
   * @returns {Object} Objet contenant les statistiques de l'équipe
   */
  getStatsEquipe(equipe) {
    const matchsEquipe = this.matchs.filter(match => 
      match.equipeA === equipe || match.equipeB === equipe
    );
    
    const victoires = matchsEquipe.filter(match => {
      const gagnant = match.getFavori();
      return gagnant === equipe && match.statut.startsWith('Terminé');
    }).length;
    
    const defaites = matchsEquipe.filter(match => {
      const gagnant = match.getFavori();
      return gagnant !== equipe && match.statut.startsWith('Terminé');
    }).length;
    
    return {
      equipe: equipe,
      matchsJoues: matchsEquipe.length,
      victoires: victoires,
      defaites: defaites
    };
  }

  /**
   * Affiche le calendrier complet des matchs
   */
  afficherCalendrier() {
    console.log(`\n=== Calendrier ${this.nom} ===`);
    this.matchs.forEach(match => {
      console.log(`[${match.competition}] ${match.equipeA} vs. ${match.equipeB} - Jeu: ${match.jeu}`);
    });
  }

  /**
   * Filtre les matchs par jeu
   * @param {string} jeu - Le nom du jeu à filtrer
   * @returns {Array} Tableau des matchs du jeu spécifié
   */
  getMatchsParJeu(jeu) {
    return this.matchs.filter(match => match.jeu === jeu);
  }

  /**
   * Trouve les matchs à risque (probabilités serrées)
   * @returns {Array} Tableau des matchs avec des probabilités entre 45% et 55%
   */
  getMatchsRisques() {
    return this.matchs.filter(match => 
      match.probabiliteA >= 0.45 && match.probabiliteA <= 0.55
    );
  }

  /**
   * Trouve un match par son ID
   * @param {string} id - L'ID du match à rechercher
   * @returns {Match|undefined} L'instance du match ou undefined si non trouvé
   */
  getMatchById(id) {
    return this.matchs.find(match => match.id === id);
  }
}

// ============================
// UTILISATION DU SYSTÈME
// ============================

// Création et initialisation de la plateforme
const esportVision = new Plateforme('Esport Vision');
esportVision.chargerMatchs(calendrierMatchs);

// Tests et démonstrations
console.log('\n=== DÉMONSTRATION DU SYSTÈME ===');

// Affichage du calendrier complet
esportVision.afficherCalendrier();

// Filtrage par jeu
console.log('\n--- Matchs de League of Legends ---');
console.log(esportVision.getMatchsParJeu('League of Legends'));

// Matchs à risque (probabilités serrées)
console.log('\n--- Matchs à Risque ---');
console.log(esportVision.getMatchsRisques());

// Recherche par ID
console.log('\n--- Match par ID (LFL_KC_SLY) ---');
console.log(esportVision.getMatchById('LFL_KC_SLY'));

// Simulation d'un match
console.log('\n--- Simulation d\'un match ---');
esportVision.simulerResultat('LFL_KC_SLY');

// Statistiques d'une équipe
console.log('\n--- Statistiques de Karmine Corp ---');
console.log(esportVision.getStatsEquipe('Karmine Corp'));

/*note au professeur : ce n'es pas de l'ia voici plusieurs projet a moi 
https://gitlab.com/wessim.harmel1/medis
https://gitlab.com/wessim.harmel1/beeldi-etude-de-cas
https://gitlab.com/wessim.harmel1/kelvin-choix
https://gitlab.com/getbunker-france-nuage/france-nuage/plateforme (contribué en stage)
*/


