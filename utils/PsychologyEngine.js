const analyzeProfile = (user) => {
    const report = {
        summary: "",
        strengths: [],
        areas_of_support: [],
        neuro_indicators: {} 
    };

    const history = user.performanceHistory || [];
    const stats = user.stats || {};
    const levels = stats.levels || {};

    // 1. Análisis de Atención
    const attentionGames = history.filter(h => h.gameId === 'attention' || h.gameId === 'stroop');
    if (attentionGames.length >= 3) {
        const avgErrors = attentionGames.reduce((acc, cur) => acc + (cur.metrics?.errors || 0), 0) / attentionGames.length;
        if (avgErrors > 3) {
            report.areas_of_support.push("Control de Impulsos: Tiende a responder rápido sacrificando precisión.");
        } else {
            report.strengths.push("Atención Sostenida: Muestra buena concentración y detalle.");
        }
    }

    // 2. Análisis Lógico
    if ((levels.logic || 1) >= 5) {
        report.strengths.push("Razonamiento Fluido: Habilidad avanzada para resolver problemas.");
    }

    // Resumen
    const mainTrait = report.strengths.length > 0 ? report.strengths[0].split(':')[0] : "Persistencia";
    report.summary = `El jugador ${user.nickname} demuestra un perfil caracterizado por ${mainTrait}. Se recomienda continuar el entrenamiento.`;

    return report;
};

module.exports = { analyzeProfile };