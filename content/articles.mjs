/**
 * Long-form guide content for the static SEO pages.
 *
 * Bodies are HTML strings. Two tokens are resolved by generate-content.mjs:
 *   {{calc}}            -> calculator page, relative to the current article
 *   {{article:<id>}}    -> sibling article in the same language
 *
 * Add an article here and the generator creates both language versions,
 * links them from every other guide, and rebuilds sitemap.xml.
 */

export const SITE = 'https://mendiak.github.io/drake.equation';

export const LAST_UPDATED = '2026-10-24';

export const ui = {
    en: {
        skip: 'Skip to main content',
        brand: 'Drake Equation',
        calc: 'Calculator',
        guides: 'Guides',
        language: 'Language',
        toc: 'On this page',
        faq: 'Frequently asked questions',
        ctaTitle: 'Put the numbers to work',
        ctaText: 'Move the sliders and watch the estimate change in real time.',
        ctaLabel: 'Open the calculator',
        related: 'Keep reading',
        updated: 'Updated',
        minRead: 'min read',
        authorship: 'By Mikel Aramendia',
        source: 'Source Code',
        home: 'Home',
        breadcrumb: 'Guides'
    },
    es: {
        skip: 'Saltar al contenido principal',
        brand: 'Ecuación de Drake',
        calc: 'Calculadora',
        guides: 'Guías',
        language: 'Idioma',
        toc: 'En esta página',
        faq: 'Preguntas frecuentes',
        ctaTitle: 'Pon los números a trabajar',
        ctaText: 'Mueve los controles y observa cómo cambia la estimación en tiempo real.',
        ctaLabel: 'Abrir la calculadora',
        related: 'Sigue leyendo',
        updated: 'Actualizado',
        minRead: 'min de lectura',
        authorship: 'Por Mikel Aramendia',
        source: 'Código fuente',
        home: 'Inicio',
        breadcrumb: 'Guías'
    }
};

export const articles = [
    {
        id: 'drake',
        slugs: { en: 'what-is-the-drake-equation', es: 'que-es-la-ecuacion-de-drake' },
        en: {
            short: 'Drake Equation',
            title: 'What Is the Drake Equation? A Plain-English Guide',
            description: 'The Drake Equation explained: its origin in 1961, what each of the seven terms means, and why honest estimates range from one civilization to millions.',
            eyebrow: 'Explainer',
            h1: 'What is the Drake Equation?',
            lead: 'In 1961 an astronomer wrote seven terms on a blackboard. Together they turn a vague question — are we alone? — into a list of things we can actually argue about.',
            readingTime: 8,
            sections: [
                {
                    id: 'origins',
                    heading: 'A formula written as an agenda',
                    body: `
<p>In November 1961, Frank Drake hosted a small meeting at the Green Bank radio observatory in West Virginia. The topic was whether it was worth listening for radio signals from other stars. To give the discussion a structure, he wrote a short chain of multiplications on the board.</p>
<p>That is the whole origin story. The equation was not derived from a theory of everything, and it was not intended to produce a precise census of aliens. It was an agenda: a way to split one enormous unknown into seven smaller ones, each of which could be discussed by a different kind of scientist.</p>
<p>The meeting became the first modern SETI conference. The formula became famous under a name Drake never chose for it.</p>`
                },
                {
                    id: 'terms',
                    heading: 'The seven terms, one by one',
                    body: `
<p class="content-formula">N = R* &times; f<sub>p</sub> &times; n<sub>e</sub> &times; f<sub>l</sub> &times; f<sub>i</sub> &times; f<sub>c</sub> &times; L</p>
<p>Each term is a rate or a fraction, not a discovery. Read from left to right, the equation walks down a chain of conditions:</p>
<ul>
    <li><strong>R*</strong> — the average rate at which the Milky Way forms stars, in stars per year.</li>
    <li><strong>f<sub>p</sub></strong> — the fraction of those stars that have planetary systems.</li>
    <li><strong>n<sub>e</sub></strong> — the average number of planets per system that could support life.</li>
    <li><strong>f<sub>l</sub></strong> — the fraction of those habitable planets where life actually appears.</li>
    <li><strong>f<sub>i</sub></strong> — the fraction of life-bearing worlds where intelligent life evolves.</li>
    <li><strong>f<sub>c</sub></strong> — the fraction of intelligent species that develop technology detectable across interstellar distances.</li>
    <li><strong>L</strong> — the average time such a civilization remains detectable, in years.</li>
</ul>
<p>The result, <strong>N</strong>, is the number of communicative civilizations existing <em>now</em> — not the number that have ever existed. That distinction lives entirely in the final term.</p>`
                },
                {
                    id: 'purpose',
                    heading: 'What the equation is actually for',
                    body: `
<p>The Drake Equation is best understood as a bookkeeping device for ignorance. It does not tell you how many civilizations there are. It tells you <em>where</em> the uncertainty is concentrated, and therefore which measurement would actually change the answer.</p>
<p>This matters because the terms are wildly unequal in quality. The first three can be constrained by astronomy. The last four are, so far, informed guesses. If <strong>f<sub>l</sub></strong> turns out to be extremely small, then the search for biosignatures is the decisive experiment. If life is common but intelligence is not, then the interesting question moves to evolution. If civilizations are common but short-lived, then <strong>L</strong> is the term that matters — and the galaxy may be full of ruins rather than radio shows.</p>
<p>In that sense the equation is a map of what we do not know, which is a more useful thing than a fake number.</p>`
                },
                {
                    id: 'uncertainty',
                    heading: 'Why the answer spans ten orders of magnitude',
                    body: `
<p>Plug in optimistic values and N can reach millions. Plug in pessimistic ones and it falls below one, meaning we might be the only civilization in the galaxy. Both results come from the same equation.</p>
<p>The reason is that several terms are unknown by factors of ten, a hundred, or more. Multiplying uncertain numbers does not average out the uncertainty; it compounds it. A common mistake is to take the middle of every plausible range, multiply, and present the result as <em>the</em> estimate. That number has no special status.</p>
<p>A 2018 paper by Anders Sandberg, Eric Drexler and Toby Ord made this explicit. Using broad, honest probability distributions instead of single values, they found that the uncertainty in N is so large that a substantial probability of being alone is entirely consistent with the data. The galaxy can be empty and the equation can still be correct.</p>
<p>Reference: <a href="https://arxiv.org/abs/1806.02404" target="_blank" rel="noopener noreferrer">Sandberg, Drexler &amp; Ord, “Dissolving the Fermi Paradox” (2018)</a>.</p>`
                },
                {
                    id: 'misconceptions',
                    heading: 'Four common misconceptions',
                    body: `
<ul>
    <li><strong>“It proves aliens exist.”</strong> It does not. The equation is a framework; it can be filled with values that produce N &lt; 1.</li>
    <li><strong>“It counts every civilization ever.”</strong> It counts civilizations that are detectable at the same time we are. A civilization that lived for a thousand years, two billion years ago, contributes nothing to N today.</li>
    <li><strong>“It is a scientific law.”</strong> It is a definition plus a set of estimates. The equation itself cannot be falsified; individual terms can be measured.</li>
    <li><strong>“A big N means we should have heard something.”</strong> That is a separate argument — <a href="{{article:fermi}}">the Fermi paradox</a> — and it depends on how long civilizations last and how far they spread.</li>
</ul>`
                },
                {
                    id: 'today',
                    heading: 'What is changing the estimate now',
                    body: `
<p>Two of the seven terms have moved from philosophy into measurement. <strong>f<sub>p</sub></strong> is now close to 1: planets are the normal outcome of star formation, not an exception. <strong>n<sub>e</sub></strong> is being attacked by surveys that count small rocky planets in <a href="{{article:zone}}">the habitable zone</a> around nearby stars.</p>
<p>The harder terms are the biological ones. Transmission spectroscopy of exoplanet atmospheres can, in principle, detect oxygen, methane, or other gases that would be hard to explain without life. That would not settle <strong>f<sub>i</sub></strong> or <strong>f<sub>c</sub></strong>, but it would give <strong>f<sub>l</sub></strong> its first real data point.</p>
<p>Meanwhile, <a href="{{article:seti}}">SETI</a> has moved beyond a single radio dish: modern surveys scan billions of frequencies across millions of stars, and technosignature searches now include lasers, waste heat and industrial pollution. None of this has produced a confirmed detection. That silence is itself a result — just a very difficult one to interpret.</p>`
                }
            ],
            faq: [
                {
                    q: 'Who created the Drake Equation?',
                    a: 'Frank Drake wrote it in 1961 as an agenda for the first conference on searching for extraterrestrial intelligence, held at Green Bank, West Virginia.'
                },
                {
                    q: 'Does the Drake Equation prove that aliens exist?',
                    a: 'No. It is a way of organizing estimates. Depending on the values used, it can produce a galaxy full of civilizations or a number below one.'
                },
                {
                    q: 'What does N actually mean?',
                    a: 'N is the number of civilizations in the Milky Way that are communicative and detectable at the same time we are. It is not the total number that has ever existed.'
                },
                {
                    q: 'Which term is the most uncertain?',
                    a: 'The biological and sociological terms — f_l, f_i, f_c and L. Astronomy can constrain the first three terms; the rest currently rest on reasoning rather than data.'
                }
            ]
        },
        es: {
            short: 'Ecuación de Drake',
            title: '¿Qué es la Ecuación de Drake? Guía clara y sin fórmulas raras',
            description: 'La Ecuación de Drake explicada: su origen en 1961, qué significa cada uno de sus siete términos y por qué las estimaciones honestas van de una civilización a millones.',
            eyebrow: 'Guía',
            h1: '¿Qué es la Ecuación de Drake?',
            lead: 'En 1961 un astrónomo escribió siete términos en una pizarra. Juntos convierten una pregunta vaga —¿estamos solos?— en una lista de cosas sobre las que sí podemos discutir.',
            readingTime: 8,
            sections: [
                {
                    id: 'origins',
                    heading: 'Una fórmula escrita como orden del día',
                    body: `
<p>En noviembre de 1961, Frank Drake organizó una pequeña reunión en el observatorio de radio de Green Bank, en Virginia Occidental. El tema era si merecía la pena escuchar señales de radio de otras estrellas. Para dar estructura a la conversación, escribió en la pizarra una breve cadena de multiplicaciones.</p>
<p>Ese es todo el origen. La ecuación no se dedujo de una teoría del todo ni pretendía hacer un censo preciso de extraterrestres. Era una agenda: una forma de dividir un desconocimiento enorme en siete incógnitas más pequeñas, cada una discutible por un especialista distinto.</p>
<p>La reunión se convirtió en la primera conferencia moderna sobre SETI. La fórmula se hizo famosa con un nombre que Drake nunca eligió.</p>`
                },
                {
                    id: 'terms',
                    heading: 'Los siete términos, uno por uno',
                    body: `
<p class="content-formula">N = R* &times; f<sub>p</sub> &times; n<sub>e</sub> &times; f<sub>l</sub> &times; f<sub>i</sub> &times; f<sub>c</sub> &times; L</p>
<p>Cada término es una tasa o una fracción, no un descubrimiento. Leída de izquierda a derecha, la ecuación recorre una cadena de condiciones:</p>
<ul>
    <li><strong>R*</strong> — el ritmo medio al que la Vía Láctea forma estrellas, en estrellas por año.</li>
    <li><strong>f<sub>p</sub></strong> — la fracción de esas estrellas que tienen sistemas planetarios.</li>
    <li><strong>n<sub>e</sub></strong> — el número medio de planetas por sistema que podrían albergar vida.</li>
    <li><strong>f<sub>l</sub></strong> — la fracción de esos planetas habitables donde la vida aparece de verdad.</li>
    <li><strong>f<sub>i</sub></strong> — la fracción de mundos con vida donde evoluciona vida inteligente.</li>
    <li><strong>f<sub>c</sub></strong> — la fracción de especies inteligentes que desarrollan tecnología detectable a escala interestelar.</li>
    <li><strong>L</strong> — el tiempo medio que esa civilización permanece detectable, en años.</li>
</ul>
<p>El resultado, <strong>N</strong>, es el número de civilizaciones comunicativas que existen <em>ahora</em>, no el número que ha existido alguna vez. Esa distinción vive por completo en el último término.</p>`
                },
                {
                    id: 'purpose',
                    heading: 'Para qué sirve realmente la ecuación',
                    body: `
<p>La Ecuación de Drake se entiende mejor como un sistema de contabilidad de la ignorancia. No dice cuántas civilizaciones hay. Dice <em>dónde</em> se concentra la incertidumbre y, por tanto, qué medición cambiaría de verdad la respuesta.</p>
<p>Esto importa porque los términos son muy desiguales en calidad. Los tres primeros pueden acotarse con astronomía. Los cuatro últimos son, por ahora, conjeturas informadas. Si <strong>f<sub>l</sub></strong> resulta ser extremadamente pequeño, la búsqueda de biofirmas es el experimento decisivo. Si la vida es común pero la inteligencia no, la pregunta interesante se traslada a la evolución. Si las civilizaciones son comunes pero duran poco, el término que manda es <strong>L</strong>, y la galaxia podría estar llena de ruinas en lugar de programas de radio.</p>
<p>En ese sentido, la ecuación es un mapa de lo que no sabemos, algo más útil que un número inventado.</p>`
                },
                {
                    id: 'uncertainty',
                    heading: 'Por qué la respuesta abarca diez órdenes de magnitud',
                    body: `
<p>Con valores optimistas, N puede llegar a millones. Con valores pesimistas, cae por debajo de uno: podríamos ser la única civilización de la galaxia. Ambos resultados salen de la misma ecuación.</p>
<p>La razón es que varios términos son desconocidos en factores de diez, cien o más. Multiplicar números inciertos no promedia la incertidumbre: la acumula. Un error habitual consiste en tomar el centro de cada rango plausible, multiplicar y presentar el resultado como <em>la</em> estimación. Ese número no tiene ningún estatus especial.</p>
<p>Un artículo de 2018 de Anders Sandberg, Eric Drexler y Toby Ord lo dejó claro. Usando distribuciones de probabilidad amplias y honestas en lugar de valores únicos, encontraron que la incertidumbre de N es tan grande que una probabilidad sustancial de estar solos es perfectamente compatible con los datos. La galaxia puede estar vacía y la ecuación seguir siendo correcta.</p>
<p>Referencia: <a href="https://arxiv.org/abs/1806.02404" target="_blank" rel="noopener noreferrer">Sandberg, Drexler y Ord, «Dissolving the Fermi Paradox» (2018)</a>.</p>`
                },
                {
                    id: 'misconceptions',
                    heading: 'Cuatro malentendidos frecuentes',
                    body: `
<ul>
    <li><strong>«Demuestra que existen extraterrestres».</strong> No. Es un marco de trabajo; se puede rellenar con valores que dan N &lt; 1.</li>
    <li><strong>«Cuenta todas las civilizaciones que han existido».</strong> Cuenta las que son detectables a la vez que nosotros. Una civilización que duró mil años hace dos mil millones de años no aporta nada a N hoy.</li>
    <li><strong>«Es una ley científica».</strong> Es una definición más un conjunto de estimaciones. La ecuación en sí no se puede falsar; sus términos individuales sí se pueden medir.</li>
    <li><strong>«Un N grande significa que deberíamos haber oído algo».</strong> Ese es un argumento distinto —<a href="{{article:fermi}}">la paradoja de Fermi</a>— y depende de cuánto duran las civilizaciones y hasta dónde se expanden.</li>
</ul>`
                },
                {
                    id: 'today',
                    heading: 'Qué está cambiando la estimación ahora',
                    body: `
<p>Dos de los siete términos han pasado de la filosofía a la medición. <strong>f<sub>p</sub></strong> está ya cerca de 1: los planetas son el resultado normal de la formación estelar, no una excepción. <strong>n<sub>e</sub></strong> se está atacando con censos que cuentan planetas rocosos pequeños en <a href="{{article:zone}}">la zona habitable</a> alrededor de estrellas cercanas.</p>
<p>Los términos difíciles son los biológicos. La espectroscopia de transmisión de atmósferas de exoplanetas puede, en principio, detectar oxígeno, metano u otros gases difíciles de explicar sin vida. Eso no resolvería <strong>f<sub>i</sub></strong> ni <strong>f<sub>c</sub></strong>, pero daría a <strong>f<sub>l</sub></strong> su primer dato real.</p>
<p>Mientras tanto, <a href="{{article:seti}}">SETI</a> ha dejado atrás la época de una sola antena: los estudios modernos rastrean miles de millones de frecuencias en millones de estrellas, y la búsqueda de tecnofirmas incluye láseres, calor residual y contaminación industrial. Nada de esto ha producido una detección confirmada. Ese silencio es en sí un resultado, aunque muy difícil de interpretar.</p>`
                }
            ],
            faq: [
                {
                    q: '¿Quién creó la Ecuación de Drake?',
                    a: 'Frank Drake la escribió en 1961 como orden del día de la primera conferencia sobre la búsqueda de inteligencia extraterrestre, celebrada en Green Bank, Virginia Occidental.'
                },
                {
                    q: '¿La Ecuación de Drake demuestra que existen extraterrestres?',
                    a: 'No. Es una forma de organizar estimaciones. Según los valores que se usen, puede dar una galaxia llena de civilizaciones o un número inferior a uno.'
                },
                {
                    q: '¿Qué significa exactamente N?',
                    a: 'N es el número de civilizaciones de la Vía Láctea que son comunicativas y detectables al mismo tiempo que nosotros. No es el total de las que han existido.'
                },
                {
                    q: '¿Cuál es el término más incierto?',
                    a: 'Los términos biológicos y sociológicos: f_l, f_i, f_c y L. La astronomía puede acotar los tres primeros; el resto depende hoy de razonamientos más que de datos.'
                }
            ]
        }
    },
    {
        id: 'fermi',
        slugs: { en: 'fermi-paradox', es: 'paradoja-de-fermi' },
        en: {
            short: 'Fermi Paradox',
            title: 'The Fermi Paradox: Where Is Everybody?',
            description: 'The Fermi Paradox explained: why a galaxy of hundreds of billions of stars looks silent, what the Great Filter means, and which solutions hold up.',
            eyebrow: 'Explainer',
            h1: 'The Fermi Paradox',
            lead: 'The galaxy is old, enormous, and full of planets. If even a modest fraction of them host civilizations, the silence is the strangest fact in astronomy.',
            readingTime: 8,
            sections: [
                {
                    id: 'origins',
                    heading: 'A question over lunch',
                    body: `
<p>In the summer of 1950, Enrico Fermi was at Los Alamos with Edward Teller, Emil Konopinski and Herbert York. The conversation drifted from flying saucers to faster-than-light travel, and then to lunch. According to the often-told account, Fermi looked up mid-meal and asked: “Where is everybody?”</p>
<p>The line became famous, but it is not a formal theorem. It is a tension between two statements that both feel reasonable: the galaxy should contain many civilizations, and we see no sign of any.</p>
<p>The name “Fermi paradox” came later. The argument itself is simple enough to state in a paragraph, which is part of why it has resisted a clean answer for more than seventy years.</p>`
                },
                {
                    id: 'scale',
                    heading: 'The scale that makes the silence uncomfortable',
                    body: `
<p>The Milky Way contains roughly 100 to 400 billion stars and is about 13 billion years old. Earth is 4.6 billion years old, so there has been a very long window for other civilizations to appear, expand, and leave traces.</p>
<p>Interstellar travel is slow but not impossibly slow. A civilization crossing the galaxy at one percent of the speed of light would need on the order of ten million years — long by human standards, but a small fraction of the galaxy's age. If expansion is even occasionally successful, the timescale problem disappears.</p>
<p>Planets are not the bottleneck either. More than five thousand exoplanets have been confirmed, and the Kepler mission showed that small rocky planets are common. The question is no longer whether there are places to live. It is why nobody seems to be home.</p>`
                },
                {
                    id: 'filter',
                    heading: 'The Great Filter',
                    body: `
<p>In 1998 the economist Robin Hanson gave the tension a useful shape. Somewhere between a cloud of hydrogen and a star-spanning civilization there is a step that is extremely improbable. He called it the Great Filter.</p>
<p>The filter can sit behind us or ahead of us. If it is behind us — the origin of life, the evolution of complex cells, the emergence of intelligence — then life may be extraordinarily rare and we are an unlikely exception. If it is ahead of us, then civilizations tend to hit a wall: war, climate collapse, resource exhaustion, or something we have not imagined.</p>
<p>Our own existence is a constraint. We are evidence that the filter, wherever it is, is not absolutely impossible. That is about as far as the argument gets without more data.</p>
<p>Reference: <a href="https://mason.gmu.edu/~rhanson/greatfilter.html" target="_blank" rel="noopener noreferrer">Robin Hanson, “The Great Filter” (1998)</a>.</p>`
                },
                {
                    id: 'solutions',
                    heading: 'The usual suspects',
                    body: `
<p>Proposed answers tend to fall into a few families. None has been demonstrated, and several are compatible with each other.</p>
<ul>
    <li><strong>Life is rare.</strong> The jump from chemistry to biology may be so unlikely that Earth is one of very few inhabited worlds.</li>
    <li><strong>Intelligence is rare.</strong> Life may be common while technological species are not; evolution has no target.</li>
    <li><strong>Civilizations are short-lived.</strong> The term L in <a href="{{article:drake}}">the Drake Equation</a> may be small. A civilization that broadcasts for a few centuries is easy to miss.</li>
    <li><strong>They stay quiet or stay home.</strong> Expansion may be unattractive, or deliberate silence may be a strategy — the “dark forest” idea.</li>
    <li><strong>We are early.</strong> The galaxy still has billions of years ahead. Perhaps the first civilizations are only appearing now.</li>
    <li><strong>We are looking badly.</strong> Our searches cover a tiny fraction of stars, frequencies and time. Absence of a detection is not absence of civilizations.</li>
</ul>`
                },
                {
                    id: 'evidence',
                    heading: 'What the evidence actually says',
                    body: `
<p>There is no confirmed technosignature. No radio signal, laser pulse, artefact or atmospheric pollutant has survived verification as evidence of another civilization. That is the honest summary.</p>
<p>It is also a very weak summary, because the search has been small. SETI instruments have examined a tiny sample of the galaxy's stars across a limited range of frequencies, and only for short periods. A negative result constrains a thin slice of the possible parameter space.</p>
<p>Meanwhile the positive evidence is everywhere: planets are common, organic molecules are common, and the building blocks of life are not rare. The paradox lives precisely in the gap between “ingredients are everywhere” and “we have found nobody.”</p>`
                },
                {
                    id: 'dissolving',
                    heading: 'Maybe the paradox is dissolving',
                    body: `
<p>The paradox assumes that a large N should produce visible neighbours. That assumption depends on crude point estimates. When Sandberg, Drexler and Ord treated the uncertainties properly in 2018, the expected number of civilizations dropped sharply, and a substantial probability of being alone remained consistent with the data.</p>
<p>That does not prove we are alone. It does mean the silence is not automatically a crisis for <a href="{{article:drake}}">the Drake Equation</a>. A galaxy can be full of life and still empty of company, if the distances are large and the lifetimes short.</p>
<p>The most defensible position today is uncomfortable: we do not know, and the next generation of instruments — atmospheric biosignatures, wider radio surveys, better statistics on habitable planets — is the first that can genuinely change the answer.</p>`
                }
            ],
            faq: [
                {
                    q: 'What is the Fermi Paradox in one sentence?',
                    a: 'The apparent contradiction between the high probability of other civilizations and the complete absence of evidence for them.'
                },
                {
                    q: 'Did Fermi actually say “Where is everybody?”',
                    a: 'The question is reported by his lunch companions at Los Alamos in 1950. The exact wording is second-hand, but the substance is well attested.'
                },
                {
                    q: 'What is the Great Filter?',
                    a: 'A hypothetical step in the history of life that is so improbable it explains why the galaxy appears empty. It could lie behind us or ahead of us.'
                },
                {
                    q: 'Has SETI found anything?',
                    a: 'No confirmed detection. There have been interesting candidates, but none has survived independent verification.'
                }
            ]
        },
        es: {
            short: 'Paradoja de Fermi',
            title: 'La paradoja de Fermi: ¿dónde está todo el mundo?',
            description: 'La paradoja de Fermi explicada: por qué una galaxia con cientos de miles de millones de estrellas parece silenciosa, qué es el Gran Filtro y qué soluciones se sostienen.',
            eyebrow: 'Guía',
            h1: 'La paradoja de Fermi',
            lead: 'La galaxia es vieja, enorme y está llena de planetas. Si aunque sea una fracción modesta alberga civilizaciones, el silencio es el hecho más extraño de la astronomía.',
            readingTime: 8,
            sections: [
                {
                    id: 'origins',
                    heading: 'Una pregunta durante la comida',
                    body: `
<p>En el verano de 1950, Enrico Fermi estaba en Los Álamos con Edward Teller, Emil Konopinski y Herbert York. La conversación pasó de los platillos volantes a los viajes más rápidos que la luz y, después, a la comida. Según el relato que se repite, Fermi levantó la vista a mitad de la comida y preguntó: «¿Dónde está todo el mundo?».</p>
<p>La frase se hizo famosa, pero no es un teorema formal. Es la tensión entre dos afirmaciones que parecen razonables: la galaxia debería contener muchas civilizaciones, y no vemos ninguna señal de ellas.</p>
<p>El nombre «paradoja de Fermi» llegó después. El argumento se puede resumir en un párrafo, y quizá por eso ha resistido más de setenta años sin una respuesta limpia.</p>`
                },
                {
                    id: 'scale',
                    heading: 'La escala que hace incómodo el silencio',
                    body: `
<p>La Vía Láctea contiene entre unos 100 y 400 mil millones de estrellas y tiene unos 13 mil millones de años. La Tierra tiene 4.600 millones de años, así que ha habido muchísimo tiempo para que otras civilizaciones aparezcan, se expandan y dejen rastros.</p>
<p>Viajar entre estrellas es lento, pero no imposiblemente lento. Una civilización que cruzara la galaxia al uno por ciento de la velocidad de la luz tardaría del orden de diez millones de años: mucho para nosotros, pero una fracción pequeña de la edad galáctica. Si la expansión funciona aunque sea de vez en cuando, el problema del tiempo desaparece.</p>
<p>Los planetas tampoco son el cuello de botella. Se han confirmado más de cinco mil exoplanetas y la misión Kepler demostró que los planetas rocosos pequeños son comunes. La pregunta ya no es si hay lugares donde vivir. Es por qué nadie parece estar en casa.</p>`
                },
                {
                    id: 'filter',
                    heading: 'El Gran Filtro',
                    body: `
<p>En 1998 el economista Robin Hanson dio una forma útil a la tensión. En algún punto entre una nube de hidrógeno y una civilización que abarca estrellas hay un paso extremadamente improbable. Lo llamó el Gran Filtro.</p>
<p>El filtro puede estar detrás de nosotros o delante. Si está detrás —el origen de la vida, la evolución de células complejas, la aparición de la inteligencia—, la vida puede ser extraordinariamente rara y nosotros una excepción improbable. Si está delante, las civilizaciones tienden a chocar con un muro: guerra, colapso climático, agotamiento de recursos o algo que no hemos imaginado.</p>
<p>Nuestra propia existencia es una restricción. Somos prueba de que el filtro, dondequiera que esté, no es absolutamente imposible. Hasta ahí llega el argumento sin más datos.</p>
<p>Referencia: <a href="https://mason.gmu.edu/~rhanson/greatfilter.html" target="_blank" rel="noopener noreferrer">Robin Hanson, «The Great Filter» (1998)</a>.</p>`
                },
                {
                    id: 'solutions',
                    heading: 'Los sospechosos habituales',
                    body: `
<p>Las respuestas propuestas suelen agruparse en unas pocas familias. Ninguna está demostrada y varias son compatibles entre sí.</p>
<ul>
    <li><strong>La vida es rara.</strong> El salto de la química a la biología puede ser tan improbable que la Tierra sea uno de los poquísimos mundos habitados.</li>
    <li><strong>La inteligencia es rara.</strong> La vida puede ser común sin que lo sean las especies tecnológicas; la evolución no tiene un objetivo.</li>
    <li><strong>Las civilizaciones duran poco.</strong> El término L de <a href="{{article:drake}}">la Ecuación de Drake</a> puede ser pequeño. Una civilización que emite durante unos siglos es fácil de pasar por alto.</li>
    <li><strong>Se callan o se quedan en casa.</strong> Expandirse puede no ser atractivo, o el silencio deliberado puede ser una estrategia: la idea del «bosque oscuro».</li>
    <li><strong>Llegamos pronto.</strong> A la galaxia le quedan miles de millones de años. Quizá las primeras civilizaciones estén apareciendo ahora.</li>
    <li><strong>Estamos buscando mal.</strong> Nuestros rastreos cubren una fracción mínima de estrellas, frecuencias y tiempo. No detectar nada no es lo mismo que no haber nada.</li>
</ul>`
                },
                {
                    id: 'evidence',
                    heading: 'Qué dicen realmente las pruebas',
                    body: `
<p>No hay ninguna tecnofirma confirmada. Ninguna señal de radio, pulso láser, artefacto o contaminante atmosférico ha superado la verificación como prueba de otra civilización. Ese es el resumen honesto.</p>
<p>También es un resumen muy débil, porque la búsqueda ha sido pequeña. Los instrumentos de SETI han examinado una muestra mínima de las estrellas de la galaxia, en un rango limitado de frecuencias y durante periodos cortos. Un resultado negativo acota una franja fina del espacio de posibilidades.</p>
<p>Mientras tanto, las pruebas positivas están por todas partes: los planetas son comunes, las moléculas orgánicas son comunes y los ingredientes de la vida no son raros. La paradoja vive justo en la grieta entre «los ingredientes están por todas partes» y «no hemos encontrado a nadie».</p>`
                },
                {
                    id: 'dissolving',
                    heading: 'Quizá la paradoja se está disolviendo',
                    body: `
<p>La paradoja supone que un N grande debería producir vecinos visibles. Esa suposición depende de estimaciones puntuales toscas. Cuando Sandberg, Drexler y Ord trataron las incertidumbres correctamente en 2018, el número esperado de civilizaciones cayó en picado y una probabilidad sustancial de estar solos siguió siendo compatible con los datos.</p>
<p>Eso no demuestra que estemos solos. Significa que el silencio no es automáticamente una crisis para <a href="{{article:drake}}">la Ecuación de Drake</a>. Una galaxia puede estar llena de vida y vacía de compañía si las distancias son grandes y las vidas cortas.</p>
<p>La postura más defendible hoy es incómoda: no lo sabemos, y la próxima generación de instrumentos —biofirmas atmosféricas, rastreos de radio más amplios, mejores estadísticas de planetas habitables— es la primera que puede cambiar de verdad la respuesta.</p>`
                }
            ],
            faq: [
                {
                    q: '¿Qué es la paradoja de Fermi en una frase?',
                    a: 'La contradicción aparente entre la alta probabilidad de que existan otras civilizaciones y la ausencia total de pruebas de ellas.'
                },
                {
                    q: '¿Fermi dijo de verdad «¿Dónde está todo el mundo?»?',
                    a: 'La pregunta la transmiten sus compañeros de comida en Los Álamos en 1950. La redacción exacta es de segunda mano, pero el fondo está bien documentado.'
                },
                {
                    q: '¿Qué es el Gran Filtro?',
                    a: 'Un paso hipotético en la historia de la vida tan improbable que explicaría por qué la galaxia parece vacía. Puede estar detrás de nosotros o delante.'
                },
                {
                    q: '¿Ha encontrado algo SETI?',
                    a: 'Ninguna detección confirmada. Ha habido candidatos interesantes, pero ninguno ha superado la verificación independiente.'
                }
            ]
        }
    },
    {
        id: 'zone',
        slugs: { en: 'habitable-zone', es: 'zona-habitable' },
        en: {
            short: 'Habitable Zone',
            title: 'The Habitable Zone: Where Liquid Water Can Exist',
            description: 'What the habitable zone really means, how astronomers define its inner and outer edges, and why a planet in the zone is only a candidate for life.',
            eyebrow: 'Explainer',
            h1: 'The Habitable Zone',
            lead: 'It is the strip around a star where a rocky planet could keep liquid water on its surface. It is a useful first filter — and a poor guarantee.',
            readingTime: 7,
            sections: [
                {
                    id: 'definition',
                    heading: 'A definition built on water',
                    body: `
<p>The habitable zone is the region around a star where a planet with a suitable atmosphere could maintain liquid water on its surface. For the Sun, that region includes Earth — which is the only reason the concept feels obvious.</p>
<p>The definition is about energy, not life. A planet receives a certain flux of starlight per square metre. Too much and the surface overheats; too little and water freezes. The zone is the band in between.</p>
<p>Notice how many qualifiers are packed into that sentence: <em>rocky</em>, <em>suitable atmosphere</em>, <em>surface</em>. Each one hides a physical assumption, and each one can fail.</p>`
                },
                {
                    id: 'edges',
                    heading: 'Where the edges are',
                    body: `
<p>Astronomers estimate the inner edge using the runaway greenhouse limit: the point where a warm planet's oceans evaporate, water vapour traps more heat, and the process accelerates until the surface is sterilised. Venus is the local warning.</p>
<p>The outer edge is usually set by the maximum greenhouse effect: the distance at which even a thick CO<sub>2</sub> atmosphere cannot keep the surface above freezing. Mars, at the edge of the Sun's zone, is the nearby example of a world that lost most of its atmosphere and its surface water.</p>
<p>A widely used 2013 model by Ravi Kopparapu and colleagues puts the Sun's conservative habitable zone at roughly 0.95 to 1.7 astronomical units, with an optimistic version extending further. The exact numbers move when assumptions about clouds, albedo and atmospheric mass change.</p>
<p>Reference: <a href="https://arxiv.org/abs/1301.6674" target="_blank" rel="noopener noreferrer">Kopparapu et al., “Habitable Zones Around Main-Sequence Stars” (2013)</a>.</p>`
                },
                {
                    id: 'stars',
                    heading: 'Not every star is the Sun',
                    body: `
<p>The zone's distance scales with the star's luminosity. Around a cool red dwarf, it sits very close in; around a hot, massive star, it lies far out. That changes the physics in ways a simple diagram hides.</p>
<p>Red dwarfs are the most common stars in the galaxy and live for trillions of years, which sounds ideal. But their habitable zones are so close that planets are likely tidally locked, with one permanent day side and one permanent night side. They also flare violently in their youth, which can strip atmospheres.</p>
<p>Orange K-type stars are often treated as the most promising compromise: longer lives than the Sun, calmer than red dwarfs, and a zone far enough out for a planet to rotate freely. None of this makes life likely. It only makes a planet less obviously hostile.</p>`
                },
                {
                    id: 'beyond',
                    heading: 'A planet is more than its orbit',
                    body: `
<p>Being in the zone is a statement about starlight, not about habitability. A planet also needs an atmosphere, a way to keep it, and the right chemistry.</p>
<ul>
    <li><strong>Atmosphere and greenhouse.</strong> Without an atmosphere, even Earth's surface would swing between extremes. With the wrong one, Venus happens.</li>
    <li><strong>Magnetic field.</strong> A strong field can deflect stellar wind, though the protection it provides is debated for slowly rotating planets.</li>
    <li><strong>Geology.</strong> Plate tectonics and volcanism recycle carbon and stabilise climate over long periods, at least on Earth.</li>
    <li><strong>Water delivery.</strong> Water may arrive with impacts from icy bodies; a planet that forms dry may stay dry.</li>
    <li><strong>Moons and tides.</strong> Large moons stabilise axial tilt and drive tides, though neither is proven necessary.</li>
</ul>
<p>Subsurface oceans complicate the picture further. Europa and Enceladus are far outside the classical zone, yet both probably hold liquid water beneath ice. The definition assumes a surface biosphere because that is what we can detect.</p>`
                },
                {
                    id: 'equation',
                    heading: 'The equation hiding inside the term',
                    body: `
<p>In <a href="{{article:drake}}">the Drake Equation</a>, the term <strong>n<sub>e</sub></strong> is often described as the number of habitable planets per system. In practice, many estimates quietly replace “habitable” with “in the habitable zone.” Those are not the same thing.</p>
<p>A planet in the zone is a <em>candidate</em>. Whether it is actually habitable depends on the atmosphere, geology and history we usually cannot see. Whether it is inhabited is a further step, and that is what <strong>f<sub>l</sub></strong> is supposed to capture.</p>
<p>Confusing the two inflates N. It is one of the most common quiet errors in popular Drake Equation calculations.</p>`
                },
                {
                    id: 'detection',
                    heading: 'How we actually study them',
                    body: `
<p>Most known exoplanets were found by the transit method: a planet crosses its star and dims it by a tiny, periodic amount. The radial-velocity method detects the star's wobble. Direct imaging works for young, wide-orbit planets.</p>
<p>The next step is atmospheres. When a planet transits, a sliver of starlight passes through its atmosphere, and the resulting spectrum can reveal molecules. The James Webb Space Telescope has made this routine for a handful of small planets, and future instruments will target more.</p>
<p>A convincing biosignature would be a gas or combination of gases that is hard to explain without life — oxygen with methane, for example. Even then, the result would be a strong inference, not a photograph of a tree.</p>`
                }
            ],
            faq: [
                {
                    q: 'What is the habitable zone?',
                    a: 'The region around a star where a rocky planet with a suitable atmosphere could keep liquid water on its surface.'
                },
                {
                    q: 'Is a planet in the habitable zone necessarily habitable?',
                    a: 'No. The zone is defined by starlight. Atmosphere, geology, magnetic field and water history can make a planet in the zone uninhabitable, or a planet outside it habitable beneath ice.'
                },
                {
                    q: 'Why is the habitable zone important for the Drake Equation?',
                    a: 'It is the practical way astronomers estimate the term ne, the number of planets per system that could support life. It is a candidate count, not a life count.'
                },
                {
                    q: 'Could life exist outside the habitable zone?',
                    a: 'Yes. Subsurface oceans on icy moons are the obvious example. The classical zone assumes surface life, which is easier to detect remotely.'
                }
            ]
        },
        es: {
            short: 'Zona habitable',
            title: 'La zona habitable: dónde puede existir agua líquida',
            description: 'Qué significa realmente la zona habitable, cómo se definen sus bordes interior y exterior y por qué un planeta en la zona es solo un candidato a albergar vida.',
            eyebrow: 'Guía',
            h1: 'La zona habitable',
            lead: 'Es la franja alrededor de una estrella donde un planeta rocoso podría mantener agua líquida en su superficie. Es un buen primer filtro y una mala garantía.',
            readingTime: 7,
            sections: [
                {
                    id: 'definition',
                    heading: 'Una definición construida sobre el agua',
                    body: `
<p>La zona habitable es la región alrededor de una estrella donde un planeta con una atmósfera adecuada podría mantener agua líquida en su superficie. En el caso del Sol, esa región incluye la Tierra, que es la única razón por la que el concepto parece obvio.</p>
<p>La definición habla de energía, no de vida. Un planeta recibe un flujo determinado de luz estelar por metro cuadrado. Si es demasiado, la superficie se sobrecalienta; si es demasiado poco, el agua se congela. La zona es la banda intermedia.</p>
<p>Fíjate en cuántos matices hay en esa frase: <em>rocoso</em>, <em>atmósfera adecuada</em>, <em>superficie</em>. Cada uno esconde una suposición física, y cada uno puede fallar.</p>`
                },
                {
                    id: 'edges',
                    heading: 'Dónde están los bordes',
                    body: `
<p>Los astrónomos estiman el borde interior con el límite del invernadero desbocado: el punto en que los océanos de un planeta templado se evaporan, el vapor de agua retiene más calor y el proceso se acelera hasta esterilizar la superficie. Venus es el aviso cercano.</p>
<p>El borde exterior se fija normalmente con el máximo efecto invernadero: la distancia a la que ni siquiera una atmósfera densa de CO<sub>2</sub> puede mantener la superficie por encima del punto de congelación. Marte, en el borde de la zona solar, es el ejemplo cercano de un mundo que perdió casi toda su atmósfera y su agua superficial.</p>
<p>Un modelo muy citado de 2013 de Ravi Kopparapu y colaboradores sitúa la zona habitable conservadora del Sol aproximadamente entre 0,95 y 1,7 unidades astronómicas, con una versión optimista que se extiende más allá. Las cifras exactas cambian cuando se modifican las suposiciones sobre nubes, albedo y masa atmosférica.</p>
<p>Referencia: <a href="https://arxiv.org/abs/1301.6674" target="_blank" rel="noopener noreferrer">Kopparapu et al., «Habitable Zones Around Main-Sequence Stars» (2013)</a>.</p>`
                },
                {
                    id: 'stars',
                    heading: 'No todas las estrellas son el Sol',
                    body: `
<p>La distancia de la zona escala con la luminosidad de la estrella. Alrededor de una enana roja fría está muy cerca; alrededor de una estrella caliente y masiva, muy lejos. Eso cambia la física de formas que un diagrama simple oculta.</p>
<p>Las enanas rojas son las estrellas más comunes de la galaxia y viven billones de años, lo que suena ideal. Pero su zona habitable está tan cerca que los planetas probablemente estén anclados por marea, con un lado siempre de día y otro siempre de noche. Además, en su juventud producen erupciones violentas que pueden arrasar atmósferas.</p>
<p>Las estrellas naranjas de tipo K se consideran a menudo el compromiso más prometedor: viven más que el Sol, son más tranquilas que las enanas rojas y su zona está lo bastante lejos para que un planeta rote libremente. Nada de esto hace probable la vida. Solo hace que un planeta sea menos obviamente hostil.</p>`
                },
                {
                    id: 'beyond',
                    heading: 'Un planeta es más que su órbita',
                    body: `
<p>Estar en la zona es una afirmación sobre la luz estelar, no sobre la habitabilidad. Un planeta también necesita atmósfera, una forma de conservarla y la química adecuada.</p>
<ul>
    <li><strong>Atmósfera e invernadero.</strong> Sin atmósfera, incluso la superficie terrestre oscilaría entre extremos. Con la incorrecta, aparece Venus.</li>
    <li><strong>Campo magnético.</strong> Un campo fuerte puede desviar el viento estelar, aunque la protección que ofrece a planetas de rotación lenta se discute.</li>
    <li><strong>Geología.</strong> La tectónica de placas y el vulcanismo reciclan carbono y estabilizan el clima durante periodos largos, al menos en la Tierra.</li>
    <li><strong>Llegada del agua.</strong> El agua puede llegar con impactos de cuerpos helados; un planeta que se forma seco puede quedarse seco.</li>
    <li><strong>Lunas y mareas.</strong> Las lunas grandes estabilizan la inclinación del eje y generan mareas, aunque no se ha demostrado que sean imprescindibles.</li>
</ul>
<p>Los océanos subterráneos complican aún más el cuadro. Europa y Encélado están muy fuera de la zona clásica, pero ambos probablemente guardan agua líquida bajo el hielo. La definición supone una biosfera de superficie porque es lo que podemos detectar.</p>`
                },
                {
                    id: 'equation',
                    heading: 'La ecuación escondida dentro del término',
                    body: `
<p>En <a href="{{article:drake}}">la Ecuación de Drake</a>, el término <strong>n<sub>e</sub></strong> se describe a menudo como el número de planetas habitables por sistema. En la práctica, muchas estimaciones sustituyen en silencio «habitable» por «en la zona habitable». No son lo mismo.</p>
<p>Un planeta en la zona es un <em>candidato</em>. Que sea realmente habitable depende de la atmósfera, la geología y la historia que normalmente no podemos ver. Que esté habitado es un paso más, y eso es lo que se supone que captura <strong>f<sub>l</sub></strong>.</p>
<p>Confundir ambas cosas infla N. Es uno de los errores silenciosos más frecuentes en los cálculos divulgativos de la Ecuación de Drake.</p>`
                },
                {
                    id: 'detection',
                    heading: 'Cómo los estudiamos de verdad',
                    body: `
<p>La mayoría de los exoplanetas conocidos se descubrieron por el método de tránsito: un planeta cruza su estrella y la atenúa una cantidad minúscula y periódica. El método de velocidad radial detecta el bamboleo de la estrella. La imagen directa funciona con planetas jóvenes de órbitas amplias.</p>
<p>El siguiente paso son las atmósferas. Cuando un planeta transita, una hebra de luz estelar atraviesa su atmósfera y el espectro resultante puede revelar moléculas. El telescopio James Webb ha hecho esto rutinario para un puñado de planetas pequeños, y los instrumentos futuros apuntarán a más.</p>
<p>Una biofirma convincente sería un gas o una combinación de gases difícil de explicar sin vida: oxígeno con metano, por ejemplo. Incluso entonces, el resultado sería una inferencia fuerte, no una fotografía de un árbol.</p>`
                }
            ],
            faq: [
                {
                    q: '¿Qué es la zona habitable?',
                    a: 'La región alrededor de una estrella donde un planeta rocoso con una atmósfera adecuada podría mantener agua líquida en su superficie.'
                },
                {
                    q: '¿Un planeta en la zona habitable es necesariamente habitable?',
                    a: 'No. La zona se define por la luz estelar. La atmósfera, la geología, el campo magnético y la historia del agua pueden hacer inhabitable un planeta en la zona, o habitable uno fuera de ella bajo el hielo.'
                },
                {
                    q: '¿Por qué es importante la zona habitable para la Ecuación de Drake?',
                    a: 'Es la forma práctica en que los astrónomos estiman el término ne, el número de planetas por sistema que podrían albergar vida. Es un recuento de candidatos, no de vida.'
                },
                {
                    q: '¿Puede existir vida fuera de la zona habitable?',
                    a: 'Sí. Los océanos subterráneos de lunas heladas son el ejemplo obvio. La zona clásica supone vida en superficie, que es más fácil de detectar a distancia.'
                }
            ]
        }
    },
    {
        id: 'seti',
        slugs: { en: 'seti-technosignatures', es: 'seti-y-tecnofirmas' },
        en: {
            short: 'SETI',
            title: 'SETI and Technosignatures: How We Search for Aliens',
            description: 'How SETI actually works: radio and optical searches, technosignatures such as Dyson swarms, and what the silence does and does not mean.',
            eyebrow: 'Explainer',
            h1: 'SETI and Technosignatures',
            lead: 'SETI is not a telescope pointed at a maybe-planet. It is a set of experiments designed to detect technology we did not build — and it is harder than it sounds.',
            readingTime: 7,
            sections: [
                {
                    id: 'origins',
                    heading: 'The first listen',
                    body: `
<p>In 1960, Frank Drake pointed an 85-foot radio telescope at two nearby Sun-like stars, Tau Ceti and Epsilon Eridani. Project Ozma listened for a few hundred hours at a frequency near 1420 MHz, the famous 21-centimetre line of neutral hydrogen.</p>
<p>He heard nothing that survived scrutiny. But the experiment set the template: choose a plausible frequency, point at plausible stars, and look for a signal that nature does not produce.</p>
<p>In 1974, the Arecibo message was sent toward the globular cluster M13. That was a symbolic transmission, not a search, and it will take tens of thousands of years to arrive. Most SETI work is the opposite: listening.</p>`
                },
                {
                    id: 'radio',
                    heading: 'What radio SETI looks for',
                    body: `
<p>Natural radio sources are broadband: they spread energy across a wide range of frequencies. A technology is likely to be narrowband, concentrating power into a very thin channel. That difference is the core of the search.</p>
<p>SETI instruments scan millions of narrow channels at once and look for a signal that is strong, persistent, and shifted in frequency by the Doppler effect as the telescope or the planet moves. A candidate that appears in one observation but not in a follow-up is not a detection.</p>
<p>The “water hole” — roughly 1420 to 1720 MHz, between the hydrogen and hydroxyl lines — is a traditional target because it is relatively quiet and involves the two ingredients of water. It is a reasonable guess, not a law of nature.</p>`
                },
                {
                    id: 'techno',
                    heading: 'Technosignatures beyond radio',
                    body: `
<p>A technosignature is any observable consequence of technology. Radio is only one example, and the term now covers a much wider search space.</p>
<ul>
    <li><strong>Optical lasers.</strong> A sufficiently powerful laser could outshine a star for an instant, and dedicated instruments can look for those pulses.</li>
    <li><strong>Dyson structures.</strong> A civilization collecting a large fraction of its star's energy would produce excess infrared radiation or unusual transits.</li>
    <li><strong>Atmospheric pollution.</strong> Nitrogen dioxide, chlorofluorocarbons or other industrial gases could, in principle, be detected in an exoplanet atmosphere.</li>
    <li><strong>Artificial light and satellites.</strong> City lights or dense satellite constellations might show up in reflected-light curves, far beyond current sensitivity.</li>
    <li><strong>Probes and artefacts.</strong> A physical object in the Solar System or a nearby star system would count, though nothing has been confirmed.</li>
</ul>`
                },
                {
                    id: 'scale',
                    heading: 'How big is the search space',
                    body: `
<p>The Milky Way has hundreds of billions of stars. A radio search must choose frequencies, bandwidth, polarization, timing and targets. Every choice narrows the volume of space that has actually been examined.</p>
<p>Modern programmes such as Breakthrough Listen, the FAST telescope in China and MeerKAT in South Africa have increased survey speed enormously. The distributed computing project SETI@home analysed Arecibo data from 1999 until it stopped distributing work in 2020. Even so, the total searched fraction of the galaxy remains tiny.</p>
<p>This is the central asymmetry: the universe is vast, our instruments are small, and the signal we are looking for may last only a short time.</p>`
                },
                {
                    id: 'silence',
                    heading: 'Why silence is not proof',
                    body: `
<p>A non-detection is a statement about the sensitivity of a particular experiment, not about the galaxy. It rules out some combinations of transmitter power, distance, frequency and duration. It does not rule out civilizations.</p>
<p>The assumptions are also human. We listen at frequencies we find useful. We expect a signal designed to be detected. We assume a civilization is broadcasting during the same few decades we are listening. In <a href="{{article:drake}}">the Drake Equation</a>, that overlap is the term L.</p>
<p>A civilization could be quiet by choice, or noisy in a way we do not recognize. It could have moved to technologies we do not monitor. Silence is informative only when the search is broad enough to make it surprising — and so far, it is not.</p>`
                },
                {
                    id: 'protocol',
                    heading: 'If we detect something',
                    body: `
<p>A credible detection would require independent confirmation: a different telescope, a different observer, and a signal that cannot be explained by interference or a natural source. The International Academy of Astronautics maintains post-detection protocols for this scenario.</p>
<p>The protocols do not require secrecy. They call for verification, notification of the scientific community and the United Nations, and careful communication with the public. Nobody has agreed on who would reply, or whether replying is wise.</p>
<p>For now, the work is less cinematic: build bigger surveys, remove false positives, and keep listening. <a href="{{article:fermi}}">The Fermi paradox</a> is the question; SETI is the attempt to answer it with data instead of argument.</p>`
                }
            ],
            faq: [
                {
                    q: 'What does SETI stand for?',
                    a: 'Search for Extraterrestrial Intelligence. It is a field of astronomy that looks for evidence of technology, not for planets or microbes.'
                },
                {
                    q: 'What is a technosignature?',
                    a: 'Any observable sign of technology, such as a narrowband radio signal, a laser pulse, waste heat from a Dyson structure or industrial pollution in an atmosphere.'
                },
                {
                    q: 'Has SETI ever detected a signal?',
                    a: 'No confirmed detection. The famous “Wow!” signal of 1977 was never observed again and remains unexplained.'
                },
                {
                    q: 'Why not just send a message?',
                    a: 'Humanity has sent a few symbolic transmissions, but deliberate messaging is controversial: it is slow, and there is no agreed protocol for deciding what to say or whether to say anything.'
                }
            ]
        },
        es: {
            short: 'SETI',
            title: 'SETI y tecnofirmas: cómo buscamos extraterrestres',
            description: 'Cómo funciona SETI de verdad: búsquedas de radio y ópticas, tecnofirmas como las esferas de Dyson y qué significa —y qué no— el silencio.',
            eyebrow: 'Guía',
            h1: 'SETI y tecnofirmas',
            lead: 'SETI no es un telescopio apuntado a un planeta quizá habitable. Es un conjunto de experimentos diseñados para detectar tecnología que no construimos nosotros, y es más difícil de lo que parece.',
            readingTime: 7,
            sections: [
                {
                    id: 'origins',
                    heading: 'La primera escucha',
                    body: `
<p>En 1960, Frank Drake apuntó un radiotelescopio de 26 metros a dos estrellas cercanas parecidas al Sol, Tau Ceti y Épsilon Eridani. El proyecto Ozma escuchó durante unos cientos de horas en una frecuencia cercana a 1420 MHz, la famosa línea de 21 centímetros del hidrógeno neutro.</p>
<p>No oyó nada que superara el escrutinio. Pero el experimento fijó la plantilla: elegir una frecuencia plausible, apuntar a estrellas plausibles y buscar una señal que la naturaleza no produce.</p>
<p>En 1974 se envió el mensaje de Arecibo hacia el cúmulo globular M13. Fue una transmisión simbólica, no una búsqueda, y tardará decenas de miles de años en llegar. La mayor parte del trabajo de SETI es lo contrario: escuchar.</p>`
                },
                {
                    id: 'radio',
                    heading: 'Qué busca SETI en radio',
                    body: `
<p>Las fuentes naturales de radio son de banda ancha: reparten su energía en un rango amplio de frecuencias. Una tecnología probablemente sea de banda estrecha y concentre la potencia en un canal muy fino. Esa diferencia es el núcleo de la búsqueda.</p>
<p>Los instrumentos de SETI rastrean millones de canales estrechos a la vez y buscan una señal fuerte, persistente y desplazada en frecuencia por el efecto Doppler mientras se mueven el telescopio o el planeta. Un candidato que aparece en una observación pero no en la siguiente no es una detección.</p>
<p>El «agujero de agua» —aproximadamente entre 1420 y 1720 MHz, entre las líneas del hidrógeno y el hidroxilo— es un objetivo tradicional porque es relativamente silencioso e implica los dos ingredientes del agua. Es una apuesta razonable, no una ley de la naturaleza.</p>`
                },
                {
                    id: 'techno',
                    heading: 'Tecnofirmas más allá de la radio',
                    body: `
<p>Una tecnofirma es cualquier consecuencia observable de una tecnología. La radio es solo un ejemplo, y el término abarca hoy un espacio de búsqueda mucho más amplio.</p>
<ul>
    <li><strong>Láseres ópticos.</strong> Un láser suficientemente potente podría superar el brillo de una estrella durante un instante, y hay instrumentos dedicados a buscar esos pulsos.</li>
    <li><strong>Estructuras de Dyson.</strong> Una civilización que recolectara una fracción grande de la energía de su estrella produciría un exceso de radiación infrarroja o tránsitos extraños.</li>
    <li><strong>Contaminación atmosférica.</strong> El dióxido de nitrógeno, los clorofluorocarbonos u otros gases industriales podrían, en principio, detectarse en la atmósfera de un exoplaneta.</li>
    <li><strong>Luz artificial y satélites.</strong> Las luces de las ciudades o las constelaciones densas de satélites podrían aparecer en curvas de luz reflejada, muy por encima de la sensibilidad actual.</li>
    <li><strong>Sondas y artefactos.</strong> Un objeto físico en el sistema solar o en un sistema cercano contaría, aunque no se ha confirmado ninguno.</li>
</ul>`
                },
                {
                    id: 'scale',
                    heading: 'Qué tamaño tiene el espacio de búsqueda',
                    body: `
<p>La Vía Láctea tiene cientos de miles de millones de estrellas. Una búsqueda de radio debe elegir frecuencias, ancho de banda, polarización, tiempos y objetivos. Cada elección reduce el volumen de espacio que realmente se ha examinado.</p>
<p>Programas modernos como Breakthrough Listen, el telescopio FAST en China y MeerKAT en Sudáfrica han aumentado enormemente la velocidad de rastreo. El proyecto de computación distribuida SETI@home analizó datos de Arecibo desde 1999 hasta que dejó de repartir trabajo en 2020. Aun así, la fracción total de galaxia rastreada sigue siendo minúscula.</p>
<p>Esta es la asimetría central: el universo es enorme, nuestros instrumentos son pequeños y la señal que buscamos puede durar solo un instante.</p>`
                },
                {
                    id: 'silence',
                    heading: 'Por qué el silencio no es una prueba',
                    body: `
<p>Una no detección es una afirmación sobre la sensibilidad de un experimento concreto, no sobre la galaxia. Descarta algunas combinaciones de potencia del transmisor, distancia, frecuencia y duración. No descarta civilizaciones.</p>
<p>Las suposiciones también son humanas. Escuchamos en las frecuencias que nos resultan útiles. Esperamos una señal diseñada para ser detectada. Suponemos que una civilización emite durante las mismas décadas en que escuchamos nosotros. En <a href="{{article:drake}}">la Ecuación de Drake</a>, ese solapamiento es el término L.</p>
<p>Una civilización podría callar por elección, o hacer ruido de una forma que no reconocemos. Podría haberse pasado a tecnologías que no vigilamos. El silencio solo informa cuando la búsqueda es lo bastante amplia para resultar sorprendente, y hasta ahora no lo es.</p>`
                },
                {
                    id: 'protocol',
                    heading: 'Si detectamos algo',
                    body: `
<p>Una detección creíble requeriría confirmación independiente: otro telescopio, otro observador y una señal que no se pueda explicar por interferencias o por una fuente natural. La Academia Internacional de Astronáutica mantiene protocolos posteriores a la detección para este escenario.</p>
<p>Los protocolos no exigen secreto. Piden verificación, notificación a la comunidad científica y a Naciones Unidas, y una comunicación cuidadosa con el público. Nadie ha acordado quién respondería ni si responder es prudente.</p>
<p>Por ahora, el trabajo es menos cinematográfico: construir rastreos más grandes, eliminar falsos positivos y seguir escuchando. <a href="{{article:fermi}}">La paradoja de Fermi</a> es la pregunta; SETI es el intento de responderla con datos en lugar de con argumentos.</p>`
                }
            ],
            faq: [
                {
                    q: '¿Qué significa SETI?',
                    a: 'Search for Extraterrestrial Intelligence, la búsqueda de inteligencia extraterrestre. Es una rama de la astronomía que busca pruebas de tecnología, no planetas ni microbios.'
                },
                {
                    q: '¿Qué es una tecnofirma?',
                    a: 'Cualquier signo observable de tecnología, como una señal de radio de banda estrecha, un pulso láser, el calor residual de una estructura de Dyson o la contaminación industrial de una atmósfera.'
                },
                {
                    q: '¿Ha detectado SETI alguna señal?',
                    a: 'Ninguna detección confirmada. La famosa señal «Wow!» de 1977 no volvió a observarse y sigue sin explicación.'
                },
                {
                    q: '¿Por qué no enviamos directamente un mensaje?',
                    a: 'La humanidad ha enviado algunas transmisiones simbólicas, pero la mensajería deliberada es polémica: es lenta y no hay un protocolo acordado sobre qué decir ni sobre si conviene decirlo.'
                }
            ]
        }
    }
];
