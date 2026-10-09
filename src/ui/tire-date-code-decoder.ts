import { renderMetrics, resetStandardAnswer, setErrors, setSummary, syncStandardAnswer } from './standard-answer-helpers';
import { getPageLocale } from './page-locale';

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  it: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
  'pt-br': ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
  pl: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'],
  nl: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
} as const;

const TIRE_DATE_CODE_LABELS = {
  en: {
    formatError: 'Enter the last 4 digits of the DOT code (week and year), for example 2219.',
    weekRangeError: 'The first two digits should be a week number between 01 and 53.',
    futureYearError: 'That year is in the future — double-check the 4-digit code.',
    tooOldError: 'Codes before 2000 use a 3-digit format not covered by this decoder.',
    summaryError: 'Check the code to decode the manufacture date.',
    reset: 'Enter a 4-digit DOT date code.',
    guidanceDefault: 'Within a commonly cited service-life window; still confirm your tire manufacturer\'s specific guidance.',
    guidanceOver10: 'Beyond the 10-year mark many manufacturers cite as a maximum, regardless of tread depth.',
    guidanceOver6: 'Past 6 years old, many manufacturers recommend a qualified inspection at least once a year.',
    summary: (week: number, year: number, ageYears: string) => `Week ${week} of ${year} — about ${ageYears} years old.`,
    primary: (week: number, year: number) => `Week ${week}, ${year}`,
    approxAge: 'Approximate age',
    yearsOld: (ageYears: string) => `${ageYears} years`,
    dotCode: 'DOT code',
    manufactured: 'Manufactured',
    metricWeek: 'Manufacture week',
    metricYear: 'Manufacture year',
    metricMonth: 'Approximate manufacture month',
    metricAge: 'Approximate age today',
    metricGuidance: 'General guidance',
  },
  de: {
    formatError: 'Geben Sie die letzten 4 Ziffern des DOT-Codes ein (Woche und Jahr), zum Beispiel 2219.',
    weekRangeError: 'Die ersten beiden Ziffern sollten eine Kalenderwoche zwischen 01 und 53 sein.',
    futureYearError: 'Dieses Jahr liegt in der Zukunft — überprüfen Sie den 4-stelligen Code.',
    tooOldError: 'Codes vor 2000 verwenden ein 3-stelliges Format, das dieser Decoder nicht unterstützt.',
    summaryError: 'Überprüfen Sie den Code, um das Herstellungsdatum zu entschlüsseln.',
    reset: 'Geben Sie einen 4-stelligen DOT-Datumscode ein.',
    guidanceDefault: 'Innerhalb eines häufig genannten Nutzungszeitraums — prüfen Sie dennoch die spezifischen Angaben Ihres Reifenherstellers.',
    guidanceOver10: 'Jenseits der 10-Jahres-Marke, die viele Hersteller als Höchstgrenze nennen, unabhängig von der Profiltiefe.',
    guidanceOver6: 'Über 6 Jahre alt — viele Hersteller empfehlen mindestens einmal jährlich eine fachkundige Prüfung.',
    summary: (week: number, year: number, ageYears: string) => `Woche ${week} des Jahres ${year} — etwa ${ageYears} Jahre alt.`,
    primary: (week: number, year: number) => `Woche ${week}, ${year}`,
    approxAge: 'Ungefähres Alter',
    yearsOld: (ageYears: string) => `${ageYears} Jahre`,
    dotCode: 'DOT-Code',
    manufactured: 'Hergestellt',
    metricWeek: 'Herstellungswoche',
    metricYear: 'Herstellungsjahr',
    metricMonth: 'Ungefährer Herstellungsmonat',
    metricAge: 'Ungefähres Alter heute',
    metricGuidance: 'Allgemeine Empfehlung',
  },
  es: {
    formatError: 'Introduzca los últimos 4 dígitos del código DOT (semana y año), por ejemplo 2219.',
    weekRangeError: 'Los dos primeros dígitos deben ser un número de semana entre 01 y 53.',
    futureYearError: 'Ese año está en el futuro — compruebe el código de 4 dígitos.',
    tooOldError: 'Los códigos anteriores a 2000 usan un formato de 3 dígitos que este decodificador no admite.',
    summaryError: 'Revise el código para decodificar la fecha de fabricación.',
    reset: 'Introduzca un código de fecha DOT de 4 dígitos.',
    guidanceDefault: 'Dentro de un periodo de vida útil comúnmente citado; aun así, confirme la guía específica de su fabricante de neumáticos.',
    guidanceOver10: 'Más allá de los 10 años que muchos fabricantes citan como máximo, independientemente de la profundidad del dibujo.',
    guidanceOver6: 'Con más de 6 años, muchos fabricantes recomiendan una inspección cualificada al menos una vez al año.',
    summary: (week: number, year: number, ageYears: string) => `Semana ${week} de ${year} — unos ${ageYears} años de antigüedad.`,
    primary: (week: number, year: number) => `Semana ${week}, ${year}`,
    approxAge: 'Antigüedad aproximada',
    yearsOld: (ageYears: string) => `${ageYears} años`,
    dotCode: 'Código DOT',
    manufactured: 'Fabricado',
    metricWeek: 'Semana de fabricación',
    metricYear: 'Año de fabricación',
    metricMonth: 'Mes aproximado de fabricación',
    metricAge: 'Antigüedad aproximada actual',
    metricGuidance: 'Recomendación general',
  },
  fr: {
    formatError: 'Saisissez les 4 derniers chiffres du code DOT (semaine et année), par exemple 2219.',
    weekRangeError: 'Les deux premiers chiffres doivent être un numéro de semaine entre 01 et 53.',
    futureYearError: 'Cette année est dans le futur — vérifiez le code à 4 chiffres.',
    tooOldError: 'Les codes antérieurs à 2000 utilisent un format à 3 chiffres que ce décodeur ne prend pas en charge.',
    summaryError: 'Vérifiez le code pour décoder la date de fabrication.',
    reset: 'Saisissez un code date DOT à 4 chiffres.',
    guidanceDefault: 'Dans une durée de vie couramment citée ; vérifiez tout de même les recommandations propres au fabricant de vos pneus.',
    guidanceOver10: 'Au-delà des 10 ans que de nombreux fabricants citent comme maximum, quelle que soit la profondeur des sculptures.',
    guidanceOver6: 'Au-delà de 6 ans, de nombreux fabricants recommandent un contrôle par un professionnel au moins une fois par an.',
    summary: (week: number, year: number, ageYears: string) => `Semaine ${week} de ${year} — environ ${ageYears} ans.`,
    primary: (week: number, year: number) => `Semaine ${week}, ${year}`,
    approxAge: 'Âge approximatif',
    yearsOld: (ageYears: string) => `${ageYears} ans`,
    dotCode: 'Code DOT',
    manufactured: 'Fabriqué en',
    metricWeek: 'Semaine de fabrication',
    metricYear: 'Année de fabrication',
    metricMonth: 'Mois de fabrication approximatif',
    metricAge: 'Âge approximatif aujourd’hui',
    metricGuidance: 'Recommandation générale',
  },
  it: {
    formatError: 'Inserisci le ultime 4 cifre del codice DOT (settimana e anno), ad esempio 2219.',
    weekRangeError: 'Le prime due cifre devono indicare una settimana tra 01 e 53.',
    futureYearError: 'Quell’anno è nel futuro: ricontrolla il codice a 4 cifre.',
    tooOldError: 'I codici precedenti al 2000 usano un formato a 3 cifre che questo decodificatore non supporta.',
    summaryError: 'Controlla il codice per decodificare la data di produzione.',
    reset: 'Inserisci un codice data DOT a 4 cifre.',
    guidanceDefault: 'Entro una durata di vita comunemente indicata; verifica comunque le indicazioni specifiche del produttore dei tuoi pneumatici.',
    guidanceOver10: 'Oltre i 10 anni che molti produttori indicano come limite massimo, indipendentemente dalla profondità del battistrada.',
    guidanceOver6: 'Oltre i 6 anni, molti produttori consigliano un controllo da parte di un professionista almeno una volta l’anno.',
    summary: (week: number, year: number, ageYears: string) => `Settimana ${week} del ${year} — circa ${ageYears} anni.`,
    primary: (week: number, year: number) => `Settimana ${week}, ${year}`,
    approxAge: 'Età approssimativa',
    yearsOld: (ageYears: string) => `${ageYears} anni`,
    dotCode: 'Codice DOT',
    manufactured: 'Prodotto',
    metricWeek: 'Settimana di produzione',
    metricYear: 'Anno di produzione',
    metricMonth: 'Mese di produzione approssimativo',
    metricAge: 'Età approssimativa oggi',
    metricGuidance: 'Indicazione generale',
  },
  'pt-br': {
    formatError: 'Digite os últimos 4 dígitos do código DOT (semana e ano), por exemplo 2219.',
    weekRangeError: 'Os dois primeiros dígitos devem ser um número de semana entre 01 e 53.',
    futureYearError: 'Esse ano está no futuro — confira o código de 4 dígitos.',
    tooOldError: 'Códigos anteriores a 2000 usam um formato de 3 dígitos que este decodificador não suporta.',
    summaryError: 'Confira o código para decodificar a data de fabricação.',
    reset: 'Digite um código de data DOT de 4 dígitos.',
    guidanceDefault: 'Dentro de um prazo de vida útil bastante citado; mesmo assim, confirme a orientação específica do fabricante do seu pneu.',
    guidanceOver10: 'Além dos 10 anos que muitos fabricantes indicam como limite máximo, independentemente da profundidade dos sulcos.',
    guidanceOver6: 'Com mais de 6 anos, muitos fabricantes recomendam uma inspeção profissional pelo menos uma vez por ano.',
    summary: (week: number, year: number, ageYears: string) => `Semana ${week} de ${year} — cerca de ${ageYears} anos de idade.`,
    primary: (week: number, year: number) => `Semana ${week}, ${year}`,
    approxAge: 'Idade aproximada',
    yearsOld: (ageYears: string) => `${ageYears} anos`,
    dotCode: 'Código DOT',
    manufactured: 'Fabricado em',
    metricWeek: 'Semana de fabricação',
    metricYear: 'Ano de fabricação',
    metricMonth: 'Mês aproximado de fabricação',
    metricAge: 'Idade aproximada hoje',
    metricGuidance: 'Orientação geral',
  },
  pl: {
    formatError: 'Wpisz 4 ostatnie cyfry kodu DOT (tydzień i rok), na przykład 2219.',
    weekRangeError: 'Pierwsze dwie cyfry powinny oznaczać numer tygodnia od 01 do 53.',
    futureYearError: 'Ten rok jest w przyszłości — sprawdź jeszcze raz 4-cyfrowy kod.',
    tooOldError: 'Kody sprzed 2000 roku mają format 3-cyfrowy, którego ten dekoder nie obsługuje.',
    summaryError: 'Sprawdź kod, aby odczytać datę produkcji.',
    reset: 'Wpisz 4-cyfrowy kod daty DOT.',
    guidanceDefault: 'W granicach często podawanego okresu eksploatacji; mimo to sprawdź zalecenia producenta swoich opon.',
    guidanceOver10: 'Powyżej 10 lat, które wielu producentów podaje jako maksimum, niezależnie od głębokości bieżnika.',
    guidanceOver6: 'Po przekroczeniu 6 lat wielu producentów zaleca kontrolę w serwisie co najmniej raz w roku.',
    summary: (week: number, year: number, ageYears: string) => `Tydzień ${week} roku ${year} — wiek około ${ageYears} lat.`,
    primary: (week: number, year: number) => `Tydzień ${week}, ${year}`,
    approxAge: 'Przybliżony wiek',
    yearsOld: (ageYears: string) => `${ageYears} lat`,
    dotCode: 'Kod DOT',
    manufactured: 'Data produkcji',
    metricWeek: 'Tydzień produkcji',
    metricYear: 'Rok produkcji',
    metricMonth: 'Przybliżony miesiąc produkcji',
    metricAge: 'Przybliżony wiek dzisiaj',
    metricGuidance: 'Ogólne zalecenie',
  },
  nl: {
    formatError: 'Vul de laatste 4 cijfers van de DOT-code in (week en jaar), bijvoorbeeld 2219.',
    weekRangeError: 'De eerste twee cijfers moeten een weeknummer tussen 01 en 53 zijn.',
    futureYearError: 'Dat jaar ligt in de toekomst — controleer de 4-cijferige code.',
    tooOldError: 'Codes van vóór 2000 gebruiken een 3-cijferig formaat dat deze decoder niet ondersteunt.',
    summaryError: 'Controleer de code om de productiedatum te ontcijferen.',
    reset: 'Vul een 4-cijferige DOT-datumcode in.',
    guidanceDefault: 'Binnen een vaak genoemde gebruiksduur; controleer toch de specifieke richtlijnen van je bandenfabrikant.',
    guidanceOver10: 'Voorbij de grens van 10 jaar die veel fabrikanten als maximum noemen, ongeacht de profieldiepte.',
    guidanceOver6: 'Ouder dan 6 jaar: veel fabrikanten adviseren minstens eens per jaar een controle door een vakman.',
    summary: (week: number, year: number, ageYears: string) => `Week ${week} van ${year} — ongeveer ${ageYears} jaar oud.`,
    primary: (week: number, year: number) => `Week ${week}, ${year}`,
    approxAge: 'Geschatte leeftijd',
    yearsOld: (ageYears: string) => `${ageYears} jaar`,
    dotCode: 'DOT-code',
    manufactured: 'Geproduceerd',
    metricWeek: 'Productieweek',
    metricYear: 'Productiejaar',
    metricMonth: 'Geschatte productiemaand',
    metricAge: 'Geschatte leeftijd vandaag',
    metricGuidance: 'Algemeen advies',
  },
  tr: {
    formatError: 'DOT kodunun son 4 hanesini (hafta ve yıl) girin, örneğin 2219.',
    weekRangeError: 'İlk iki hane 01 ile 53 arasında bir hafta numarası olmalıdır.',
    futureYearError: 'Bu yıl gelecekte — 4 haneli kodu tekrar kontrol edin.',
    tooOldError: '2000 öncesi kodlar, bu çözücünün desteklemediği 3 haneli bir format kullanır.',
    summaryError: 'Üretim tarihini çözmek için kodu kontrol edin.',
    reset: '4 haneli bir DOT tarih kodu girin.',
    guidanceDefault: 'Sıkça belirtilen kullanım ömrü aralığında; yine de lastik üreticinizin kendi önerilerini kontrol edin.',
    guidanceOver10: 'Diş derinliğinden bağımsız olarak birçok üreticinin üst sınır olarak belirttiği 10 yılı aşmış.',
    guidanceOver6: '6 yaşını geçmiş; birçok üretici yılda en az bir kez uzman kontrolü önerir.',
    summary: (week: number, year: number, ageYears: string) => `${year} yılının ${week}. haftası — yaklaşık ${ageYears} yaşında.`,
    primary: (week: number, year: number) => `${week}. hafta, ${year}`,
    approxAge: 'Yaklaşık yaş',
    yearsOld: (ageYears: string) => `${ageYears} yıl`,
    dotCode: 'DOT kodu',
    manufactured: 'Üretim tarihi',
    metricWeek: 'Üretim haftası',
    metricYear: 'Üretim yılı',
    metricMonth: 'Yaklaşık üretim ayı',
    metricAge: 'Bugünkü yaklaşık yaş',
    metricGuidance: 'Genel öneri',
  },
} as const;

function textValue(form: HTMLFormElement, name: string): string { return String(new FormData(form).get(name) ?? '').trim(); }

function dateFromWeek(week: number, year: number): Date {
  // ISO-ish approximation: first Monday-based week of the year, adequate for a display date.
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const dayOffset = (week - 1) * 7;
  return new Date(jan1.getTime() + dayOffset * 86400000);
}

export function initializeTireDateCodeDecoder(): void {
  const locale = getPageLocale();
  const t = TIRE_DATE_CODE_LABELS[locale];
  const monthNames = MONTH_NAMES[locale];
  document.querySelectorAll<HTMLFormElement>('[data-calculator="tire-date-code"]').forEach((form) => {
    const calculate = (): void => {
      const raw = textValue(form, 'code').replace(/\D/g, '');
      const issues: string[] = [];
      if (raw.length !== 4) issues.push(t.formatError);
      let week = 0, year = 0;
      if (!issues.length) {
        week = Number(raw.slice(0, 2));
        const yy = Number(raw.slice(2, 4));
        year = 2000 + yy;
        const now = new Date();
        if (week < 1 || week > 53) issues.push(t.weekRangeError);
        if (year > now.getFullYear()) issues.push(t.futureYearError);
        if (year < 1990) issues.push(t.tooOldError);
      }
      if (issues.length) {
        setErrors(form, issues);
        setSummary(form, t.summaryError, true);
        renderMetrics(form, []);
        resetStandardAnswer(form, t.reset);
        return;
      }
      setErrors(form, []);
      const manufactureDate = dateFromWeek(week, year);
      const now = new Date();
      const ageYears = (now.getTime() - manufactureDate.getTime()) / (365.25 * 86400000);
      const monthLabel = monthNames[manufactureDate.getUTCMonth()] ?? '';
      let guidance: string = t.guidanceDefault;
      if (ageYears >= 10) guidance = t.guidanceOver10;
      else if (ageYears >= 6) guidance = t.guidanceOver6;
      setSummary(form, t.summary(week, year, ageYears.toFixed(1)), false);
      syncStandardAnswer(form, {
        primary: t.primary(week, year),
        secondaryLabel: t.approxAge,
        secondary: t.yearsOld(ageYears.toFixed(1)),
        secondaryNote: guidance,
        leftLabel: t.dotCode,
        left: raw,
        rightLabel: t.manufactured,
        right: `${monthLabel} ${year}`,
      });
      renderMetrics(form, [
        [t.metricWeek, String(week)],
        [t.metricYear, String(year)],
        [t.metricMonth, monthLabel],
        [t.metricAge, t.yearsOld(ageYears.toFixed(1))],
        [t.metricGuidance, guidance],
      ]);
    };
    form.addEventListener('submit', (event) => { event.preventDefault(); calculate(); });
    form.addEventListener('input', calculate);
    form.addEventListener('change', calculate);
    calculate();
  });
}
