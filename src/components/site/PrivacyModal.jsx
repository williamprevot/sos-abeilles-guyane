import { useI18n } from '../../i18n/I18nProvider.jsx';

/* Boîte « Politique de confidentialité » (même texte que public/confidentialite.html). */
export default function PrivacyModal(){
  const { t } = useI18n();
  return (
    <>
    <div className="modal-backdrop" id="privacy-backdrop" hidden></div>
    <div className="report-modal privacy-modal" id="privacy-modal" hidden role="dialog" aria-modal="true" aria-labelledby="privacy-modal-title">
      <button type="button" className="modal-close" id="privacy-modal-close" aria-label="Fermer">×</button>
      <div className="section-head">
        <h2 id="privacy-modal-title">Politique de confidentialité</h2>
        <p>Comment nous traitons vos données lorsque vous signalez un essaim — en clair, sans jargon inutile.</p>
      </div>
      <div className="legal-content">
        <p className="legal-updated">Dernière mise à jour : septembre 2026</p>

        <h3>Qui traite vos données ?</h3>
        <p>Le responsable du traitement est l'apiculteur qui exploite le service S.O.S Abeilles Guyane. Le développeur du site intervient uniquement comme <span className="info-key">sous-traitant technique</span>, pour la maintenance — il n'utilise vos données à aucune autre fin.</p>

        <h3>Quelles données sont collectées ?</h3>
        <p>Lorsque vous signalez un essaim, nous collectons :</p>
        <ul>
          <li>Votre nom et numéro de téléphone</li>
          <li>Votre adresse email</li>
          <li>La commune et l'adresse (ou point de repère) de l'essaim</li>
          <li>L'emplacement, l'ancienneté et l'urgence que vous indiquez</li>
          <li>Une photo de l'essaim, si vous en joignez une</li>
          <li>Un message libre, si vous en ajoutez un</li>
      <li>Votre position GPS, seulement si vous appuyez sur « Utiliser ma position » (facultatif)</li>
        </ul>

        <h3>Pourquoi ?</h3>
        <p>Uniquement pour organiser la collecte : vous identifier, vous localiser, évaluer l'urgence, permettre à l'apiculteur de vous contacter pour convenir d'un horaire, puis suivre l'intervention jusqu'à la récupération de l'essaim. Nous en tirons aussi des statistiques anonymes (nombre d'essaims sauvés par commune), sans aucune donnée personnelle.</p>

        <h3>Qui y a accès ?</h3>
        <p>Seuls l'apiculteur et les membres de son équipe, chacun avec un compte personnel protégé par mot de passe, ainsi que le développeur du site (maintenance technique), accèdent à votre signalement. Vos données ne sont ni vendues, ni partagées à des fins commerciales. Votre photo reste dans un espace privé : elle n'est jamais publiée.</p>
        <p>Quelques prestataires les traitent en notre nom, uniquement pour faire fonctionner le service, tous engagés contractuellement à respecter le RGPD :</p>
        <ul>
          <li><span className="info-key">Supabase</span> : base de données et stockage des photos, sur des serveurs situés dans l'Union européenne ;</li>
          <li><span className="info-key">Netlify</span> : hébergement du site ;</li>
          <li><span className="info-key">EmailJS</span> : envoi des emails de confirmation et d'alerte ;</li>
          <li><span className="info-key">MapTiler</span> : cartes, et placement d'une adresse sur la carte de l'équipe (seule l'adresse de l'essaim est transmise, jamais votre nom).</li>
        </ul>
        <p>Si vous acceptez la mesure d'audience, <span className="info-key">Microsoft</span> (Clarity) reçoit aussi des données de navigation, jamais le contenu du formulaire.</p>

        <h3>Combien de temps sont-elles conservées ?</h3>
        <p>Jusqu'à 12 mois après la clôture de votre signalement (essaim récupéré ou signalement sans suite). Ensuite, votre nom, téléphone, email, adresse, position, photo et message sont effacés. Ne restent que la commune, les dates et le résultat, qui ne permettent plus de vous identifier, pour les statistiques.</p>

        <h3>Vos droits</h3>
        <p>Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité sur vos données. Pour l'exercer, utilisez le formulaire <span className="info-key">« Signaler un essaim »</span> du site et indiquez votre demande dans le champ message — nous vous répondrons sous 30 jours. Vous pouvez aussi introduire une réclamation auprès de la <a href="https://www.cnil.fr" target="_blank" rel="noopener">CNIL</a>.</p>

        <h3>Mesure d'audience (seulement avec votre accord)</h3>
        <p>Si vous cliquez sur « Accepter » dans le bandeau, nous utilisons <span className="info-key">Microsoft Clarity</span> pour comprendre comment le site est utilisé et l'améliorer : pages vues, défilement, clics et mouvements de souris, type d'appareil, région approximative. Le formulaire de signalement est entièrement masqué : Clarity ne voit jamais ce que vous y écrivez. L'espace réservé à l'équipe n'est jamais mesuré. Aucun usage publicitaire.</p>
        <p>Ces données sont hébergées par Microsoft, notamment aux États-Unis. Ce transfert est encadré par le <span className="info-key">Data Privacy Framework</span> UE–États-Unis, auquel Microsoft adhère. Durées : enregistrements de visites 30 jours, statistiques 9 mois (fixées par Microsoft). Votre choix est gardé 6 mois.</p>

        <h3>Cookies et traceurs</h3>
        <p>Ce site n'utilise aucun cookie publicitaire.</p>
        <ul>
          <li><span className="info-key">Toujours :</span> votre choix de langue et votre choix de cookies, gardés sur votre appareil, sans suivi.</li>
          <li><span className="info-key">Seulement si vous acceptez :</span> les cookies de Microsoft Clarity (<code>_clck</code> 1 an, <code>_clsk</code> 1 jour, et cookies de Microsoft liés à Clarity, 13 mois au plus).</li>
        </ul>
        <p>Certains services tiers intégrés (police d'écriture Google Fonts, fond de carte MapTiler) peuvent déposer des cookies techniques nécessaires à leur fonctionnement. Vous pouvez changer d'avis à tout moment :</p>
        <button type="button" className="consent-manage-btn" data-consent-open>Gérer mes cookies</button>
      </div>
    </div>
    </>
  );
}
