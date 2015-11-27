$(document).ready(function() {

    var formHeight = $('.welcome').outerHeight();
    var welcomeHeight = $('.welcome').height();
    // Create function to have matched heights
    function getFormHeight() {
        $('.welcome').css("height", welcomeHeight);
        $('#form').css("min-height", formHeight);
    }

    function changeWelcomeHeight() {
        var newWelcomeHeight = $('#form').height();
    }

    // Run our function to get heights
    getFormHeight();

    // Fade and Show elements when 'share your ideas' button clicked
    $('.show').on('click', function() {
        $('.fade').fadeOut();
        $('#form').delay(300).fadeIn();
    });

    // Fade and Show elements when 'close' button clicked
    $('.close').on('click', function() {
        $('#form').fadeOut();
        $('.fade').fadeIn();
    });

    $(window).resize(function() {
        if ($('#form').css('display') != 'none') {
            changeWelcomeHeight();
        }
    });

    $("#verify").on('click', function() {

        $("#debug").append("<p>Connexion au serveur ...</p>")
        var browserdata = getBrowserData()

        $.post('/unique', { fingerprint : browserdata}, function(reponse) {
            $("#debug").append("<p>Réponse du serveur</p>")

            if(reponse.cle){
                $("#debug").append('<p>Clé : ' + reponse.cle.data + ' ('+reponse.cle.size+' bits)</p>')   
            }
            
            if(reponse.valeur){
                $("#debug").append('<p>Valeur : ' + (reponse.valeur.data).substring(0,100)+'...' + ' ('+reponse.valeur.size+' bits)</p>')   
            }

            if(reponse.unique){
                $("#result").css({'color':'green'})
                $("#result").html('Vous n\'êtes jamais venu :)')
            }else{
                $("#result").css({'color':'orange'})
                $("#result").html('Vous êtes déjà venu :(<br/> Taux de correspondance : '+reponse.corresp+'%<br/>Dernière visite : '+ new Date(reponse.last).toLocaleString())
            }
        });

    })

    function getBrowserData() {
        var result = serialize(navigator)
        return result
    }

    function serialize(object) {
        var type = typeof object;
        if (object === null) {
            return '"nullValue"';
        }
        if (type == 'string' || type === 'number' || type === 'boolean') {
            return '"' + object + '"';
        } else if (type === 'function') {
            return '"functionValue"';
        } else if (type === 'object') {
            var output = '{';
            for (var item in object) {
                try {
                    if (item !== 'enabledPlugin') {
                        output += '"' + item + '":' + serialize(object[item]) + ',';
                    }
                } catch (e) {}
            }
            return output.replace(/\,$/, '') + '}';
        } else if (type === 'undefined') {
            return '"undefinedError"';
        } else {
            return '"unknownTypeError"';
        }
    }

});