
// Confirm job form & confirm jod form and add new job & payment 
;(function() {
document.addEventListener("DOMContentLoaded", () => {

//Global variable for client secret
let paymentId;

// -----------stripe-----------

// This is your test publishable API key.
const stripe = Stripe("pk_test_51NzEgZJmqBSOfS19HrwVgYkYam9FXWK7vNnXl12Iu5CLaGYRlbqcXWUuu7TgbZkPT7Yw8pGWkyS6tDmDq0lJ7p3Y00DwTFljfY");

// The items the customer wants to buy
const items = [{ id: "price_1NzVxcJmqBSOfS19ZyemESh8" }];

let elements;

initialize();
checkStatus();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

let emailAddress = '';
// Fetches a payment intent and captures the client secret
async function initialize() {
  const response = await fetch("https://dev--stripe-backend--sarimpro.autocode.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
	
  const { clientSecret } = await response.json();
  
  paymentId = clientSecret;

  //put client secret into hidden input to sent it to Autocode
  document.querySelector('#paymentid').value = clientSecret;
  
  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const linkAuthenticationElement = elements.create("linkAuthentication");
  linkAuthenticationElement.mount("#link-authentication-element");

  linkAuthenticationElement.on('change', (event) => {
    emailAddress = event.value.email;
  });

  const paymentElementOptions = {
    layout: "tabs",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  
  //Send info to Autocode to create CMS item
  await sendInfoToAutocode()
  .then(function (data) {
    console.log('Успех', JSON.parse(data));
    alert('Успех');
  })
  .catch(function (error) {
    console.error('Ошибка', error);
    alert('Ошибка');
  });
  
  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      // Make sure to change this to your payment completion page
      return_url: window.location.href,
      receipt_email: emailAddress,
    },
  });

  
  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }


  setLoading(false);
}

// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":

    //////confirm payment in CMS
    const xhr = new XMLHttpRequest();
  	const url = 'https://dev--test2--sarimpro.autocode.dev/';

  	xhr.open('POST', url, true);

  	xhr.onreadystatechange = function() {
    	if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      	const response = JSON.parse(xhr.responseText);
      	console.log(response);
    	}
  	};

  	xhr.send(JSON.stringify({paymentid: clientSecret}));
    //////

      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}

//-----------stripe end-----------



//get all the elements
  let confirmBtn3 = document.querySelector('#confirm-btn-3');
  let confirmBtn4 = document.querySelector('#confirm-btn-4');
  let form2 = document.querySelector('.form__form-2');
  let formInfo2 = document.querySelector('#job-description-form');
  let formPreview2 = document.querySelector('.form__preview-2');
  let postAnotherBtn = document.querySelector('#post-another-vacancy');
  let editBtn4 = document.querySelector('#edit-btn-4');
  let paymentForm = document.querySelector('.form__payment');
  
  let jobCategorySelect = document.querySelector('#job-category');
  let jobTitleInput = document.querySelector('#job-title');
  let jobSalaryInput = document.querySelector('#job-salary');
  let jobCountrySelect = document.querySelector('#job-country');
  let jobDescriptionTextarea = document.querySelector('#job-description');
  let jobDescriptionEditor = document.querySelector('.ql-editor');
  let companyNameInput = document.querySelector('#company-name');
  let jobTypeRadio = document.querySelectorAll('input[name="type"]');
  let jobsTextarea = document.querySelector('#jobs-textarea');
    
  let jobTitle = document.querySelector('.job-popup__title');
  let jobSalary = document.querySelector('.job-popup__salary');
  let jobCountry = document.querySelector('.job-popup__country');
  let jobDescription = document.querySelector('.job-popup__info');
  let companyName = document.querySelector('.job-popup__company');
  let jobType = document.querySelector('.job-popup__type');
  
  let jobCategoryHint = document.querySelector('.form__hint--job-category');
  let jobTitleHint = document.querySelector('.form__hint--job-title');
  let jobSalaryHint = document.querySelector('.form__hint--job-salary');
  let jobCountryHint = document.querySelector('.form__hint--job-country');
  let jobDescriptionHint = document.querySelector('.form__hint--job-description');
  let jobTypeHint = document.querySelector('.form__hint--job-type');
  let jobAmountText = document.querySelector('.job-popup__job-amount');
  
  // Confirm job form
  confirmBtn3.addEventListener('click', () => {
  	if (!valideteForm2()) return;
    
    companyName.innerText = companyNameInput.value;
    jobTitle.innerText = jobTitleInput.value;
    jobSalary.innerText = jobSalaryInput.value;
    jobCountry.innerText = jobCountrySelect.value;
    for (let radio of jobTypeRadio) {
    	if (radio.checked == true) {
      	jobType.innerText = radio.value;
      }
    }
    
    jobDescriptionTextarea.value = jobDescriptionEditor.innerHTML;
    jobDescription.innerHTML = jobDescriptionEditor.innerHTML;
    
    jobAmountText.innerText = jobsArr.length + 1;
     
    form2.style.display = 'none';
    formPreview2.style.display = 'block';
  })
  
  function valideteForm2() {
   	let flag = true;
    
   	if (jobCategorySelect.value === '') {
    	jobCategoryHint.style.display = 'block';
    	flag = false;
    } else {
    	jobCategoryHint.style.display = 'none';
    }
    
    if (jobTitleInput.value === '') {
      jobTitleHint.style.display = 'block';
    	flag = false;  
    } else {
    	jobTitleHint.style.display = 'none';
    }
    
    if (jobSalaryInput.value === '') {
    	jobSalaryHint.style.display = 'block';
    	flag = false;
    } else {
    	jobSalaryHint.style.display = 'none';
    }
    
    if (jobCountrySelect.value === '') {
    	jobCountryHint.style.display = 'block';
    	flag = false;
    } else {
    	jobCountryHint.style.display = 'none';
    }
    
    if (jobTypeRadio[0].checked === false && jobTypeRadio[1].checked === false) {
    	jobTypeHint.style.display = 'block';
    	flag = false;
    } else {
    	jobTypeHint.style.display = 'none';
    }
    
    if (jobDescriptionEditor.innerHTML == '<p><br></p>') {
    	jobDescriptionHint.style.display = 'block';
    	flag = false;
    } else {
    	jobDescriptionHint.style.display = 'none';
    }
    
    return flag;
  }
  
  // Confirm jod form and add new job
  postAnotherBtn.addEventListener('click', () => {
  	const formObject = formToObject(formInfo2);
		jobsArr.push(formObject);
    
    clearForm2();

  	formPreview2.style.display = 'none';
    form2.style.display = 'block'; 
    
    console.log(jobsArr);
	})
  
  // Edit job form
  editBtn4.addEventListener('click', () => {
  	formPreview2.style.display = 'none';
    form2.style.display = 'block';
  })
  
 	// Confirm everything
  confirmBtn4.addEventListener('click', () => {
  	const formObject = formToObject(formInfo2);
		jobsArr.push(formObject);
    
    jobsTextarea.value = JSON.stringify(jobsArr);
    
    //go to payment
    formPreview2.style.display = 'none';
    paymentForm.style.display = 'block'; 
	})
  
  function formToObject(form) {
	  const formData = new FormData(form);
  	const formObject = {};

  	for (let [key, value] of formData.entries()) {
    	formObject[key] = value;
  	}
    
  	return formObject;
	}
  
  function clearForm2() {
  	jobCategorySelect.selectedIndex = '0';
  	jobTitleInput.value = '';
  	jobSalaryInput.value = '';
  	jobCountrySelect.selectedIndex = '0';
  	jobDescriptionTextarea.value = '';
  	jobDescriptionEditor.innerHTML = '<p><br></p>';
  	for (let radio of jobTypeRadio) {
    	radio.checked = false;
      radio.previousElementSibling.classList.remove('w--redirected-checked');
    }
  }
  
  async function sendInfoToAutocode() {   
    return new Promise(function (resolve, reject) {
      let mainForm = document.querySelector('#main-form');
      const formData = new FormData(mainForm);

      const xhr = new XMLHttpRequest();
      const url = 'https://dev--create-new-items--sarimpro.autocode.dev/'       
      xhr.open('POST', url, true);

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.response);
        } else {
          reject(xhr.statusText);
        }
      };

      xhr.onerror = function () {
        reject(xhr.statusText);
      };

  	  xhr.send(formData);
    });
  }
  
})
})();