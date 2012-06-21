var groupNode;
var choiceIndex = [];
var stack = [];

function updateCurrentChoice() {
  var content = $('#content')[0];
  content.innerHTML = $('.choices li', groupNode)[choiceIndex[choiceIndex.length - 1]].innerHTML;
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
  if (!stack.length || stack[stack.length - 1] != group) {
    stack.push(group);
    choiceIndex.push(0);
  }
  $('#back')[0].style.display = group == 'proglang' ? 'none' : 'block';
  groupNode = document.getElementById(group);
  $('#question-display')[0].innerHTML = $('.question', groupNode)[0].outerHTML;
  updateCurrentChoice();
}

function investigate() {
  var choice = $('.choices li', groupNode)[choiceIndex[choiceIndex.length - 1]];
  if (choice.hasAttribute('next-group')) {
    switchGroup(choice.getAttribute('next-group'));
  } else {
    window.open(choice.getAttribute('target'));
  }
}

function takeBack() {
  stack.splice(stack.length - 1, 1);
  choiceIndex.splice(choiceIndex.length - 1, 1);
  switchGroup(stack[stack.length - 1]);
}

$(window).load(function() {
  $('#ok')[0].onclick = investigate;
  $('#next')[0].onclick = nextChoice;
  $('#back')[0].onclick = takeBack;

  switchGroup('proglang');
});