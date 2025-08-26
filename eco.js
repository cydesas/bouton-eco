/**
 * Crée un bouton éco-responsable avec des options personnalisées.
 *
 * @class
 * @name EcoButton
 *
 * @param {Object} options - Les options personnalisées pour le bouton éco-responsable.
 * @param {string} [options.compressedImagesPath='images/eco'] - Le chemin relatif vers les images compressées.
 * @param {string} [options.uncompressedImagesPath='images/default'] - Le chemin relatif vers les images non compressées.
 * @param {string} [options.fontsPath=''] - Le chemin relatif vers les polices personnalisées.
 * @param {boolean} [options.useCustomFonts=false] - Définit si les polices personnalisées doivent être utilisées.
 * @param {function} [options.onModeChange=null] - La fonction à appeler lorsque le mode éco-responsable est activé ou désactivé.
 *
 * @returns {void}
 */


let heade = document.querySelector("header")
console.log(heade)
alert("helloooo")

class EcoButton {
    constructor(options) {

        // Options par défaut
        const defaults = {
            compressedImagesPath: 'images/eco',
            uncompressedImagesPath: 'images/default',
            fontsPath: '',
            useCustomFonts: false,
            onModeChange: null
        };

        // Fusionne les options utilisateur avec les options par défaut
        const settings = Object.assign(defaults, options);

        // Définit les propriétés de la classe
        this.totalWeight = 0;
        this.compressedImagesPath = settings.compressedImagesPath;
        this.uncompressedImagesPath = settings.uncompressedImagesPath;
        this.fontsPath = settings.fontsPath;
        this.useCustomFonts = settings.useCustomFonts;
        this.onModeChange = settings.onModeChange;
        this.ecoModeEnabled = sessionStorage.getItem('eco-mode') === 'true';
        // TODO : Ajouter des propriétés pour le poids des pages avec/sans éco ==>

        // Crée l'élément de bouton et ajoute les classes et propriétés CSS nécessaires
        const buttonElement = document.createElement('button');
        buttonElement.classList.add('eco-button');
        buttonElement.style.backgroundImage = `url(images/logo-eco-off.svg)`;

        // Ajoute un écouteur d'événements pour le clic sur le bouton
        buttonElement.addEventListener('click', () => {
            this.toggleMode();
        });

        // Ajoute le bouton au DOM
        const containerElement = document.querySelector('.eco-btn-container');
        containerElement.appendChild(buttonElement);

        this.beforeLoad();

        // Affiche le statut du mode éco-responsable
        console.log('Le mode éco-responsable est ' + (this.ecoModeEnabled ? 'activé' : 'désactivé'));
        this.calculatePageWeight();
        this.saveTotalWeight();
        console.log('Poids total: ' + (this.totalWeight / 1000) + ' MB');

        // Affiche le statut du mode éco-responsable v2
        // this.webConsumption();

        // Affiche la consommation de bande passante
        this.displayBandwidthInfo();
        //this.getResourcesMeasure(); // Probleme avec la fonction (CORS)
        //this.getNetworkMeasure();   // OK
        console.log(this.getNetworkAndDataMeasure());
    }

    /**
     * Bascule le mode éco-responsable.
     *
     * @function
     * @name toggleMode
     *
     * @param {Event} evt - L'événement de clic sur le bouton.
     *
     * @returns {void}
     */
    toggleMode(evt) {
        // Bascule le mode
        if (this.ecoModeEnabled) {
            this.ecoModeEnabled = false;
            sessionStorage.setItem('eco-mode', 'false');
        } else {
            this.ecoModeEnabled = true;
            sessionStorage.setItem('eco-mode', 'true');
        }

        /* Si l'élément cliqué est une checkbox checked, alors on rend checked tous les éléments de la variable btn */
        /*if (evt.checked === true) {
            sessionStorage.setItem('eco-mode', 'true');
        } else {
            sessionStorage.setItem('eco-mode', 'false');
        }*/

        // vérifie que l'icône reload ne soit pas déjà présente pour éviter de la dupliquer
        if (document.getElementsByClassName('reload-icon').length === 0) {
            // On crée et ajoute l'icône qui indique que la page doit être rechargée

            let reloadIcon = document.createElement('img')
            reloadIcon.src = 'images/eco/reload.svg';
            reloadIcon.alt = 'Reload icon';
            reloadIcon.className = 'reload-icon';
            reloadIcon.height = 24;
            reloadIcon.width = 24;
            reloadIcon.onclick = function () {
                window.location.reload();
            }

            document.getElementsByClassName('eco-btn-container')[0].after(reloadIcon);
        }
    }

    /**
     * Effectue des actions avant le chargement de la page.
     *
     * @function
     * @name beforeLoad
     *
     * @returns {void}
     */
    beforeLoad() {
        // Traitements au chargement de la page
        document.addEventListener('DOMContentLoaded', (event) => {

            document.getElementById('body').style.visibility = 'hidden';

            if (this.ecoModeEnabled) {
                let images = document.querySelectorAll("img[src*='images/']");
                for (let i = 0; i < images.length; i++) {
                    let oldSrc = images[i].src;
                    images[i].src = oldSrc.replace(/images\/(.*)/, this.compressedImagesPath + "/$1");
                }

                // changement du font
                document.querySelector(':root').style.setProperty('--font-title', 'Raleway');
                document.querySelector(':root').style.setProperty('--font-text', 'Raleway');

            } else {
                sessionStorage.setItem('eco-mode', 'false');    // On définit la valeur de la clé "eco-mode" à false par défaut

                this.insertLink("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700&family=Raleway:wght@400;600;700&display=swap");
                this.insertLink("https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0");

                let images = document.querySelectorAll("img[src*='images/']");
                for (let i = 0; i < images.length; i++) {
                    let oldSrc = images[i].src;
                    images[i].src = oldSrc.replace(/images\/(.*)/, this.uncompressedImagesPath + "/$1");
                }

                // changement du font
                document.querySelector(':root').style.setProperty('--font-title', 'Raleway');
                document.querySelector(':root').style.setProperty('--font-text', 'DM Sans');
            }
        })

        window.addEventListener('load', (event) => {
            console.log('La page est complètement chargée');
            document.getElementById('body').style.visibility = 'visible';
        });
    }

    /**
     * Insère un lien vers une feuille de styles dans l'en-tête du document.
     *
     * @function
     * @name insertLnk
     *  * @param {string} path - Le chemin vers la feuille de styles.
     *  *
     *  * @returns {void}
     *  */
    insertLink(path) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = path;
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    /**
     * Calcule le poids total de la page et l'affiche dans la console.
     *
     * @function
     * @name calculatePageWeight
     *
     * @returns {void}
     */
    calculatePageWeight() {
        let totalSize = 0;
        let resources = performance.getEntriesByType("resource");

        resources.forEach(resource => {
            totalSize += resource.transferSize;
        });

        this.totalWeight += totalSize;
        console.log("Total page weight: " + totalSize / 1000 + " MB");
    }

    /**
     * Enregistre le poids total de la page dans la session storage.
     *
     * @function
     * @name saveTotalWeight
     *
     * @returns {void}
     */
    saveTotalWeight() {
        sessionStorage.setItem('total-weight', this.totalWeight);
    }

    /**
     * Affiche des informations sur la bande passante dans l'élément HTML spécifié.
     *
     * @function
     * @name displayBandwidthInfo
     *
     * @returns {void}
     */
    displayBandwidthInfo() {
        const bandwidthInfoElement = document.querySelector('.bandwidth-info');
        const totalWeightInMB = (this.totalWeight / 1000).toFixed(2);
        const ecoModeStatus = this.ecoModeEnabled ? 'activé' : 'désactivé';
        bandwidthInfoElement.innerHTML = `
                <p>Mode éco-responsable: ${ecoModeStatus}</p>
                <p>Poids total de la page: ${totalWeightInMB} MB</p>
            `;
    }

    webConsumption() {
        // Get total bytes sent and received by the browser
        const totalBytes = window.performance.getEntriesByType("navigation")[0].transferSize;

        // Convert bytes to kilobytes
        const totalKilobytes = totalBytes / 1024;

        // Get network information from the browser
        const networkInfo = navigator.connection;

        // Get effective type of the connection
        const effectiveType = networkInfo.effectiveType;

        // Get approximate round-trip time (in milliseconds)
        const rtt = networkInfo.rtt;

        // Get downlink speed (in megabits per second)
        const downlinkSpeed = networkInfo.downlink;

        // Create object to store all statistics
        const stats = {
            totalKilobytes,
            effectiveType,
            rtt,
            downlinkSpeed
        };

        // Log the statistics object
        console.log(stats);

    }

    getNetworkMeasure = () => {
        // get all performance entries
        const entries = window.performance.getEntries();

        // filter out non-resource entries
        const resourceEntries = entries.filter(
            entry => entry instanceof PerformanceResourceTiming
        );

        // get the total transfer size of network resources
        const networkResourcesSize = resourceEntries.reduce(
            (totalSize, resource) => totalSize + resource.transferSize,
            0
        );

        console.log(
            `Taille des ressources réseau: ${(networkResourcesSize / 1024).toFixed(2)} Ko`
        );
    };

    getResourcesMeasure = async () => {
        const dataElements = document.querySelectorAll('[src], [href]');

        // Calcule la taille totale des ressources de données
        let dataResourcesSize = 0;
        for (let element of dataElements) {
            const url = element.src || element.href;
            const response = await fetch(url);
            const body = await response.blob();
            dataResourcesSize += body.size;
        }

        // Calcule le nombre de requêtes, la taille de la page et la taille du DOM
        const pageRequests = dataElements.length;
        const pageSize = (dataResourcesSize / 1024).toFixed(2);
        const domSize = (document.documentElement.outerHTML.length / 1024).toFixed(2);

        console.log(
            `Nombre de requêtes : ${pageRequests}, Taille de la page : ${pageSize} Ko (${domSize} Ko)`
        );
    };

    getNetworkAndDataMeasure = () => {
        // récupérer toutes les entrées de performances
        const entries = window.performance.getEntries();

        // filtrer les entrées pour ne garder que les ressources
        const resourceEntries = entries.filter(
            entry => entry instanceof PerformanceResourceTiming
        );

        // filtrer les entrées pour ne garder que les ressources de données
        const dataEntries = resourceEntries.filter(
            entry => entry.contentType && entry.contentType.startsWith('text/')
        );

        // calculer la taille totale des ressources réseau
        const networkResourcesSize = resourceEntries.reduce(
            (totalSize, resource) => totalSize + resource.transferSize,
            0
        );

        // TEMP
        console.log(resourceEntries);

        // calculer la taille totale des ressources de données
        const dataResourcesSize = dataEntries.reduce(
            (totalSize, resource) => totalSize + resource.transferSize,
            0
        );

        // retourner l'objet avec les informations sur les ressources
        return {
            networkResourcesSize: `${(networkResourcesSize / 1024).toFixed(2)} Ko`,
            dataResourcesSize: `${(dataResourcesSize / 1024).toFixed(2)} Ko`
        };
    };

}

export default EcoButton;