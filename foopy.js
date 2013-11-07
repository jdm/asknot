(function($) {
    var groupNode;
    var choiceIndex = [];
    var choices     = [];
    var stack       = [];

    function chooseNegativeResponse() {
        var responses = $('.negative').not('.visible');

        return responses[Math.floor(Math.random() * responses.length)];
    }

    function updateNegativeResponse() {
        var negative = chooseNegativeResponse();

        $($('.negative.visible')[0]).removeClass('visible');
        $(negative).addClass('visible');
    }

    function updateCurrentChoice(lastIndex) {
        var lastChoice = $('.choices li', groupNode)[choices[choices.length - 1][lastIndex]];
        var choice     = $('.choices li', groupNode)[choices[choices.length - 1][choiceIndex[choiceIndex.length - 1]]];

        updateNegativeResponse();
        lastChoice.style.display = 'none';
        choice.style.display = 'inline';
        $('#ok')[0].firstChild.href = choice.hasAttribute('next-group') ?
            '' : choice.getAttribute('target');

        setLocationHashSuffix(getUIDAttribute(choice));
    }

    function nextChoice() {
        var lastIndex = choiceIndex[choiceIndex.length - 1];

        choiceIndex[choiceIndex.length - 1]++;
        if (choiceIndex[choiceIndex.length - 1] === $('.choices li', groupNode).length) {
            choiceIndex[choiceIndex.length - 1] = 0;
        }
        updateCurrentChoice(lastIndex);
    }

    function switchGroup(group, choiceId) {
        groupNode = document.getElementById(group);

        if (!stack.length || stack[stack.length - 1] !== group || choiceId) {
          if ( stack.indexOf(group) < 0 ) {
            stack.push(group);
          }

          if ( ! choiceId ) {
            choiceIndex.push(0);
          }

          setGroupChoices(group, choiceId);
        }

        $('#back')[0].style.display = group === 'proglang' ? 'none' : 'block';
        $('#next')[0].style.display = group !== 'proglang' && choices[choices.length - 1].length == 1 ? 'none' : 'block';
        $('.question', groupNode)[0].style.display = 'block';
        updateCurrentChoice(choiceIndex[choiceIndex.length - 1]);
    }

    function cleanUpCurrent() {
        if (!groupNode) {
            return;
        }
        $('.question', groupNode)[0].style.display = 'none';
        var lastChoice = $('.choices li', groupNode)[choices[choices.length - 1][choiceIndex[choiceIndex.length - 1]]];
        lastChoice.style.display = 'none';
    }

    function investigate(ev) {
        ev.preventDefault();
        var choice = $('.choices li', groupNode)[choices[choices.length - 1][choiceIndex[choiceIndex.length - 1]]];
        if (choice.hasAttribute('next-group')) {
            cleanUpCurrent();
            switchGroup(choice.getAttribute('next-group'));
        } else {
            window.open(choice.getAttribute('target'));
        }
    }

    function takeBack() {
        cleanUpCurrent();
        setLocationHashSuffix("");
        stack.splice(stack.length - 1, 1);
        choiceIndex.splice(choiceIndex.length - 1, 1);
        choices.splice(choices.length - 1, 1);
        switchGroup(stack[stack.length - 1]);
    }

    function langChange() {
        document.webL10n.setLanguage(this.value);
        setLocationHashPrefix(this.value);
    }

    function setLocationHashSuffix(value) {
        var langCode = document.webL10n.getLanguage(),
            midValue = stack.join("/");

        window.location.hash = "#!/" + langCode + "/" + midValue + "/" + value;
    }

    function setLocationHashPrefix(value) {
        var prevHash = window.location.hash;

        window.location.hash = prevHash.replace(/\/(.+?)\//, "/" + value + "/")
    }

    function setGroupChoices(group, choiceId) {

        //+ Jonas Raoni Soares Silva
        //@ http://jsfromhell.com/array/shuffle [rev. #1]
        function shuffle(v) {
            for (var j, x, i = v.length; i; j = parseInt(Math.random() * i, 10), x = v[--i], v[i] = v[j], v[j] = x){}
            return v;
        }

        var collector = [],
            elements  = $('.choices li', groupNode),
            memo      = 0;

        for (var i = 0; i < elements.length; i++) {
            if (choiceId && getUIDAttribute(elements[i]) == choiceId) {
              memo = i;
            }

            collector.push(i);
        }

        collector = shuffle(collector)

        if (choiceId) {
          choiceIndex.push(collector.indexOf(memo));
        }

        choices.push(collector);
    }

    function getUIDAttribute(choice) {
      return choice.getAttribute("next-group") || choice.getAttribute("data-choice-id")
    }

    $(window).load(function() {
        $('#ok a:first').on('click', investigate);
        $('#next a:first').on('click', nextChoice);
        $('#back a:first').on('click', takeBack);
        $('#lang select').on('change', langChange);

        // Detected browser language
        var browserLang = document.webL10n.getLanguage();
        // Default language (value of the selected <option> element)
        var defaultLang = $("#lang option:selected").val();

        if (defaultLang !== browserLang) {
            var option = $('#lang option[value=' + browserLang + ']');
            if (option.length) {
                // If the browser language is supported, select the good option
                option.prop('selected', 'selected');
            } else {
                // Else set the default language
                document.webL10n.setLanguage(defaultLang);
            }
        }

        var query = window.location.hash
        if (query.length > 1) {
            var queryParts = query.split("/");

            queryParts.shift(); // #!

            var testLang   = queryParts.shift(),
                testOption = $("#lang select option[value='" + testLang + "']");

            if (testOption.length) {
              // We've got language via location hash, and it is present in l10n
              document.webL10n.setLanguage(testLang);
              testOption.prop("selected", "selected");
            }

            var savedGroup  = "proglang",
                savedChoice = queryParts.pop();

            cleanUpCurrent();

            stack = queryParts.length ? ["proglang"] : [];
            if (queryParts.length) {
              stack = stack.concat(queryParts.slice(1, queryParts.length - 1));

              $.each(queryParts.slice(0, queryParts.length - 1), function(i, v) {
                groupNode = document.getElementById(v);
                setGroupChoices(v, queryParts[i + 1]);
              });

              savedGroup = queryParts.pop();
            }

            switchGroup(savedGroup, savedChoice);
        } else {
            switchGroup('proglang');
        }
    });
})(window.jQuery);
