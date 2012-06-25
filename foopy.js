var groupNode;
var choiceIndex = [];
var choices = [];
var stack = [];

function updateCurrentChoice() {
  var content = $('#content')[0];
  content.innerHTML = $('.choices li', groupNode)[choices[choices.length - 1][choiceIndex[choiceIndex.length - 1]]].innerHTML;
  $('#next')[0].firstChild.textContent = chooseNegativeResponse();
}

function nextChoice() {
  choiceIndex[choiceIndex.length - 1]++;
  if (choiceIndex[choiceIndex.length - 1] == $('.choices li', groupNode).length)
    choiceIndex[choiceIndex.length - 1] = 0;
  updateCurrentChoice();
}

function chooseNegativeResponse() {
  var responses = ["No, not interested", "Show me something else", "Boring",
                   "Pffft, whatever", "Not my line of expertise", "Keep going"];
  return responses[Math.floor(Math.random() * responses.length)];
}

function switchGroup(group) {
  groupNode = document.getElementById(group);
  if (!stack.length || stack[stack.length - 1] != group) {
    stack.push(group);
    choiceIndex.push(0);

    //+ Jonas Raoni Soares Silva
    //@ http://jsfromhell.com/array/shuffle [rev. #1]
    function shuffle(v){
      for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
      return v;
    };

    var c = [];
    for (var i = 0; i < $('.choices li', groupNode).length; i++)
      c.push(i);
    choices.push(shuffle(c));
  }
  $('#back')[0].style.display = group == 'proglang' ? 'none' : 'block';
  $('#question-display')[0].innerHTML = $('.question', groupNode)[0].outerHTML;
  updateCurrentChoice();
}

function investigate() {
  var choice = $('.choices li', groupNode)[choices[choices.length - 1][choiceIndex[choiceIndex.length - 1]]];
  if (choice.hasAttribute('next-group')) {
    switchGroup(choice.getAttribute('next-group'));
  } else {
    window.open(choice.getAttribute('target'));
  }
}

function takeBack() {
  stack.splice(stack.length - 1, 1);
  choiceIndex.splice(choiceIndex.length - 1, 1);
  choices.splice(choices.length - 1, 1);
  switchGroup(stack[stack.length - 1]);
}

$(window).load(function() {
  $('#ok')[0].onclick = investigate;
  $('#next')[0].onclick = nextChoice;
  $('#back')[0].onclick = takeBack;

  switchGroup('proglang');
});