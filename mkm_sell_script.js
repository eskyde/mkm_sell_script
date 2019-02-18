// ==UserScript==
// @name         MKM helper script
// @namespace    eskyde
// @version      0.2
// @description  try to take over the world!
// @author       eskyde
// @match        https://www.cardmarket.com/de/Magic/Products/Einzelkarten*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    let gConfigMarkup = `
        <div id="tt-sell-options" class="form-group row">
            <label class="col-form-label col-form-label-sm col col-md-5 col-xl-4">Verkaufsoptionen
            </label>

            <div class="col col-md-7 col-xl-8">
                <select name="tt-options" size="1" id="tt-options" class="form-control form-control-sm">
                    <option value="1" selected="selected">Aus Deutschland</option>
                    <option value="2">Trending</option>
                 </select>

                 <input id="tt-get-price" type="" value="Preis einstellen" title="Preis einstellen" class="btn btn-secondary btn-block btn-sm">
            </div>
        </div>`;

    const $sellTab = $('#tabContent-sell');

    const LANGUAGE_MAPPING = {
        '1': 'Englisch',
        '2': 'Französisch',
        '3': 'Deutsch',
        '4': 'Spanisch',
        '5': 'Italienisch',
        '6': 'S-Chinesisch',
        '7': 'Japanisch',
        '8': 'Portugiesisch',
        '9': 'Russisch',
        '10': 'Koreanisch',
        '11': 'T-Chinesisch'
    }

    const CONDITION_MAPPING = {
        'MT': 'Mint',
        'NM': 'Near Mint',
        'EX': 'Excellent',
        'GD': 'Good',
        'LP': 'Light Played',
        'PL': 'Played',
        'PO': 'Poor'
    }

    const CONDITION_RATING = [
        'Mint',
        'Near Mint',
        'Excellent',
        'Good',
        'Light Played',
        'Played',
        'Poor'
    ];

    // make sell window scrollable due to added sell options
    $sellTab.css({
        'overflow-y': 'auto'
    });

    // fugly but hey \o/
    $sellTab.find('form').append(gConfigMarkup);

    // activate on price label click
    $('#tt-get-price').on('click', function () {

        let $sellForm = $sellTab.find('form');

        let lLanguage = LANGUAGE_MAPPING[$sellForm.find('#language option:selected').val()];

        if (lLanguage == null) {
            alert('Unknown Language: ' + lLanguage);
            return;
        }

        let lCondition = CONDITION_MAPPING[$sellForm.find('#condition option:selected').val()];

        if (lCondition == null) {
            alert('Unknown Condition: ' + lCondition);
            return;
        }

        let sellOption = $('#tt-options option:selected').val();
        let lFoundHelper = false;

        let $priceBox = null;
        let $productPrice = null;

        if (sellOption === '1') { // Option: from Germany

            // table row element variables
            let $rowElement = null;
            let $sellerLocation = null;
            let $productAttributes = null;
            let $productCondition = null;
            let $productLanguage = null;

            $('.table-body .article-row').each(function () {
                // FIND the correct pricing out of the table here
                $rowElement = $(this);

                $sellerLocation = $rowElement.find('.seller-info').find('span[data-original-title^="Artikelstandort:"]').attr('data-original-title');

                // if card is sold from Germany
                if ($sellerLocation.indexOf('Deutschland') !== -1) {

                    // get product attribs
                    $productAttributes = $rowElement.find('.product-attributes').find('span');

                    $productCondition = $productAttributes[0].getAttribute('data-original-title');
                    $productLanguage = $productAttributes[1].getAttribute('data-original-title');;

                    // if it's the same langauge and at least the same condition
                    if ($productLanguage === lLanguage && (CONDITION_RATING.indexOf($productCondition) <= CONDITION_RATING.indexOf(lCondition))) {

                        $priceBox = $rowElement.find('.price-container span');

                        // and it's not a playset price
                        if ($priceBox.children().length === 0) {
                            // replace commas and cut the currency char at the end
                            $productPrice = $priceBox.text().replace(',', '.').split(' ')[0];

                            // put text n value
                            $('#price').text($productPrice);
                            $('#price').val($productPrice);

                            console.log('Preis gefunden: ' + $productPrice);

                            lFoundHelper = true;

                            // JQuery break
                            return false;
                        }
                    }
                }

            }); // $each

        } else if (sellOption === '2') { // Option: trending price

            // this option always finds a price
            lFoundHelper = true;

            $('#tabContent-info').find('.labeled dd span').each(function () {
                let lElem = $(this);
                let lText = lElem.text();
                if (lText.indexOf('€') !== -1) {
                    $productPrice = lText.replace(',', '.').split(' ')[0];
                    $('#price').text($productPrice);
                    $('#price').val($productPrice);

                    // JQuery break
                    return false;
                }
            }); // $each

        }

        window.setTimeout(function () {
            if (!lFoundHelper) {
                alert(`Es gibt in der Liste keine Angebote aus Deutschland, die den Kriterien entsprechen.\n\nStell evtl. den Location-Filter auf 'Nur Verkäufer aus Deutschland anzeigen' oder füge weitere Verkäufer zur Liste hinzu (Button ganz unten), um einen Preis berechnen zu können und versuche es erneut.`);
            }
        }, 500);
    }) // $onclick

})();