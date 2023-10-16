
// Confirm job form & confirm jod form and add new job & payment 
;(function() {
document.addEventListener("DOMContentLoaded", () => {

// Necessary to prevent re-creation of a post in the collection if the payment card has not been validated
let isFormAlreadySend = false;



// -----------stripe-----------

let products = {
  "30" : { id: "price_1O0iHQJmqBSOfS191Qq95EOk" },
  "60" : { id: "price_1O0iIDJmqBSOfS191E4mZfOv" },
  "90" : { id: "price_1O0iIkJmqBSOfS19nUN5ubxN" },
}

let prices = {
  "30" : 500,
  "60" : 900,
  "90" : 1300,
}

// This is your test publishable API key.
const stripe = Stripe("pk_test_51NzEgZJmqBSOfS19HrwVgYkYam9FXWK7vNnXl12Iu5CLaGYRlbqcXWUuu7TgbZkPT7Yw8pGWkyS6tDmDq0lJ7p3Y00DwTFljfY");

// The items the customer wants to buy
const items = [];

let elements;

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

  //put client secret into hidden input to sent it to Autocode
  document.querySelector('#paymentid').value = clientSecret;
  
  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#68E053',
      borderRadius: '0px',
    },
    rules: {
      '.Label': {
        fontWeight: '700',
        paddingBottom: '8px'
      },
      '.Input': {
        padding: '16px',
        paddingBottom: '8px'
      },
    }
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
  showLoader();
  
  //Send info to Autocode to create CMS item
  await sendInfoToAutocode()
  .then(async function (data) {
    console.log('The new job post has been added to Webflow CMS', data);
    alert('Успех');

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
    hideLoader();
  })
  .catch(function (error) {
    console.error('Error adding the new job post to Webflow CMS, check the autocode function', error);
    alert('Ошибка');
    showMessage("Something went wrong when adding a new job. Check that the information is correct and try again later.");
    setLoading(false);
    hideLoader();
    return;
  });
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
  	const url = 'https://dev--confirm-payment--sarimpro.autocode.dev/';

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
  }, 10000);
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
  let paymentOptionsForm = document.querySelector('.form__payment-options');
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

  let termSelect = document.querySelector('#term-select');
  let termInput = document.querySelector('#term-input');
  let confirmTermBtn = document.querySelector('#confirm-term-btn');
  let postsNumberText = document.querySelector('.form__options-posts-number');
  let summary = document.querySelector('.form__options-summary-amount--js');
  let postsSummary = document.querySelector('.form__options-posts-amount--js');

  let point22 = document.querySelector('.progress__point-2--2');
  let point32 = document.querySelector('.progress__point-3--2');
  let point13 = document.querySelector('.progress__point-1--3');
  let point23 = document.querySelector('.progress__point-2--3');
  let progressLine = document.querySelector('.form__progress-line');
  let poinText2 = document.querySelector('.progress__point-text-2');
  let poinText3 = document.querySelector('.progress__point-text-3');
  
  let loader = document.querySelector('#loader');
  let body = document.querySelector('body');


  function showLoader() {
    loader.style.display = 'flex';
    body.style.overflow = 'hidden';
  }

  function hideLoader() {
    loader.style.display = 'none';
    body.style.overflow = 'auto';
  }

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
    
    console.log(jobsArr); //delete later
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

    //display number of job posts and summary
    postsNumberText.innerText = jobsArr.length;
    postsSummary.innerText = jobsArr.length * prices['30'];
    summary.innerText = jobsArr.length * prices['30'];
    
    //go to payment options
    formPreview2.style.display = 'none';
    paymentOptionsForm.style.display = 'block'; 
	})
  
  //convert form data to object
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

  //change term select function
  termSelect.addEventListener('change', () => {
    termInput.value = termSelect.value;
    
    //change summary
    if (termSelect.value === '30') {
      postsSummary.innerText = jobsArr.length * prices['30'];
      summary.innerText = jobsArr.length * prices['30'];
    } else if (termSelect.value === '60') {
      postsSummary.innerText = jobsArr.length * prices['60'];
      summary.innerText = jobsArr.length * prices['60'];
    } else if (termSelect.value === '90') {
      postsSummary.innerText = jobsArr.length * prices['90'];
      summary.innerText = jobsArr.length * prices['90'];
    }   
  });

  function removeUnnecessaryElements() {
    postAnotherBtn.remove();
    editBtn4.remove();
    confirmBtn4.remove();
    termSelect.remove();
    confirmTermBtn.remove();
  }

  //go to the stripe form
  confirmTermBtn.addEventListener('click', async () => {
    showLoader();
    let term = termInput.value;

    //add items to items array to initialize stripe payment
    for (let i = 0; i < jobsArr.length; i++) {
      items.push(products[term]);
    }

    //initialize stripe payment
    await initialize();

    //remove unnecessary elements to prevent cheating
    removeUnnecessaryElements();

    //go to payment
    paymentOptionsForm.style.display = 'none';
    paymentForm.style.display = 'block'; 

    hideLoader();

    //change progress line
    point22.style.display = 'none';
    point32.style.display = 'block';
    point13.style.display = 'none';
    point23.style.display = 'block';
    
    poinText2.style.color = '#9c9c9c';
    poinText3.style.color = '#68e053';
    
    progressLine.style.width = '100%';
  });

  
  async function sendInfoToAutocode() {  
    //This part will be executed if the job post has already been created earlier, but the first payment attempt did not go through 
    if (isFormAlreadySend) {
      return new Promise((resolve, reject) => {
        resolve("The job post already created!");
      });
    }

    // Send info to Autocode and create a new job post
    return new Promise(function (resolve, reject) {
      let mainForm = document.querySelector('#main-form');
      const formData = new FormData(mainForm);

      // del
      console.log(items);
      alert(termInput.value);
      //

      const xhr = new XMLHttpRequest();
      const url = 'https://dev--create-new-items--sarimpro.autocode.dev/'       
      xhr.open('POST', url, true);

      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          isFormAlreadySend = true;
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