/**
 * TESTS POUR LE SYSTÈME DE GESTION DE MATCHS ESPORT
 * 
 * Ce fichier contient tous les tests pour valider le bon fonctionnement
 * des classes Match et Plateforme.
 */

// Import des classes depuis index.js (simulation)
// En environnement réel, vous pourriez utiliser des modules ES6 ou CommonJS

// ============================
// DONNÉES DE TEST
// ============================

const donneesTestMatch = {
  id: 'TEST_KC_VIT',
  jeu: 'League of Legends',
  competition: 'LFL',
  equipeA: 'Karmine Corp',
  equipeB: 'Team Vitality',
  probabiliteA: 0.7,
  statut: 'À venir'
};

const donneesTestMatchs = [
  {
    id: 'TEST_1',
    jeu: 'League of Legends',
    competition: 'LFL',
    equipeA: 'Karmine Corp',
    equipeB: 'Solary',
    probabiliteA: 0.65,
    statut: 'À venir'
  },
  {
    id: 'TEST_2',
    jeu: 'Valorant',
    competition: 'VCT',
    equipeA: 'Team Vitality',
    equipeB: 'G2 Esports',
    probabiliteA: 0.45,
    statut: 'À venir'
  },
  {
    id: 'TEST_3',
    jeu: 'League of Legends',
    competition: 'LFL',
    equipeA: 'BDS Academy',
    equipeB: 'Gentle Mates',
    probabiliteA: 0.52,
    statut: 'Terminé - Vainqueur: BDS Academy'
  }
];

// ============================
// CLASSE MATCH (copie pour les tests)
// ============================

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

  getFavori() {
    return this.probabiliteA > 0.5 ? this.equipeA : this.equipeB;
  }
}

// ============================
// CLASSE PLATEFORME (copie pour les tests)
// ============================

class Plateforme {
  constructor(nom) {
    this.nom = nom;
    this.matchs = [];
  }

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

  afficherCalendrier() {
    console.log(`\n=== Calendrier ${this.nom} ===`);
    this.matchs.forEach(match => {
      console.log(`[${match.competition}] ${match.equipeA} vs. ${match.equipeB} - Jeu: ${match.jeu}`);
    });
  }

  getMatchsParJeu(jeu) {
    return this.matchs.filter(match => match.jeu === jeu);
  }

  getMatchsRisques() {
    return this.matchs.filter(match => 
      match.probabiliteA >= 0.45 && match.probabiliteA <= 0.55
    );
  }

  getMatchById(id) {
    return this.matchs.find(match => match.id === id);
  }
}

// ============================
// FONCTIONS DE TEST
// ============================

/**
 * Fonction utilitaire pour afficher les résultats de test
 */
function afficherResultatTest(nomTest, condition, messageErreur = '') {
  if (condition) {
    console.log(`✅ ${nomTest} : RÉUSSI`);
  } else {
    console.log(`❌ ${nomTest} : ÉCHEC ${messageErreur}`);
  }
}

/**
 * Tests pour la classe Match
 */
function testerClasseMatch() {
  console.log('\n🧪 === TESTS DE LA CLASSE MATCH ===');
  
  // Test 1: Création d'un match
  const match = new Match(
    donneesTestMatch.id,
    donneesTestMatch.jeu,
    donneesTestMatch.competition,
    donneesTestMatch.equipeA,
    donneesTestMatch.equipeB,
    donneesTestMatch.probabiliteA,
    donneesTestMatch.statut
  );
  
  afficherResultatTest(
    'Création d\'un match',
    match.id === 'TEST_KC_VIT' && match.equipeA === 'Karmine Corp'
  );
  
  // Test 2: getFavori() avec probabilité > 0.5
  afficherResultatTest(
    'getFavori() - Équipe A favorite',
    match.getFavori() === 'Karmine Corp',
    `Expected: Karmine Corp, Got: ${match.getFavori()}`
  );
  
  // Test 3: getFavori() avec probabilité < 0.5
  const matchEquipeB = new Match('TEST', 'LoL', 'LFL', 'TeamA', 'TeamB', 0.3, 'À venir');
  afficherResultatTest(
    'getFavori() - Équipe B favorite',
    matchEquipeB.getFavori() === 'TeamB',
    `Expected: TeamB, Got: ${matchEquipeB.getFavori()}`
  );
  
  // Test 4: getFavori() avec probabilité = 0.5 (limite)
  const matchEgalite = new Match('TEST', 'LoL', 'LFL', 'TeamA', 'TeamB', 0.5, 'À venir');
  afficherResultatTest(
    'getFavori() - Probabilité égale (0.5)',
    matchEgalite.getFavori() === 'TeamB',
    `Expected: TeamB, Got: ${matchEgalite.getFavori()}`
  );
}

/**
 * Tests pour la classe Plateforme
 */
function testerClassePlateforme() {
  console.log('\n🧪 === TESTS DE LA CLASSE PLATEFORME ===');
  
  // Test 1: Création d'une plateforme
  const plateforme = new Plateforme('Test Platform');
  afficherResultatTest(
    'Création d\'une plateforme',
    plateforme.nom === 'Test Platform' && Array.isArray(plateforme.matchs)
  );
  
  // Test 2: Chargement des matchs
  plateforme.chargerMatchs(donneesTestMatchs);
  afficherResultatTest(
    'Chargement des matchs',
    plateforme.matchs.length === 3,
    `Expected: 3, Got: ${plateforme.matchs.length}`
  );
  
  // Test 3: getMatchById()
  const matchTrouve = plateforme.getMatchById('TEST_1');
  afficherResultatTest(
    'getMatchById() - Match existant',
    matchTrouve && matchTrouve.id === 'TEST_1'
  );
  
  const matchInexistant = plateforme.getMatchById('INEXISTANT');
  afficherResultatTest(
    'getMatchById() - Match inexistant',
    matchInexistant === undefined
  );
  
  // Test 4: getMatchsParJeu()
  const matchsLoL = plateforme.getMatchsParJeu('League of Legends');
  afficherResultatTest(
    'getMatchsParJeu() - League of Legends',
    matchsLoL.length === 2,
    `Expected: 2, Got: ${matchsLoL.length}`
  );
  
  const matchsValorant = plateforme.getMatchsParJeu('Valorant');
  afficherResultatTest(
    'getMatchsParJeu() - Valorant',
    matchsValorant.length === 1,
    `Expected: 1, Got: ${matchsValorant.length}`
  );
  
  // Test 5: getMatchsRisques()
  const matchsRisques = plateforme.getMatchsRisques();
  afficherResultatTest(
    'getMatchsRisques() - Matchs entre 45% et 55%',
    matchsRisques.length === 2,
    `Expected: 2, Got: ${matchsRisques.length}`
  );
  
  // Test 6: getStatsEquipe()
  const statsKC = plateforme.getStatsEquipe('Karmine Corp');
  afficherResultatTest(
    'getStatsEquipe() - Karmine Corp',
    statsKC.equipe === 'Karmine Corp' && statsKC.matchsJoues === 1,
    `Expected: matchsJoues=1, Got: ${statsKC.matchsJoues}`
  );
  
  const statsInexistante = plateforme.getStatsEquipe('Équipe Inexistante');
  afficherResultatTest(
    'getStatsEquipe() - Équipe inexistante',
    statsInexistante.matchsJoues === 0,
    `Expected: matchsJoues=0, Got: ${statsInexistante.matchsJoues}`
  );
}

/**
 * Tests de simulation
 */
function testerSimulation() {
  console.log('\n🧪 === TESTS DE SIMULATION ===');
  
  const plateforme = new Plateforme('Test Simulation');
  plateforme.chargerMatchs([donneesTestMatchs[0]]); // Un seul match pour le test
  
  const matchAvant = plateforme.getMatchById('TEST_1');
  const statutAvant = matchAvant.statut;
  
  // Test de simulation
  console.log('🎮 Simulation en cours...');
  plateforme.simulerResultat('TEST_1');
  
  const matchApres = plateforme.getMatchById('TEST_1');
  afficherResultatTest(
    'Simulation - Changement de statut',
    matchApres.statut !== statutAvant && matchApres.statut.startsWith('Terminé'),
    `Avant: ${statutAvant}, Après: ${matchApres.statut}`
  );
  
  // Test simulation match inexistant
  console.log('\n⚠️  Test simulation match inexistant:');
  plateforme.simulerResultat('MATCH_INEXISTANT');
}

/**
 * Tests d'intégration
 */
function testerIntegration() {
  console.log('\n🧪 === TESTS D\'INTÉGRATION ===');
  
  const plateforme = new Plateforme('Integration Test');
  
  // Scénario complet
  plateforme.chargerMatchs(donneesTestMatchs);
  
  // Vérification du calendrier
  console.log('\n📅 Affichage du calendrier:');
  plateforme.afficherCalendrier();
  
  // Tests de filtrage avancés
  const matchsLoL = plateforme.getMatchsParJeu('League of Legends');
  const matchsRisques = plateforme.getMatchsRisques();
  
  afficherResultatTest(
    'Intégration - Filtrage par jeu et risques',
    matchsLoL.length > 0 && matchsRisques.length > 0
  );
  
  // Test de cohérence des données
  const totalMatchs = plateforme.matchs.length;
  const matchsParJeuTotal = plateforme.getMatchsParJeu('League of Legends').length + 
                           plateforme.getMatchsParJeu('Valorant').length;
  
  afficherResultatTest(
    'Intégration - Cohérence des données',
    totalMatchs === matchsParJeuTotal,
    `Total: ${totalMatchs}, Par jeu: ${matchsParJeuTotal}`
  );
}

/**
 * Tests de performance (basique)
 */
function testerPerformance() {
  console.log('\n🧪 === TESTS DE PERFORMANCE ===');
  
  const plateforme = new Plateforme('Performance Test');
  
  // Génération de données de test
  const nombreMatchs = 1000;
  const donneesVolumineuses = [];
  
  for (let i = 0; i < nombreMatchs; i++) {
    donneesVolumineuses.push({
      id: `PERF_${i}`,
      jeu: i % 2 === 0 ? 'League of Legends' : 'Valorant',
      competition: 'Test Competition',
      equipeA: `Équipe A${i}`,
      equipeB: `Équipe B${i}`,
      probabiliteA: Math.random(),
      statut: 'À venir'
    });
  }
  
  // Test de chargement
  const debutChargement = Date.now();
  plateforme.chargerMatchs(donneesVolumineuses);
  const finChargement = Date.now();
  
  console.log(`⏱️  Chargement de ${nombreMatchs} matchs: ${finChargement - debutChargement}ms`);
  
  // Test de recherche
  const debutRecherche = Date.now();
  const matchTrouve = plateforme.getMatchById('PERF_500');
  const finRecherche = Date.now();
  
  console.log(`🔍 Recherche par ID: ${finRecherche - debutRecherche}ms`);
  
  // Test de filtrage
  const debutFiltrage = Date.now();
  const matchsLoL = plateforme.getMatchsParJeu('League of Legends');
  const finFiltrage = Date.now();
  
  console.log(`🔽 Filtrage par jeu: ${finFiltrage - debutFiltrage}ms`);
  console.log(`📊 Résultats: ${matchsLoL.length} matchs League of Legends trouvés`);
}

// ============================
// EXÉCUTION DES TESTS
// ============================

/**
 * Lance tous les tests
 */
function executerTousLesTests() {
  console.log('🚀 === DÉBUT DES TESTS DU SYSTÈME ESPORT ===\n');
  
  try {
    testerClasseMatch();
    testerClassePlateforme();
    testerSimulation();
    testerIntegration();
    testerPerformance();
    
    console.log('\n✨ === TOUS LES TESTS SONT TERMINÉS ===');
    console.log('📝 Vérifiez les résultats ci-dessus pour identifier d\'éventuels problèmes.');
    
  } catch (error) {
    console.error('💥 Erreur lors de l\'exécution des tests:', error);
  }
}

// Exécution automatique des tests
executerTousLesTests();
