/**
 * Copy for the calculator report actions (PDF download, "email me this report") and for the
 * report / confirmation emails and pages the worker sends. One object per published locale.
 */
import type { AtlasLocale } from '../localization/locales';

export interface ReportCaptureText {
  readonly pdf: string;
  readonly email: string;
  readonly emailLabel: string;
  readonly emailPlaceholder: string;
  readonly send: string;
  readonly sending: string;
  readonly subscribe: string;
  readonly privacy: string;
  readonly privacyLink: string;
  readonly sent: string;
  readonly sentConfirm: string;
  readonly errorInvalid: string;
  readonly errorRate: string;
  readonly errorUnavailable: string;
  readonly errorGeneric: string;
  readonly printTitle: string;
  readonly printCreated: string;
  readonly printReopen: string;
  readonly mailSubject: (tool: string) => string;
  readonly mailHeading: string;
  readonly mailIntro: (tool: string) => string;
  readonly mailResults: string;
  readonly mailValues: string;
  readonly mailOpen: string;
  readonly mailConfirmIntro: string;
  readonly mailConfirm: string;
  readonly mailOneOff: string;
  readonly mailUnsubscribe: string;
  readonly pageConfirmedTitle: string;
  readonly pageConfirmedBody: string;
  readonly pageUnsubscribedTitle: string;
  readonly pageUnsubscribedBody: string;
  readonly pageInvalidTitle: string;
  readonly pageInvalidBody: string;
  readonly pageBack: string;
}

export const reportCaptureText: Readonly<Record<AtlasLocale, ReportCaptureText>> = {
  en: {
    pdf: 'Download PDF report', email: 'Email me this report', emailLabel: 'Email address', emailPlaceholder: 'you@example.com',
    send: 'Send report', sending: 'Sending…',
    subscribe: 'Also send me Atlas updates: new tools and fuel price changes. I confirm by email and can unsubscribe anytime.',
    privacy: 'Your address is used to send this report. It is stored only if you join the list.', privacyLink: 'Privacy',
    sent: 'Sent. Check your inbox.', sentConfirm: 'Sent. Check your inbox and confirm to join the list.',
    errorInvalid: 'Enter a valid email address.', errorRate: 'Too many requests. Try again later.',
    errorUnavailable: 'Email reports are not available right now. You can still download the PDF.', errorGeneric: 'Could not send. Please try again.',
    printTitle: 'Calculation report', printCreated: 'Created', printReopen: 'Open this calculation again',
    mailSubject: (tool) => `Your ${tool} report`, mailHeading: 'Your calculation report',
    mailIntro: (tool) => `Here is the ${tool} calculation you made on Atlas GarageOS.`, mailResults: 'Results', mailValues: 'Values you entered', mailOpen: 'Open the full report',
    mailConfirmIntro: 'You also asked to join the Atlas list. Confirm with one click:', mailConfirm: 'Confirm subscription',
    mailOneOff: 'You received this one email because you requested it. Nothing else will follow.', mailUnsubscribe: 'Unsubscribe',
    pageConfirmedTitle: 'Subscription confirmed', pageConfirmedBody: 'Thank you. Atlas will write only when there is something worth your time.',
    pageUnsubscribedTitle: 'You are unsubscribed', pageUnsubscribedBody: 'You will not receive any more emails from Atlas.',
    pageInvalidTitle: 'This link is no longer valid', pageInvalidBody: 'It may have been used already. Nothing else is needed.', pageBack: 'Back to Atlas GarageOS',
  },
  de: {
    pdf: 'PDF-Bericht herunterladen', email: 'Bericht per E-Mail senden', emailLabel: 'E-Mail-Adresse', emailPlaceholder: 'name@beispiel.de',
    send: 'Bericht senden', sending: 'Wird gesendet…',
    subscribe: 'Schickt mir auch Atlas-Neuigkeiten: neue Rechner und Kraftstoffpreis-Änderungen. Ich bestätige per E-Mail und kann mich jederzeit abmelden.',
    privacy: 'Ihre Adresse wird zum Senden dieses Berichts verwendet und nur gespeichert, wenn Sie sich eintragen.', privacyLink: 'Datenschutz',
    sent: 'Gesendet. Bitte Posteingang prüfen.', sentConfirm: 'Gesendet. Bitte Posteingang prüfen und die Anmeldung bestätigen.',
    errorInvalid: 'Bitte eine gültige E-Mail-Adresse eingeben.', errorRate: 'Zu viele Anfragen. Bitte später erneut versuchen.',
    errorUnavailable: 'E-Mail-Berichte sind gerade nicht verfügbar. Das PDF können Sie weiterhin herunterladen.', errorGeneric: 'Senden fehlgeschlagen. Bitte erneut versuchen.',
    printTitle: 'Berechnungsbericht', printCreated: 'Erstellt', printReopen: 'Diese Berechnung erneut öffnen',
    mailSubject: (tool) => `Ihr Bericht: ${tool}`, mailHeading: 'Ihr Berechnungsbericht',
    mailIntro: (tool) => `Hier ist Ihre Berechnung mit dem Rechner „${tool}“ auf Atlas GarageOS.`, mailResults: 'Ergebnisse', mailValues: 'Ihre Eingaben', mailOpen: 'Vollständigen Bericht öffnen',
    mailConfirmIntro: 'Sie möchten außerdem Atlas-Neuigkeiten erhalten. Bitte mit einem Klick bestätigen:', mailConfirm: 'Anmeldung bestätigen',
    mailOneOff: 'Sie erhalten diese eine E-Mail, weil Sie sie angefordert haben. Es folgt nichts weiter.', mailUnsubscribe: 'Abmelden',
    pageConfirmedTitle: 'Anmeldung bestätigt', pageConfirmedBody: 'Danke. Atlas schreibt nur, wenn es sich für Sie lohnt.',
    pageUnsubscribedTitle: 'Sie sind abgemeldet', pageUnsubscribedBody: 'Sie erhalten keine weiteren E-Mails von Atlas.',
    pageInvalidTitle: 'Dieser Link ist nicht mehr gültig', pageInvalidBody: 'Er wurde möglicherweise bereits verwendet. Sonst ist nichts zu tun.', pageBack: 'Zurück zu Atlas GarageOS',
  },
  es: {
    pdf: 'Descargar informe en PDF', email: 'Enviarme este informe por correo', emailLabel: 'Correo electrónico', emailPlaceholder: 'tu@ejemplo.com',
    send: 'Enviar informe', sending: 'Enviando…',
    subscribe: 'Enviadme también novedades de Atlas: nuevas herramientas y cambios en el precio del combustible. Confirmo por correo y puedo darme de baja cuando quiera.',
    privacy: 'Tu dirección se usa para enviar este informe y solo se guarda si te unes a la lista.', privacyLink: 'Privacidad',
    sent: 'Enviado. Revisa tu bandeja de entrada.', sentConfirm: 'Enviado. Revisa tu bandeja de entrada y confirma para unirte a la lista.',
    errorInvalid: 'Introduce un correo electrónico válido.', errorRate: 'Demasiadas solicitudes. Inténtalo más tarde.',
    errorUnavailable: 'Los informes por correo no están disponibles ahora. Puedes descargar el PDF.', errorGeneric: 'No se pudo enviar. Inténtalo de nuevo.',
    printTitle: 'Informe de cálculo', printCreated: 'Creado', printReopen: 'Abrir de nuevo este cálculo',
    mailSubject: (tool) => `Tu informe: ${tool}`, mailHeading: 'Tu informe de cálculo',
    mailIntro: (tool) => `Este es el cálculo que hiciste con «${tool}» en Atlas GarageOS.`, mailResults: 'Resultados', mailValues: 'Valores introducidos', mailOpen: 'Abrir el informe completo',
    mailConfirmIntro: 'También pediste unirte a la lista de Atlas. Confírmalo con un clic:', mailConfirm: 'Confirmar suscripción',
    mailOneOff: 'Recibes este único correo porque lo solicitaste. No recibirás nada más.', mailUnsubscribe: 'Darse de baja',
    pageConfirmedTitle: 'Suscripción confirmada', pageConfirmedBody: 'Gracias. Atlas solo escribirá cuando merezca la pena.',
    pageUnsubscribedTitle: 'Te has dado de baja', pageUnsubscribedBody: 'No recibirás más correos de Atlas.',
    pageInvalidTitle: 'Este enlace ya no es válido', pageInvalidBody: 'Es posible que ya se haya usado. No hace falta nada más.', pageBack: 'Volver a Atlas GarageOS',
  },
  fr: {
    pdf: 'Télécharger le rapport PDF', email: 'M’envoyer ce rapport par e-mail', emailLabel: 'Adresse e-mail', emailPlaceholder: 'vous@exemple.fr',
    send: 'Envoyer le rapport', sending: 'Envoi…',
    subscribe: 'Envoyez-moi aussi les nouveautés Atlas : nouveaux outils et variations du prix des carburants. Je confirme par e-mail et peux me désabonner à tout moment.',
    privacy: 'Votre adresse sert à envoyer ce rapport. Elle n’est conservée que si vous rejoignez la liste.', privacyLink: 'Confidentialité',
    sent: 'Envoyé. Consultez votre boîte de réception.', sentConfirm: 'Envoyé. Consultez votre boîte de réception et confirmez pour rejoindre la liste.',
    errorInvalid: 'Saisissez une adresse e-mail valide.', errorRate: 'Trop de demandes. Réessayez plus tard.',
    errorUnavailable: 'Les rapports par e-mail ne sont pas disponibles pour le moment. Vous pouvez toujours télécharger le PDF.', errorGeneric: 'Envoi impossible. Veuillez réessayer.',
    printTitle: 'Rapport de calcul', printCreated: 'Créé le', printReopen: 'Rouvrir ce calcul',
    mailSubject: (tool) => `Votre rapport : ${tool}`, mailHeading: 'Votre rapport de calcul',
    mailIntro: (tool) => `Voici le calcul effectué avec « ${tool} » sur Atlas GarageOS.`, mailResults: 'Résultats', mailValues: 'Valeurs saisies', mailOpen: 'Ouvrir le rapport complet',
    mailConfirmIntro: 'Vous avez aussi demandé à rejoindre la liste Atlas. Confirmez en un clic :', mailConfirm: 'Confirmer l’inscription',
    mailOneOff: 'Vous recevez cet unique e-mail parce que vous l’avez demandé. Rien d’autre ne suivra.', mailUnsubscribe: 'Se désabonner',
    pageConfirmedTitle: 'Inscription confirmée', pageConfirmedBody: 'Merci. Atlas n’écrira que lorsque cela en vaut la peine.',
    pageUnsubscribedTitle: 'Vous êtes désabonné', pageUnsubscribedBody: 'Vous ne recevrez plus d’e-mails d’Atlas.',
    pageInvalidTitle: 'Ce lien n’est plus valide', pageInvalidBody: 'Il a peut-être déjà été utilisé. Rien d’autre n’est nécessaire.', pageBack: 'Retour à Atlas GarageOS',
  },
  it: {
    pdf: 'Scarica il report in PDF', email: 'Inviami questo report via e-mail', emailLabel: 'Indirizzo e-mail', emailPlaceholder: 'tu@esempio.it',
    send: 'Invia report', sending: 'Invio…',
    subscribe: 'Inviatemi anche le novità di Atlas: nuovi strumenti e variazioni del prezzo del carburante. Confermo via e-mail e posso disiscrivermi in qualsiasi momento.',
    privacy: 'Il tuo indirizzo serve per inviare questo report e viene conservato solo se ti iscrivi alla lista.', privacyLink: 'Privacy',
    sent: 'Inviato. Controlla la tua casella di posta.', sentConfirm: 'Inviato. Controlla la posta e conferma per iscriverti alla lista.',
    errorInvalid: 'Inserisci un indirizzo e-mail valido.', errorRate: 'Troppe richieste. Riprova più tardi.',
    errorUnavailable: 'I report via e-mail non sono disponibili al momento. Puoi comunque scaricare il PDF.', errorGeneric: 'Invio non riuscito. Riprova.',
    printTitle: 'Report di calcolo', printCreated: 'Creato il', printReopen: 'Riapri questo calcolo',
    mailSubject: (tool) => `Il tuo report: ${tool}`, mailHeading: 'Il tuo report di calcolo',
    mailIntro: (tool) => `Ecco il calcolo che hai fatto con «${tool}» su Atlas GarageOS.`, mailResults: 'Risultati', mailValues: 'Valori inseriti', mailOpen: 'Apri il report completo',
    mailConfirmIntro: 'Hai anche chiesto di iscriverti alla lista di Atlas. Conferma con un clic:', mailConfirm: 'Conferma iscrizione',
    mailOneOff: 'Ricevi questa sola e-mail perché l’hai richiesta. Non seguirà nient’altro.', mailUnsubscribe: 'Disiscriviti',
    pageConfirmedTitle: 'Iscrizione confermata', pageConfirmedBody: 'Grazie. Atlas scriverà solo quando ne varrà la pena.',
    pageUnsubscribedTitle: 'Disiscrizione completata', pageUnsubscribedBody: 'Non riceverai altre e-mail da Atlas.',
    pageInvalidTitle: 'Questo link non è più valido', pageInvalidBody: 'Potrebbe essere già stato usato. Non serve altro.', pageBack: 'Torna ad Atlas GarageOS',
  },
  'pt-br': {
    pdf: 'Baixar relatório em PDF', email: 'Enviar este relatório para meu e-mail', emailLabel: 'E-mail', emailPlaceholder: 'voce@exemplo.com.br',
    send: 'Enviar relatório', sending: 'Enviando…',
    subscribe: 'Também quero receber novidades da Atlas: novas ferramentas e mudanças no preço do combustível. Confirmo por e-mail e posso cancelar quando quiser.',
    privacy: 'Seu endereço é usado para enviar este relatório e só fica salvo se você entrar na lista.', privacyLink: 'Privacidade',
    sent: 'Enviado. Confira sua caixa de entrada.', sentConfirm: 'Enviado. Confira sua caixa de entrada e confirme para entrar na lista.',
    errorInvalid: 'Digite um e-mail válido.', errorRate: 'Muitas solicitações. Tente novamente mais tarde.',
    errorUnavailable: 'O envio por e-mail não está disponível agora. Você ainda pode baixar o PDF.', errorGeneric: 'Não foi possível enviar. Tente novamente.',
    printTitle: 'Relatório de cálculo', printCreated: 'Criado em', printReopen: 'Abrir este cálculo novamente',
    mailSubject: (tool) => `Seu relatório: ${tool}`, mailHeading: 'Seu relatório de cálculo',
    mailIntro: (tool) => `Aqui está o cálculo que você fez com “${tool}” na Atlas GarageOS.`, mailResults: 'Resultados', mailValues: 'Valores informados', mailOpen: 'Abrir o relatório completo',
    mailConfirmIntro: 'Você também pediu para entrar na lista da Atlas. Confirme com um clique:', mailConfirm: 'Confirmar inscrição',
    mailOneOff: 'Você recebeu este único e-mail porque o solicitou. Nada mais será enviado.', mailUnsubscribe: 'Cancelar inscrição',
    pageConfirmedTitle: 'Inscrição confirmada', pageConfirmedBody: 'Obrigado. A Atlas só vai escrever quando valer a pena.',
    pageUnsubscribedTitle: 'Inscrição cancelada', pageUnsubscribedBody: 'Você não receberá mais e-mails da Atlas.',
    pageInvalidTitle: 'Este link não é mais válido', pageInvalidBody: 'Talvez ele já tenha sido usado. Não é preciso fazer mais nada.', pageBack: 'Voltar para a Atlas GarageOS',
  },
  pl: {
    pdf: 'Pobierz raport PDF', email: 'Wyślij mi ten raport e-mailem', emailLabel: 'Adres e-mail', emailPlaceholder: 'ty@przyklad.pl',
    send: 'Wyślij raport', sending: 'Wysyłanie…',
    subscribe: 'Przysyłajcie mi też nowości Atlas: nowe narzędzia i zmiany cen paliwa. Potwierdzam e-mailem i mogę zrezygnować w każdej chwili.',
    privacy: 'Adres służy do wysłania tego raportu i jest zapisywany tylko, jeśli dołączysz do listy.', privacyLink: 'Prywatność',
    sent: 'Wysłano. Sprawdź skrzynkę odbiorczą.', sentConfirm: 'Wysłano. Sprawdź skrzynkę i potwierdź, aby dołączyć do listy.',
    errorInvalid: 'Podaj poprawny adres e-mail.', errorRate: 'Zbyt wiele prób. Spróbuj później.',
    errorUnavailable: 'Raporty e-mail są teraz niedostępne. Nadal możesz pobrać PDF.', errorGeneric: 'Nie udało się wysłać. Spróbuj ponownie.',
    printTitle: 'Raport z obliczeń', printCreated: 'Utworzono', printReopen: 'Otwórz ponownie to obliczenie',
    mailSubject: (tool) => `Twój raport: ${tool}`, mailHeading: 'Twój raport z obliczeń',
    mailIntro: (tool) => `Oto obliczenie wykonane narzędziem „${tool}” w Atlas GarageOS.`, mailResults: 'Wyniki', mailValues: 'Wprowadzone wartości', mailOpen: 'Otwórz pełny raport',
    mailConfirmIntro: 'Poprosiłeś też o dołączenie do listy Atlas. Potwierdź jednym kliknięciem:', mailConfirm: 'Potwierdź subskrypcję',
    mailOneOff: 'Otrzymujesz tę jedną wiadomość, bo o nią poprosiłeś. Nic więcej nie wyślemy.', mailUnsubscribe: 'Wypisz się',
    pageConfirmedTitle: 'Subskrypcja potwierdzona', pageConfirmedBody: 'Dziękujemy. Atlas napisze tylko wtedy, gdy będzie warto.',
    pageUnsubscribedTitle: 'Wypisano z listy', pageUnsubscribedBody: 'Nie otrzymasz już wiadomości od Atlas.',
    pageInvalidTitle: 'Ten link jest już nieważny', pageInvalidBody: 'Mógł zostać już użyty. Nic więcej nie trzeba robić.', pageBack: 'Wróć do Atlas GarageOS',
  },
  nl: {
    pdf: 'PDF-rapport downloaden', email: 'Stuur dit rapport naar mijn e-mail', emailLabel: 'E-mailadres', emailPlaceholder: 'jij@voorbeeld.nl',
    send: 'Rapport versturen', sending: 'Versturen…',
    subscribe: 'Stuur me ook Atlas-nieuws: nieuwe tools en veranderingen in brandstofprijzen. Ik bevestig per e-mail en kan me altijd afmelden.',
    privacy: 'Je adres wordt gebruikt om dit rapport te sturen en alleen bewaard als je je aanmeldt voor de lijst.', privacyLink: 'Privacy',
    sent: 'Verstuurd. Kijk in je inbox.', sentConfirm: 'Verstuurd. Kijk in je inbox en bevestig om je aan te melden.',
    errorInvalid: 'Vul een geldig e-mailadres in.', errorRate: 'Te veel verzoeken. Probeer het later opnieuw.',
    errorUnavailable: 'E-mailrapporten zijn nu niet beschikbaar. Je kunt de PDF nog wel downloaden.', errorGeneric: 'Versturen mislukt. Probeer het opnieuw.',
    printTitle: 'Berekeningsrapport', printCreated: 'Gemaakt op', printReopen: 'Deze berekening opnieuw openen',
    mailSubject: (tool) => `Je rapport: ${tool}`, mailHeading: 'Je berekeningsrapport',
    mailIntro: (tool) => `Hier is je berekening met „${tool}” op Atlas GarageOS.`, mailResults: 'Resultaten', mailValues: 'Ingevulde waarden', mailOpen: 'Volledig rapport openen',
    mailConfirmIntro: 'Je vroeg ook om je aan te melden voor de Atlas-lijst. Bevestig met één klik:', mailConfirm: 'Aanmelding bevestigen',
    mailOneOff: 'Je ontvangt deze ene e-mail omdat je erom vroeg. Er volgt niets meer.', mailUnsubscribe: 'Afmelden',
    pageConfirmedTitle: 'Aanmelding bevestigd', pageConfirmedBody: 'Bedankt. Atlas schrijft alleen als het de moeite waard is.',
    pageUnsubscribedTitle: 'Je bent afgemeld', pageUnsubscribedBody: 'Je ontvangt geen e-mails meer van Atlas.',
    pageInvalidTitle: 'Deze link is niet meer geldig', pageInvalidBody: 'Hij is misschien al gebruikt. Je hoeft niets meer te doen.', pageBack: 'Terug naar Atlas GarageOS',
  },
  tr: {
    pdf: 'PDF rapor indir', email: 'Bu raporu e-postama gönder', emailLabel: 'E-posta adresi', emailPlaceholder: 'siz@ornek.com',
    send: 'Raporu gönder', sending: 'Gönderiliyor…',
    subscribe: 'Atlas yeniliklerini de gönderin: yeni araçlar ve akaryakıt fiyatı değişiklikleri. E-postayla onaylarım, istediğim zaman ayrılabilirim.',
    privacy: 'Adresiniz bu raporu göndermek için kullanılır; yalnızca listeye katılırsanız saklanır.', privacyLink: 'Gizlilik',
    sent: 'Gönderildi. Gelen kutunuza bakın.', sentConfirm: 'Gönderildi. Gelen kutunuza bakın ve listeye katılmak için onaylayın.',
    errorInvalid: 'Geçerli bir e-posta adresi girin.', errorRate: 'Çok fazla deneme. Biraz sonra tekrar deneyin.',
    errorUnavailable: 'E-posta raporu şu an kullanılamıyor. PDF’i yine indirebilirsiniz.', errorGeneric: 'Gönderilemedi. Lütfen tekrar deneyin.',
    printTitle: 'Hesaplama raporu', printCreated: 'Oluşturulma', printReopen: 'Bu hesaplamayı yeniden açın',
    mailSubject: (tool) => `Raporunuz: ${tool}`, mailHeading: 'Hesaplama raporunuz',
    mailIntro: (tool) => `Atlas GarageOS’ta “${tool}” ile yaptığınız hesaplama aşağıda.`, mailResults: 'Sonuçlar', mailValues: 'Girdiğiniz değerler', mailOpen: 'Raporun tamamını aç',
    mailConfirmIntro: 'Atlas listesine de katılmak istediniz. Tek tıkla onaylayın:', mailConfirm: 'Aboneliği onayla',
    mailOneOff: 'Bu tek e-postayı siz istediğiniz için aldınız. Başka bir şey gönderilmeyecek.', mailUnsubscribe: 'Abonelikten çık',
    pageConfirmedTitle: 'Abonelik onaylandı', pageConfirmedBody: 'Teşekkürler. Atlas yalnızca değecek bir şey olduğunda yazar.',
    pageUnsubscribedTitle: 'Abonelikten çıktınız', pageUnsubscribedBody: 'Atlas’tan artık e-posta almayacaksınız.',
    pageInvalidTitle: 'Bu bağlantı artık geçerli değil', pageInvalidBody: 'Daha önce kullanılmış olabilir. Başka bir şey yapmanıza gerek yok.', pageBack: 'Atlas GarageOS’a dön',
  },
};
