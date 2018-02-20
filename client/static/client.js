window.onload = function() {
  fetch('/api/connect').then((response) => {
    return response.json();
  }).then((data) => {
    console.log(data);
    document.body.innerHTML = data.message;
  }).catch((error) => {
    console.error('error!', error);
  });
};
