const translations = {
    en: {
        title: "Drake Equation",
        subtitle: "An interactive estimate of advanced civilizations in our galaxy.",
        hero_description: "This tool allows you to explore the <strong>Drake Equation</strong>, a probabilistic framework used to estimate the number of active, communicative extraterrestrial civilizations in the Milky Way.",
        guide_1_title: "1. Adjust",
        guide_1_desc: "Move the sliders to set values for each cosmic and biological factor.",
        guide_2_title: "2. Analyze",
        guide_2_desc: "Watch how the final result (N) changes in real-time based on your inputs.",
        guide_3_title: "3. Learn",
        guide_3_desc: "Click the <span class=\"info-icon\" style=\"display:inline-flex; width:16px; height:16px; font-size:10px;\">ⓘ</span> icons to understand the scientific basis of each parameter.",
        presets_title: "Presets",
        preset_optimistic: "Optimistic",
        preset_scientific: "Scientific",
        preset_pessimistic: "Pessimistic",
        factors_title: "Individual Factors",
        reset_button: "Reset to Defaults",
        tooltip_current_label: "Current Estimates",
        tooltip_scientific_label: "Scientific Basis",
        tooltip_importance_label: "Why It Matters",
        result_label: "Estimated result (N)",
        result_unit: "Communicative civilizations",
        result_initial: "Adjust parameters to explore scenarios.",
        chart_title: "Sensitivity Analysis",
        share_btn: "Share",
        export_btn: "Export",
        toggle_log: "Log",
        chart_explanation_base: "Varying {param} while keeping others constant shows how sensitive the total estimate N is to this specific factor.",
        funnel_title: "Cosmic Filter Funnel",
        funnel_intro: "Imagine the galaxy as a vast funnel. Each factor in the equation acts as a filter that reduces the chances of finding life. Many candidates enter from the top, but only a few make it to the bottom as detectable civilizations.",
        funnel_explanation: "This visualization shows how each factor filters down the total number of potential communicative civilizations from the billions of stars in our galaxy.",
        background_title: "Background and Context",
        background_text_1: "The Drake equation was formulated by Dr. Frank Drake in 1961. It serves as a probabilistic argument used to estimate the number of active, communicative extraterrestrial civilizations in the Milky Way galaxy.",
        background_text_2: "The equation breaks down a large, unknown problem into smaller, more manageable pieces. While many values remain speculative, it remains a cornerstone of astrobiology and the search for extraterrestrial intelligence.",
        fermi_title: "The Fermi Paradox",
        fermi_text_1: "The Fermi Paradox highlights the contradiction between the high probability of extraterrestrial civilizations and the lack of evidence for their existence.",
        fermi_text_2: "Possible explanations include the \"Great Filter\" hypothesis, suggesting that civilizations might inevitably self-destruct or that the emergence of life is rarer than we think.",
        habitable_title: "The Habitable Zone",
        habitable_text: "A key component of the equation (n<sub>e</sub>) relies on the concept of the \"Goldilocks Zone\"—the region around a star where liquid water can exist on a planet's surface. Understanding this helps narrow down which of the billions of planets in our galaxy might actually be candidates for life.",
        tech_title: "Technosignatures and SETI",
        tech_text: "The final factors (f<sub>c</sub> and L) relate to how we might actually detect another civilization. Scientists look for \"technosignatures\" like narrow-band radio signals, laser pulses, or even massive engineering projects like Dyson Spheres. The Search for Extraterrestrial Intelligence (SETI) is the active effort to find these markers.",
        timeline_title: "Timeline of the Search",
        link_drake: "Drake Equation",
        link_fermi: "Fermi Paradox",
        link_astrobiology: "Astrobiology",
        link_seti: "SETI Institute",
        link_exoplanets: "Exoplanets",
        link_source: "Source Code",
        section_sensitivity: "Sensitivity Analysis",
        sensitivity_intro: "This graph shows how the final estimate (N) varies when a single parameter is modified while the others are held constant. It helps identify which factors have the greatest impact on the result.",
        section_funnel: "Cosmic Filter Funnel",
        section_learn: "Learn More",
        funnel_steps: {
            total: "Stars in Galaxy",
            planets: "With Planets",
            habitable: "Habitable",
            life: "Developing Life",
            intelligence: "Intelligent",
            tech: "Communicative (N)"
        },
        funnel_insights: {
            total: "The starting point: ~200 billion stars in the Milky Way.",
            planets: "Most stars have planets, but not all are in stable systems.",
            habitable: "Only planets in the 'Goldilocks Zone' can support liquid water.",
            life: "The jump from organic chemistry to biology. A major unknown.",
            intelligence: "Does life always lead to brains? Or is intelligence a fluke?",
            tech: "The final filter: how many build radios and how long do they last?"
        },
        label_Rstar: "Star formation rate (R*)",
        label_fp: "Fraction with planets (f<sub>p</sub>)",
        label_ne: "Habitable planets (n<sub>e</sub>)",
        label_fl: "Fraction with life (f<sub>l</sub>)",
        label_fi: "Fraction with intelligence (f<sub>i</sub>)",
        label_fc: "Fraction with technology (f<sub>c</sub>)",
        label_L: "Civilization lifetime (L)",
        labels: {
            Rstar: "Star formation rate (R*)",
            fp: "Fraction with planets (f<sub>p</sub>)",
            ne: "Habitable planets (n<sub>e</sub>)",
            fl: "Fraction with life (f<sub>l</sub>)",
            fi: "Fraction with intelligence (f<sub>i</sub>)",
            fc: "Fraction with technology (f<sub>c</sub>)",
            L: "Civilization lifetime (L)"
        },
        scenarios: {
            shooting_star: {
                name: "The Shooting Star Scenario",
                desc: "Civilizations emerge frequently but vanish almost instantly. The galaxy is a graveyard of short-lived societies."
            },
            rare_earth: {
                name: "The Rare Earth Scenario",
                desc: "The universe is habitable, but the jump from chemistry to biology or intelligence is an incredibly rare miracle."
            },
            silent_wilderness: {
                name: "The Silent Wilderness",
                desc: "The galaxy is teeming with life and intelligence, but they remain 'primitive' or choose to live without detectable technology."
            },
            galactic_club: {
                name: "The Galactic Club",
                desc: "Civilizations survive for eons. The galaxy should be highly organized and filled with ancient, immortal societies."
            },
            balanced: {
                name: "The Balanced Cosmos",
                desc: "A moderate universe where civilizations are spaced out both in distance and time."
            }
        },
        context: {
            nearest: "Nearest Neighbor (est.)",
            star_ratio: "Star Ratio",
            unit_ly: "light years",
            unit_stars: "1 per {n} stars",
            filter_alone: "<strong>Filter Insight:</strong> We are likely alone. The \"Great Filter\" is likely behind us (life or intelligence is the hard part).",
            filter_rare: "<strong>Filter Insight:</strong> Civilizations are rarities. The vast distances between them make contact a near-impossible dream.",
            filter_common: "<strong>Filter Insight:</strong> With {n} civilizations, the Great Filter may be ahead of us. If they are common but we see nothing, they might all face a common cause of extinction.",
            scientific_note: "Calculations assume civilizations are uniformly distributed across a galactic disk of 100,000 light-years. Star ratio is based on an estimated 200 billion stars in the Milky Way."
        },
        fermi_dynamic: {
            weak: "<strong>With N < 1:</strong> The paradox is weak. If civilizations are this rare, we might genuinely be alone or the first to emerge.",
            start: "<strong>With N ≈ {n}:</strong> The paradox begins to emerge. Why haven't we detected any signals?",
            significant: "<strong>With N ≈ {n}:</strong> The paradox is significant! With thousands of civilizations, we should have seen something.",
            extreme: "<strong>With N ≈ {n}:</strong> The paradox is at its most extreme! The galaxy should be teeming with life."
        },
        tooltips: {
            Rstar: {
                title: "Star Formation Rate (R*)",
                description: "The average number of stars formed in the Milky Way each year.",
                current: "1.5 – 3.0 stars/year",
                scientific: "Measured via infrared observations of gas clouds. While the galaxy is billions of years old, it still produces \"nurseries\" where gravity collapses gas into new suns.",
                uncertainty: "low",
                importance: "This is the foundational \"engine\" of the galaxy. No stars means no planets, and no life."
            },
            fp: {
                title: "Fraction with Planets (f<sub>p</sub>)",
                description: "The percentage of stars that possess planetary systems.",
                current: "0.8 – 1.0 (80% to 100%)",
                scientific: "Recent exoplanet missions (Kepler, TESS) have revolutionized this. We now believe almost every star has at least one planet.",
                uncertainty: "low",
                importance: "A decade ago, we didn't know if planets were rare. Now we know they are the rule, not the exception."
            },
            ne: {
                title: "Habitable Planets (n<sub>e</sub>)",
                description: "Number of Earth-like planets per system capable of supporting life.",
                current: "0.1 – 2.0",
                scientific: "Focuses on the \"Goldilocks Zone\" where liquid water can exist. It considers rocky planets with stable orbits around stable stars.",
                uncertainty: "medium",
                importance: "Just because a planet exists doesn't mean it's habitable. It needs the right size, composition, and distance from its sun."
            },
            fl: {
                title: "Fraction Developing Life (f<sub>l</sub>)",
                description: "The probability that life emerges on a habitable planet.",
                current: "Speculative: 0.01 – 1.0",
                scientific: "We only have one data point: Earth. Life appeared here almost as soon as the planet cooled, suggesting it might be an inevitable chemical process.",
                uncertainty: "high",
                importance: "This is a major \"Biological Filter.\" If life is hard to start, the universe is a beautiful but dead wilderness."
            },
            fi: {
                title: "Intelligence (f<sub>i</sub>)",
                description: "The probability that life evolves to become intelligent.",
                current: "Unknown: 0.001 – 1.0",
                scientific: "Earth had life for 3 billion years before intelligence. Evolution favors survival, not necessarily \"thinking.\" Intelligence may be a rare evolutionary accident.",
                uncertainty: "very high",
                importance: "Even if the galaxy is full of \"bacteria\" or \"dinosaurs,\" they won't build telescopes."
            },
            fc: {
                title: "Technology (f<sub>c</sub>)",
                description: "Fraction of intelligent species that develop detectable technology.",
                current: "Unknown: 0.1 – 0.2",
                scientific: "Species could be intelligent (like dolphins) but lack the tools, environment, or resources to build radio communication.",
                uncertainty: "very high",
                importance: "This is what makes a civilization visible. Without \"technosignatures,\" we will never find them."
            },
            L: {
                title: "Civilization Lifetime (L)",
                description: "The number of years a technological species remains detectable.",
                current: "Highly Speculative: 100 – 1,000,000 years",
                scientific: "Do civilizations destroy themselves via climate change, war, or AI? Or do they survive for millions of years?",
                uncertainty: "very high",
                importance: "The most critical factor. If civilizations only last 1,000 years, they likely never exist at the same time as their neighbors."
            }
        },
        uncertainty: {
            low: "Well Known",
            medium: "Moderate Uncertainty",
            high: "Highly Speculative",
            very_high: "Extremely Speculative"
        },
        funnel_labels: ['Total Stars', 'With Planets', 'Habitable', 'With Life', 'Intelligent', 'Communicative (N)'],
        chart_axis_x: "Parameter Value",
        timeline: [
            { year: "1960", title: "Project Ozma", desc: "Frank Drake performs the first modern SETI experiment using a radio telescope.", wiki: "https://en.wikipedia.org/wiki/Project_Ozma" },
            { year: "1961", title: "Equation Formulated", desc: "The equation is presented at the Green Bank conference.", wiki: "https://en.wikipedia.org/wiki/Drake_equation" },
            { year: "1974", title: "Arecibo Message", desc: "A high-power radio message is beamed into space toward the M13 star cluster.", wiki: "https://en.wikipedia.org/wiki/Arecibo_message", discovery: "First intentional message to space" },
            { year: "1977", title: "The \"Wow!\" Signal", desc: "A strong narrowband radio signal is detected, matching the expected profile of a technosignature.", wiki: "https://en.wikipedia.org/wiki/Wow!_signal", discovery: "Only confirmed unexplained signal" },
            { year: "1992", title: "First Exoplanets", desc: "Confirmation of planets orbiting pulsar PSR B1257+12.", wiki: "https://en.wikipedia.org/wiki/Exoplanet", discovery: "Validates f_p – planets exist!" },
            { year: "1995", title: "51 Pegasi b", desc: "First discovery of a planet orbiting a Sun-like star.", wiki: "https://en.wikipedia.org/wiki/51_Pegasi_b", discovery: "Planets like ours are common" },
            { year: "2009", title: "Kepler Mission", desc: "NASA launches Kepler, proving that planets are common throughout the galaxy.", wiki: "https://en.wikipedia.org/wiki/Kepler_Space_Telescope", discovery: "5000+ exoplanets discovered" },
            { year: "2015", title: "Breakthrough Listen", desc: "Launch of the most comprehensive scientific search for alien communications.", wiki: "https://en.wikipedia.org/wiki/Breakthrough_Listen", discovery: "Most extensive SETI effort" },
            { year: "2018", title: "TESS Launch", desc: "The Transiting Exoplanet Survey Satellite begins mapping the nearest and brightest stars.", wiki: "https://en.wikipedia.org/wiki/TESS_(satellite)", discovery: "Searching nearby habitable worlds" },
            { year: "2021", title: "James Webb (JWST)", desc: "Launch of the telescope capable of detecting biosignatures in exoplanet atmospheres.", wiki: "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope", discovery: "Can detect life signatures" }
        ],
        key_concepts_title: "Key Concepts",
        concept_habitable: {
            title: "Habitable Zone",
            desc: "The region around a star (the 'Goldilocks Zone') where liquid water can exist on a planet's surface. Too close and it boils; too far and it freezes."
        },
        concept_technosignature: {
            title: "Technosignature",
            desc: "Evidence of technological activity—radio signals, laser pulses, atmospheric pollution, megastructures, or waste heat. How we'd know someone is 'home.'"
        },
        concept_great_filter: {
            title: "The Great Filter",
            desc: "A hypothetical barrier explaining the Fermi Paradox. Either life is incredibly rare (filter behind us), or civilizations self-destruct quickly (filter ahead)."
        },
        concept_cosmic_perspective: {
            title: "Cosmic Perspective",
            desc: "Even one alien civilization would revolutionize our understanding of life. Finding intelligent life would validate centuries of speculation."
        },
        uncertainty_title: "A Note on Uncertainty",
        uncertainty_text: "The Drake Equation estimates vary by <strong>10 orders of magnitude</strong>—from isolated Earth to billions of civilizations. This isn't a flaw; it's honest uncertainty. We're working with incomplete data, and disagreement itself is scientifically valuable. This tool is speculative, not predictive.",
        result_interpretation: {
            title: "What This Means",
            near: "Communicative civilizations are roughly 1 per {distance} light-years apart.",
            ratio: "That's about 1 civilization per {ratio} stars in the galaxy.",
            earth_context: "Earth is 1 unique world among ~200 billion stars.",
            filter_note: "If this number is low, the \"Great Filter\" (life or intelligence) may be behind us. If high but we detect nothing, it may be ahead."
        },
        magnitude_scale: "Order of Magnitude Scale",
        magnitude_explanation: "Based on your settings, here's where your estimate lands on the cosmic scale—from a solitary civilization to billions across the galaxy:",
        references_title: "References & Resources",
        confidence_levels_title: "Scientific Confidence Levels",
        confidence_levels: {
            Rstar: "low",
            fp: "low",
            ne: "medium",
            fl: "high",
            fi: "very_high",
            fc: "very_high",
            L: "very_high"
        },
        confidence_legend: {
            low: "Well-observed (green): Data-driven from telescopes",
            medium: "Theoretical but grounded (yellow): Based on established science",
            high: "Highly speculative (orange): Educated guesses",
            very_high: "Extremely speculative (red): Profound unknowns"
        }
    },
    es: {
        title: "Ecuación de Drake",
        subtitle: "Una estimación interactiva de civilizaciones avanzadas en nuestra galaxia.",
        hero_description: "Esta herramienta permite explorar la <strong>Ecuación de Drake</strong>, un marco probabilístico utilizado para estimar el número de civilizaciones extraterrestres activas y comunicativas en la Vía Láctea.",
        guide_1_title: "1. Ajustar",
        guide_1_desc: "Mueve los deslizadores para establecer los valores de cada factor cósmico y biológico.",
        guide_2_title: "2. Analizar",
        guide_2_desc: "Observa cómo cambia el resultado final (N) en tiempo real según tus entradas.",
        guide_3_title: "3. Aprender",
        guide_3_desc: "Haz clic en los iconos <span class=\"info-icon\" style=\"display:inline-flex; width:16px; height:16px; font-size:10px;\">ⓘ</span> para entender la base científica de cada parámetro.",
        presets_title: "Preajustes",
        preset_optimistic: "Optimista",
        preset_scientific: "Científico",
        preset_pessimistic: "Pesimista",
        factors_title: "Factores Individuales",
        reset_button: "Restablecer Valores",
        tooltip_current_label: "Estimaciones Actuales",
        tooltip_scientific_label: "Base Científica",
        tooltip_importance_label: "Por Qué Importa",
        result_label: "Resultado estimado (N)",
        result_unit: "Civilizaciones comunicativas",
        result_initial: "Ajusta los parámetros para explorar escenarios.",
        chart_title: "Análisis de Sensibilidad",
        share_btn: "Compartir",
        export_btn: "Exportar",
        toggle_log: "Log",
        chart_explanation_base: "Variar {param} manteniendo los demás constantes muestra qué tan sensible es la estimación total N a este factor específico.",
        funnel_title: "Embudo de Filtrado Cósmico",
        funnel_explanation: "Esta visualización muestra cómo cada factor filtra el número total de posibles civilizaciones comunicativas a partir de los miles de millones de estrellas en nuestra galaxia.",
        background_title: "Antecedentes y Contexto",
        background_text_1: "La ecuación de Drake fue formulada por el Dr. Frank Drake in 1961. Sirve como un argumento probabilístico utilizado para estimar el número de civilizaciones extraterrestres activas y comunicativas en la galaxia de la Vía Láctea.",
        background_text_2: "La ecuación desglosa un problema grande y desconocido en piezas más pequeñas y manejables. Aunque muchos valores siguen siendo especulativos, sigue siendo una piedra angular de la astrobiología y la búsqueda de inteligencia extraterrestre.",
        fermi_title: "La Paradoja de Fermi",
        fermi_text_1: "La Paradoja de Fermi resalta la contradicción entre la alta probabilidad de civilizaciones extraterrestres y la falta de evidencia de su existencia.",
        fermi_text_2: "Las posibles explicaciones incluyen la hipótesis del \"Gran Filtro\", que sugiere que las civilizaciones podrían autodestruirse inevitablemente o que el surgimiento de la vida es más raro de lo que pensamos.",
        habitable_title: "La Zona Habitable",
        habitable_text: "Un componente clave de la ecuación (n<sub>e</sub>) se basa en el concepto de la \"Zona de Ricitos de Oro\": la región alrededor de una estrella donde puede existir agua líquida en la superficie de un planeta. Entender esto ayuda a reducir cuáles de los miles de millones de planetas en nuestra galaxia podrían ser candidatos para la vida.",
        tech_title: "Tecnofirmas y SETI",
        tech_text: "Los factores finales (f<sub>c</sub> y L) se relacionan con cómo podríamos detectar realmente otra civilización. Los científicos buscan \"tecnofirmas\" como señales de radio de banda estrecha, pulsos láser o incluso proyectos de ingeniería masivos como las Esferas de Dyson. La Búsqueda de Inteligencia Extraterrestre (SETI) es el esfuerzo activo para encontrar estos marcadores.",
        timeline_title: "Cronología de la Búsqueda",
        link_drake: "Ecuación de Drake",
        link_fermi: "Paradoja de Fermi",
        link_astrobiology: "Astrobiología",
        link_seti: "Instituto SETI",
        link_exoplanets: "Exoplanetas",
        link_source: "Código Fuente",
        section_sensitivity: "Análisis de Sensibilidad",
        section_funnel: "Embudo de Filtrado Cósmico",
        sensitivity_intro: "Esta gráfica muestra cómo varía la estimación final (N) al modificar un único parámetro mientras los demás se mantienen constantes. Es útil para identificar qué factores tienen el mayor impacto en el resultado.",
        funnel_intro: "Imagina la galaxia como un gran embudo. Cada factor de la ecuación actúa como un filtro que reduce las posibilidades de encontrar vida. Muchos candidatos entran por arriba, pero muy pocos logran salir por abajo como civilizaciones detectables.",
        section_learn: "Aprender Más",
        funnel_steps: {
            total: "Estrellas en la Vía Láctea",
            planets: "Sistemas con Planetas",
            habitable: "Mundos Habitables",
            life: "Donde surge la Vida",
            intelligence: "Vida Inteligente",
            tech: "Civilizaciones Detectables (N)"
        },
        funnel_insights: {
            total: "Nuestra galaxia es inmensa, con unos 200 mil millones de soles. Cada uno es una oportunidad para la vida.",
            planets: "Hoy sabemos que casi todas las estrellas tienen planetas. La mayoría de los soles de la galaxia poseen su propio sistema planetario.",
            habitable: "No todos los planetas son aptos. Solo los que están a la distancia justa de su sol (Zona de Ricitos de Oro) pueden albergar agua líquida.",
            life: "Este es un gran salto: de la química a la biología. ¿Es la vida un proceso inevitable o un milagro químico extremadamente raro?",
            intelligence: "Incluso con vida, ¿cuántos mundos desarrollan cerebros complejos? La evolución puede favorecer la supervivencia sin necesidad de inteligencia.",
            tech: "El filtro final. Para encontrarlas, deben emitir señales al espacio y sobrevivir lo suficiente como para que sus mensajes nos alcancen."
        },
        label_Rstar: "Tasa de formación estelar (R*)",
        label_fp: "Fracción con planetas (f<sub>p</sub>)",
        label_ne: "Planetas habitables (n<sub>e</sub>)",
        label_fl: "Fracción con vida (f<sub>l</sub>)",
        label_fi: "Fracción con inteligencia (f<sub>i</sub>)",
        label_fc: "Fracción con tecnología (f<sub>c</sub>)",
        label_L: "Vida de la civilización (L)",
        labels: {
            Rstar: "Tasa de formación estelar (R*)",
            fp: "Fracción con planetas (f<sub>p</sub>)",
            ne: "Planetas habitables (n<sub>e</sub>)",
            fl: "Fracción con vida (f<sub>l</sub>)",
            fi: "Fracción con inteligencia (f<sub>i</sub>)",
            fc: "Fracción con tecnología (f<sub>c</sub>)",
            L: "Vida de la civilización (L)"
        },
        scenarios: {
            shooting_star: {
                name: "El Escenario de la Estrella Fugaz",
                desc: "Las civilizaciones surgen con frecuencia pero desaparecen casi instantáneamente. La galaxia es un cementerio de sociedades de corta duración."
            },
            rare_earth: {
                name: "El Escenario de la Tierra Rara",
                desc: "El universo es habitable, pero el salto de la química a la biología o la inteligencia es un milagro increíblemente raro."
            },
            silent_wilderness: {
                name: "El Desierto Silencioso",
                desc: "La galaxia rebosa de vida e inteligencia, pero permanecen 'primitivas' o eligen vivir sin tecnología detectable."
            },
            galactic_club: {
                name: "El Club Galáctico",
                desc: "Las civilizaciones sobreviven durante eones. La galaxia debería estar altamente organizada y llena de sociedades antiguas e inmortales."
            },
            balanced: {
                name: "El Cosmos Equilibrado",
                desc: "Un universo moderado donde las civilizaciones están espaciadas tanto en distancia como en tiempo."
            }
        },
        context: {
            nearest: "Vecino más cercano (est.)",
            star_ratio: "Ratio estelar",
            unit_ly: "años luz",
            unit_stars: "1 por cada {n} estrellas",
            filter_alone: "<strong>Perspectiva del Filtro:</strong> Es probable que estemos solos. El \"Gran Filtro\" probablemente ha quedado atrás (la vida o la inteligencia es la parte difícil).",
            filter_rare: "<strong>Perspectiva del Filtro:</strong> Las civilizaciones son rarezas. Las vastas distancias entre ellas hacen del contacto un sueño casi imposible.",
            filter_common: "<strong>Perspectiva del Filtro:</strong> Con {n} civilizaciones, el Gran Filtro puede estar por delante. Si son comunes pero no vemos nada, todas podrían enfrentar una causa común de extinción.",
            scientific_note: "Los cálculos asumen que las civilizaciones están distribuidas uniformemente en un disco galáctico de 100,000 años luz. El ratio estelar se basa en un estimado de 200 mil millones de estrellas en la Vía Láctea."
        },
        fermi_dynamic: {
            weak: "<strong>Con N < 1:</strong> La paradoja es débil. Si las civilizaciones son tan raras, podríamos estar realmente solos o ser los primeros en surgir.",
            start: "<strong>Con N ≈ {n}:</strong> ¡La paradoja comienza a emerger! ¿Por qué no hemos detectado ninguna señal?",
            significant: "<strong>Con N ≈ {n}:</strong> ¡La paradoja es significativa! Con miles de civilizaciones, deberíamos haber visto algo.",
            extreme: "<strong>Con N ≈ {n}:</strong> ¡La paradoja está en su punto más extremo! La galaxia debería estar llena de vida."
        },
        tooltips: {
            Rstar: {
                title: "Tasa de Formación Estelar (R*)",
                description: "El número promedio de estrellas que se forman en la Vía Láctea cada año.",
                current: "1.5 – 3.0 estrellas/año",
                scientific: "Medido mediante observaciones infrarrojas de nubes de gas. Aunque la galaxia tiene miles de millones de años, todavía produce \"viveros\" donde la gravedad colapsa el gas en nuevos soles.",
                uncertainty: "low",
                importance: "Este es el \"motor\" fundamental de la galaxia. Sin estrellas no hay planetas, y sin planetas no hay vida."
            },
            fp: {
                title: "Fracción con Planetas (f<sub>p</sub>)",
                description: "El porcentaje de estrellas que poseen sistemas planetarios.",
                current: "0.8 – 1.0 (80% al 100%)",
                scientific: "Las misiones recientes de exoplanetas (Kepler, TESS) han revolucionado esto. Ahora creemos que casi cada estrella tiene al menos un planeta.",
                uncertainty: "low",
                importance: "Hace una década, no sabíamos si los planetas eran raros. Ahora sabemos que son la regla, no la excepción."
            },
            ne: {
                title: "Planetas Habitables (n<sub>e</sub>)",
                description: "Número de planetas tipo Tierra por sistema capaces de soportar vida.",
                current: "0.1 – 2.0",
                scientific: "Se centra en la \"Zona de Ricitos de Oro\" donde puede existir agua líquida. Considera planetas rocosos con órbitas estables alrededor de estrellas estables.",
                uncertainty: "medium",
                importance: "Que un planeta exista no significa que sea habitable. Necesita el tamaño, la composición y la distancia adecuada de su sol."
            },
            fl: {
                title: "Fracción que Desarrolla Vida (f<sub>l</sub>)",
                description: "La probabilidad de que surja vida en un planeta habitable.",
                current: "Especulativo: 0.01 – 1.0",
                scientific: "Solo tenemos un punto de datos: la Tierra. La vida apareció aquí casi tan pronto como el planeta se enfrió, lo que sugiere que podría ser un proceso químico inevitable.",
                uncertainty: "high",
                importance: "Este es un gran \"Filtro Biológico\". Si la vida es difícil de iniciar, el universo es un desierto hermoso pero muerto."
            },
            fi: {
                title: "Inteligencia (f<sub>i</sub>)",
                description: "La probabilidad de que la vida evolucione hasta volverse inteligente.",
                current: "Desconocido: 0.001 – 1.0",
                scientific: "La Tierra tuvo vida durante 3 mil millones de años antes de la inteligencia. La evolución favorece la supervivencia, no necesariamente el \"pensamiento\". La inteligencia puede ser un accidente evolutivo raro.",
                uncertainty: "very high",
                importance: "Incluso si la galaxia está llena de \"bacterias\" o \"dinosaurios\", estos no construirán telescopios."
            },
            fc: {
                title: "Tecnología (f<sub>c</sub>)",
                description: "Fracción de especies inteligentes que desarrollan tecnología detectable.",
                current: "Desconocido: 0.1 – 0.2",
                scientific: "Las especies podrían ser inteligentes (como los delfines) pero carecer de las herramientas, el entorno o los recursos para construir comunicaciones por radio.",
                uncertainty: "very high",
                importance: "Esto es lo que hace visible a una civilización. Sin \"tecnofirmas\", nunca las encontraremos."
            },
            L: {
                title: "Vida de la Civilización (L)",
                description: "El número de años que una especie tecnológica permanece detectable.",
                current: "Altamente Especulativo: 100 – 1,000,000 años",
                scientific: "¿Se destruyen las civilizaciones a sí mismas mediante el cambio climático, la guerra o la IA? ¿O sobreviven durante millones de años?",
                uncertainty: "very high",
                importance: "El factor más crítico. Si las civilizaciones solo duran 1,000 años, probablemente nunca existan al mismo tiempo que sus vecinos."
            }
        },
        uncertainty: {
            low: "Bien conocido",
            medium: "Incertidumbre moderada",
            high: "Muy especulativo",
            very_high: "Extremadamente especulativo"
        },
        funnel_labels: ['Estrellas totales', 'Con planetas', 'Habitables', 'Con vida', 'Inteligentes', 'Comunicativas (N)'],
        chart_axis_x: "Valor del parámetro",
        timeline: [
            { year: "1960", title: "Proyecto Ozma", desc: "Frank Drake realiza el primer experimento SETI moderno utilizando un radiotelescopio.", wiki: "https://en.wikipedia.org/wiki/Project_Ozma", discovery: "Primer experimento SETI" },
            { year: "1961", title: "Ecuación Formulada", desc: "La ecuación se presenta en la conferencia de Green Bank.", wiki: "https://en.wikipedia.org/wiki/Drake_equation", discovery: "Nace el framework científico" },
            { year: "1974", title: "Mensaje de Arecibo", desc: "Se emite un mensaje de radio de alta potencia al espacio hacia el cúmulo estelar M13.", wiki: "https://en.wikipedia.org/wiki/Arecibo_message", discovery: "Primer mensaje intencional al espacio" },
            { year: "1977", title: "La señal \"Wow!\"", desc: "Se detecta una fuerte señal de radio de banda estrecha, que coincide con el perfil esperado de una tecnofirma.", wiki: "https://en.wikipedia.org/wiki/Wow!_signal", discovery: "Única señal inexplicada confirmada" },
            { year: "1992", title: "Primeros Exoplanetas", desc: "Confirmación de planetas orbitando el púlsar PSR B1257+12.", wiki: "https://en.wikipedia.org/wiki/Exoplanet", discovery: "¡Valida f_p – existen planetas!" },
            { year: "1995", title: "51 Pegasi b", desc: "Primer descubrimiento de un planeta orbitando una estrella similar al Sol.", wiki: "https://en.wikipedia.org/wiki/51_Pegasi_b", discovery: "Planetas como el nuestro son comunes" },
            { year: "2009", title: "Misión Kepler", desc: "La NASA lanza Kepler, demostrando que los planetas son comunes en toda la galaxia.", wiki: "https://en.wikipedia.org/wiki/Kepler_Space_Telescope", discovery: "5000+ exoplanetas descubiertos" },
            { year: "2015", title: "Breakthrough Listen", desc: "Lanzamiento de la búsqueda científica más exhaustiva de comunicaciones alienígenas.", wiki: "https://en.wikipedia.org/wiki/Breakthrough_Listen", discovery: "Esfuerzo SETI más comprehensivo" },
            { year: "2018", title: "Lanzamiento de TESS", desc: "El Satélite de Sondeo de Exoplanetas en Tránsito comienza a mapear las estrellas más cercanas y brillantes.", wiki: "https://en.wikipedia.org/wiki/TESS_(satellite)", discovery: "Buscando mundos habitables cercanos" },
            { year: "2021", title: "James Webb (JWST)", desc: "Lanzamiento del telescopio capaz de detectar biofirmas en atmósferas de exoplanetas.", wiki: "https://en.wikipedia.org/wiki/James_Webb_Space_Telescope", discovery: "Puede detectar firmas de vida" }
        ],
        key_concepts_title: "Conceptos Clave",
        concept_habitable: {
            title: "Zona Habitable",
            desc: "La región alrededor de una estrella (la 'Zona de Ricitos de Oro') donde el agua líquida puede existir en la superficie. Demasiado cerca hirviendo; demasiado lejos congela."
        },
        concept_technosignature: {
            title: "Tecnofirma",
            desc: "Evidencia de actividad tecnológica—señales de radio, pulsos láser, contaminación atmosférica, megaestructuras, o calor residual. Cómo sabríamos que 'alguien está en casa.'"
        },
        concept_great_filter: {
            title: "El Gran Filtro",
            desc: "Una barrera hipotética que explica la Paradoja de Fermi. O la vida es increíblemente rara (filtro detrás), o las civilizaciones se autodestruyen rápido (filtro adelante)."
        },
        concept_cosmic_perspective: {
            title: "Perspectiva Cósmica",
            desc: "Incluso una civilización extraterrestre revolucionaría nuestra comprensión de la vida. Encontrar vida inteligente validaría siglos de especulación."
        },
        uncertainty_title: "Una Nota sobre la Incertidumbre",
        uncertainty_text: "Las estimaciones de la Ecuación de Drake varían en <strong>10 órdenes de magnitud</strong>—desde una Tierra aislada a miles de millones de civilizaciones. No es un defecto; es incertidumbre honesta. Trabajamos con datos incompletos, y el desacuerdo es científicamente valioso. Esta herramienta es especulativa, no predictiva.",
        result_interpretation: {
            title: "Qué Significa Esto",
            near: "Las civilizaciones comunicativas están aproximadamente 1 cada {distance} años luz.",
            ratio: "Eso es alrededor de 1 civilización per cada {ratio} estrellas en la galaxia.",
            earth_context: "La Tierra es 1 mundo único entre ~200 mil millones de estrellas.",
            filter_note: "Si este número es bajo, el 'Gran Filtro' (vida o inteligencia) puede estar detrás. Si es alto pero no detectamos nada, puede estar adelante."
        },
        magnitude_scale: "Escala de Orden de Magnitud",
        magnitude_explanation: "Según tus configuraciones, aquí es donde se sitúa tu estimación en la escala cósmica—desde apenas una civilización a miles de millones dispersos en la galaxia:",
        references_title: "Referencias y Recursos",
        confidence_levels_title: "Niveles de Confianza Científica",
        confidence_levels: {
            Rstar: "low",
            fp: "low",
            ne: "medium",
            fl: "high",
            fi: "very_high",
            fc: "very_high",
            L: "very_high"
        },
        confidence_legend: {
            low: "Bien observado (verde): Datos de telescopios",
            medium: "Teórico pero fundamentado (amarillo): Ciencia establecida",
            high: "Altamente especulativo (naranja): Conjeturas educadas",
            very_high: "Extremadamente especulativo (rojo): Incógnitas profundas"
        }
    }
};
