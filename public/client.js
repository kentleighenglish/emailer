// client-side js

const form = document.forms[0];
const inputs = form.querySelectorAll('input,textarea');
const button = document.getElementById('submitForm');
const successMessage = document.getElementById('successMessage');

const data = {
};

function updateFormData(key, value) {
  data[key] = value;
  
  const input = document.querySelector('input[name="'+key+'"],textarea[name="'+key+'"]');
  
  input.value = data[key];
}

function sendForm() {
  const xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState === 4) {
      if (this.status == 200) {
        const response = JSON.parse(xhttp.responseText);

        if (response.success) {
          button.setAttribute('disabled', false);
          successMessage.style.display = 'block';
          form.style.display = 'none';
        } else {
          button.setAttribute('disabled', false);
        }
      }
    }
  };
  xhttp.open("POST", '/submit', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(JSON.stringify(data));
}

// iterate through every dream and add it to our page
inputs.forEach(function(input) {
  updateFormData(input.name, input.value);
  input.addEventListener('input', function(event) {
    updateFormData(input.name, event.target.value);
  });
});

// listen for the form to be submitted and add a new dream when it is
form.onsubmit = function(event) {
  // stop our form submission from refreshing the page
  event.preventDefault();
  button.setAttribute('disabled', true);
  
  sendForm();
};
