function linkify(text) {
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>';
  });
}

function stripDoubleQuotes(text){
  return text.replace(/"/g, '&quot;');
}