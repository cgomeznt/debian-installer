if (document.all) {
  document.getElementById = IE_getElementById;
  IS_IE = 1;
} else {
  IS_IE = 0;
}

function toggle(div_id) {
  var adiv = document.getElementById(div_id);

  if (adiv.style.display == "block") {
    adiv.style.display = "none";
  } else {
    adiv.style.display = "block";
  }


  var e = IS_IE ? window.event : this;
  if (e) {
    if (IS_IE) {
      e.cancelBubble = true;
      e.returnValue = false;
      return false;
    } else {
      return false;
    }
  }
}

var spam_number = 0;

function openSpamFrame(elem) {
  spam_number++;
  if (spam_number > 2) {
    return fastSpam(elem);
  }
  var div = document.createElement("div");
  div.innerHTML = "<div class=\"popup\"><iframe width=750px height=350px src=\"" + elem.action + ":nomenu\"></iframe><br>" + 
    "<button onclick=\"this.parentNode.parentNode.removeChild(this.parentNode);\">Close</button></div>";
  document.body.appendChild(div.firstChild);  
  return false;
}

function fastSpam(elem) {
  var div = document.createElement("div");
  div.innerHTML = "<span class=\"fastspam\"><img alt=\"\" width=16px height=16px border=0 src=\"" + elem.action + ":autoconfirm\" class=\"fastspam\"></span>";
  inputs = elem.getElementsByTagName("input");
  /* Update all the aux charts that are switched on. */
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].value = "Revert spam report";
  }
  var regexp = new RegExp("spam.gmane.org");
  elem.action = elem.action.replace(regexp, "unspam.gmane.org");
  elem.onsubmit = "openSpamFrame(this); return false;";
  elem.appendChild(div.firstChild);  
  return false;
}
