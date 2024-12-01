/** Comportements.js ******/

// Programme principal
console.log("Exécution du programme javascript ");


// Mise en place d'un écouteur d'événement 
// Version pour un seul formulaire
//const formulaire = document.querySelector('.formulairePourBDProf');
//formulaire.addEventListener("submit", executerRequete);

// Version pour plusieurs formulaires
const formulaires = document.querySelectorAll('form');
formulaires.forEach(unFormulaire => unFormulaire.addEventListener("submit", executerRequete))
    //formulaire.addEventListener("submit", executerRequete);


/*** Gestionnaire d'événement **/
function executerRequete(evt) {
    console.log("Le formulaire a été validé");
    console.log(" => Exécution du gestionnaire d'événement executerRequete");
    // Pour empêcher le rechargement de la page, qui est le comportement par défaut lors de la soumission d'un formulaire
    evt.preventDefault();

    // Quel formulaire a été utilisé ?
    const formulaireValidé = evt.target;
    let BDLocale = false;
    let erreurDeBD = false;
    if (formulaireValidé.classList.contains("formulairePourBDProf")) {
        BDAManipuler = "la base de données enseignant";
    } else {
        if (formulaireValidé.classList.contains("formulairePourBDEtudiant")) {
            BDAManipuler = "votre base de données personnelle";
            BDLocale = true;
        } else {
            BDAManipuler = "une base de données inconnue";
            erreurDeBD = true;
        }
    }
    console.log("Vous cherchez à manipuler " + BDAManipuler);

    // Supprimer l'entête de la table éventuellement présente dans la page
    const enteteTableResultat = document.querySelector('.affichageBD thead');
    if (enteteTableResultat) {
        enteteTableResultat.remove();
    }

    // Supprimer le corps de table éventuellement présent dans la page
    if (document.querySelector('.affichageBD tbody')) {
        document.querySelector('.affichageBD tbody').remove();
    }

    // Supprimer le message d'érreur éventuellement présent
    if (document.querySelector('.messageErreur')) {
        document.querySelector('.messageErreur').remove();
    }

    // Récupérer le texte de la requête

    // Tester si on a un input texte (equiv une liste déroulante) ou des boutons radios 
    const elementDeSaisieRadio = formulaireValidé.querySelector('[name=requete]:checked');
    let selecteurRequete; // le sélecteur CSS permettant d'atteindre l'élément html contenant le texte de la requête
    if (elementDeSaisieRadio) {
        console.log("J'ai détecté une saisie par bouton radio");
        selecteurRequete = '[name=requete]:checked';
    } else {
        console.log("J'ai détecté une saisie par bouton liste déroulante ou champ textuel");
        selecteurRequete = '[name=requete]';
    }
    console.log("\t Voici le sélecteur CSS  permettant d'atteindre l'élément html contenant le texte de la requête : " + selecteurRequete);
    texteRequete = formulaireValidé.querySelector(selecteurRequete).value;
    console.log("\t J'ai récupéré ce texte de requête : " + texteRequete);

    let adresseDesDonnees;
    if (BDLocale) {
        adresseDesDonnees = "php/soumettreRequete.php";
    } else {
        adresseDesDonnees = "https://ftpueweb.univ-lr.fr/api/soumettreRequete.php";
    }

    if (!erreurDeBD) {

        let donneesDuFormulaire = new FormData();
        donneesDuFormulaire.append("texteRequete", texteRequete)
        const optionsAjax = {
            "method": "POST",
            "body": donneesDuFormulaire
        }

        fetch(adresseDesDonnees, optionsAjax)
            .then(response => response.json())
            .then(resultats => afficherResultatsRequete(resultats))
            .catch(erreur => afficherErreur("Je ne peux pas récupérer les données " + erreur));
    } else { // Il y a une erreur dand le choix de la base de données
        afficherErreur("Le choix entre la base de données prof et votre base de données personnelle n'est pas clairement exprimé");
    }


    console.log("\t J'envoie la requête à l'adresse " + adresseDesDonnees);


} // Fin de la fonction executerRequete


function afficherResultatsRequete(enregistrements) {
    console.log("L'appel Ajax permettant de récupérer les informations a fonctionné !");
    console.log("Voici la donnée fournie par le programme php en réponse à la requête : ");
    console.log(enregistrements);
    // la variable enregistrements contient un tableau de données


    // Sélectionner la balise <table> qui recevre les données à afficher
    const table = document.querySelector('.affichageBD table');

    // Créer les balises <tbody> et <thead> de la table
    const tbody = document.createElement('tbody');
    const thead = document.createElement('thead');

    // Récuprérer les noms des champs fournis par la requête 
    let nomsDesChamps = Object.keys(enregistrements[0]);
    console.log("Voici les noms des champs récupérés grâce à la requête")

    // Créer la balise <tr> pour l'affichage des noms des champs
    const ligneEntete = document.createElement('tr');

    // Insérer dans ce <tr> les <td> (cellules de tableau) avec les noms des champs
    nomsDesChamps.forEach(
        function(unNomDeChamp) {
            let cellule = document.createElement('th')
            cellule.textContent = unNomDeChamp;
            console.log("\t" + unNomDeChamp);
            ligneEntete.append(cellule);
        }
    ); // fin forEach
    // Insérer le <tr> d'entête dans la balise <thead>
    thead.append(ligneEntete);

    // Insérer la balise <thead> dans la balise <table>
    table.append(thead);

    //  Pour chaque élément du tableau enregistrements, l'insérer dans le tbody
    const nbEnregistrements = enregistrements.length;
    console.log("Voici les " + nbEnregistrements + " enregistrements reçus :")
    enregistrements.forEach(
        function(unEnregistrement) {
            let ligne = document.createElement('tr');
            console.log(unEnregistrement);
            nomsDesChamps.forEach(
                function(unChamp) {
                    let cellule = document.createElement('td');
                    cellule.textContent = unEnregistrement[unChamp];
                    ligne.append(cellule);
                }
            ); // fin forEach
            tbody.append(ligne);
        }
    );
    // Insérer la balise <tbody> dans la balise <table>
    table.append(tbody);

} // fin de afficherResultatsRequete

function afficherErreur(texteErreur) {
    let paragraphe = document.createElement('p')
    paragraphe.textContent = texteErreur;
    paragraphe.classList.add("messageErreur");
    console.log("Il y a une erreur d'exécution :");
    console.log("\t" + texteErreur);
    document.querySelector('.affichageDesErreurs').append(paragraphe);
}