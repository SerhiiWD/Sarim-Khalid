
// Confirm job form & confirm jod form and add new job & payment 
;(function() {
  document.addEventListener("DOMContentLoaded", () => {
  
  // Necessary to prevent re-creation of a post in the collection if the payment card has not been validated
  let isFormAlreadySend = false;
  
  
  
  // -----------stripe-----------
  
  let products = {
    "30" : { id: "price_1NzVxcJmqBSOfS19ZyemESh8" },
    "60" : { id: "price_1O4iiZJmqBSOfS19WtNBfW6F" },
    "90" : { id: "price_1O4ij3JmqBSOfS19SMFsQ94I" },
    "autorenew" : { id: "price_1O8HlLJmqBSOfS19ccbFvPA4" },
    "highlight" : { id: "price_1O4j3aJmqBSOfS195ZbmRPPX" },
    "autorenew-highlight" : { id: "price_1O9SrwJmqBSOfS19d6DnmCMi" },

    // test
    /*"30" : { id: "price_1O0iHQJmqBSOfS191Qq95EOk" },
    "60" : { id: "price_1O0iIDJmqBSOfS191E4mZfOv" },
    "90" : { id: "price_1O0iIkJmqBSOfS19nUN5ubxN" },
    "autorenew" : { id: "price_1O9UW7JmqBSOfS19ccj8C2cX" },
    "highlight" : { id: "price_1O2VDCJmqBSOfS192KL7TVGZ" },
    "autorenew-highlight" : { id: "price_1O9lfZJmqBSOfS19ndxBMqfM" },*/
  }
  
  let prices = {
    "30" : 500,
    "60" : 900,
    "90" : 1300,
    "autorenew" : 500,
    "highlight" : 50,
    "autorenew-highlight" : 550,
  }
  
  // This is your test publishable API key.
  const stripe = Stripe("pk_live_51NzEgZJmqBSOfS19dmYBUvsFMPlU7CPQ2gtDeGYafblw7soImSsmzhjlZRlmD5CGVflLCBuRFki39uFwJ91vgGfv00gNniE2S6");
  // test
  //const stripe = Stripe("pk_test_51NzEgZJmqBSOfS19HrwVgYkYam9FXWK7vNnXl12Iu5CLaGYRlbqcXWUuu7TgbZkPT7Yw8pGWkyS6tDmDq0lJ7p3Y00DwTFljfY");


  // The items the customer wants to buy
  const items = [];
  
  let elements;
  
  
  function getPricesFromStripe() {
    return fetch('https://dev--get-prices--sarimpro.autocode.dev/')
      .then(response => response.json())
      .then(pricesData => JSON.parse(JSON.stringify(pricesData)))
      .then(formatedPricesData => {
        return formatedPricesData;
      })
      .catch(error => console.error('Error executing get prices request:', error));
  }
  
  async function refreshPrices() {
    try {
      let newPrices = await getPricesFromStripe();
      for (let product in products) {
        for (let newPrice of newPrices) {
          if (products[product].id == newPrice.id) {
            prices[product] = (newPrice.unit_amount / 100);
          }
        }
      }
    } catch (error) {
      console.error('Error in refreshing prices:', error);
    }
  }
  
  // get prices from stripe and refresh
  refreshPrices();
  
  document
    .querySelector("#payment-form")
    .addEventListener("submit", handleSubmit);
  
  let emailAddress = '';
  // Fetches a payment intent and captures the client secret
  async function initialize() {
    let url;
    if (termInput.value == 'autorenew') {
      url = 'https://dev--stripe-subscription-backend--sarimpro.autocode.dev/';
    } else {
      url = 'https://dev--stripe-backend--sarimpro.autocode.dev/';
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items  , email: getCurrentUserEmail()}),
    });

    const data = await response.json();
    const clientSecret = data.clientSecret;
    const subscriptionId = data.subscriptionId;

   
    //put client secret into hidden input to sent it to Autocode
    document.querySelector('#paymentid').value = clientSecret;
    //put subscription id into hidden input to sent it to Autocode
    if (subscriptionId) {
      document.querySelector('#subscriptionid').value = subscriptionId;
    }
    
    const appearance = {
      theme: 'night',
      labels: 'floating',
      variables: {
        colorPrimary: '#68E053',
        colorBackground: '#080808',
      },
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
    showLoader();
    
    //Send info to Autocode to create CMS item
    await sendInfoToAutocode()
    .then(async function (data) {
      console.log('The new job post has been added to Webflow CMS', data);
  
      /* for debugging
      alert('Успех');
      */
  
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          //test
          //return_url: 'https://sarim-khalid-e08a65.webflow.io/success-page',

          return_url: 'https://www.aimljobs.co/success-page',
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
  
      hideLoader();
    })
    .catch(function (error) {
      console.error('Error adding the new job post to Webflow CMS, check the autocode function', error);
  
      /* for debugging
      alert('Ошибка');
      */
  
      showMessage("Something went wrong when adding a new job. Check that the information is correct and try again later.");
      hideLoader();
      return;
    });
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
    let jobApplicationLinkInput = document.querySelector('#link');
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
    let jobApplicationLink = document.querySelector('.job-popup__application');
  
    let jobCategoryHint = document.querySelector('.form__hint--job-category');
    let jobTitleHint = document.querySelector('.form__hint--job-title');
    let jobApplicationLinkHint = document.querySelector('.form__hint--job-application-link');
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
    let highlightSummary = document.querySelector('.form__options-hightlight-amount--js');
    let postsSummary = document.querySelector('.form__options-posts-amount--js');
    let agreeCheckbox = document.querySelector('#agree-checkbox');
    let highlightCheckbox = document.querySelector('#highlight-checkbox');
    let highlightInput = document.querySelector('#highlight-input');
    let agreeCheckboxText = document.querySelector('.form__options-checkbox-text');
  
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
      jobApplicationLink.innerText = jobApplicationLinkInput.value;
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
  
      if (jobApplicationLinkInput.value === '') {
        jobApplicationLinkHint.style.display = 'block';
        flag = false;  
      } else {
        jobApplicationLinkHint.style.display = 'none';
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
      
      /* for debugging
      console.log(jobsArr);
      */
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
      highlightSummary.innerText = jobsArr.length * prices['highlight'];
  
      //show ending 's' in 'posts' word if nessesary
      if (jobsArr.length > 1) {
        document.querySelector('.form__options-posts-ending').style.display = 'block';
      }
      
      //go to payment options
      formPreview2.style.display = 'none';
      paymentOptionsForm.style.display = 'block'; 
  
      //change progress line
      point22.style.display = 'none';
      point32.style.display = 'block';
      point13.style.display = 'none';
      point23.style.display = 'block';
      
      poinText2.style.color = '#9c9c9c';
      poinText3.style.color = '#68e053';
      
      progressLine.style.width = '100%';
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
      jobApplicationLinkInput.value = '';
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
        summary.innerText = (jobsArr.length * prices['30']) + (highlightCheckbox.checked ? (jobsArr.length * prices['highlight']) : 0);
        highlightSummary.innerText = jobsArr.length * prices['highlight'];
      } else if (termSelect.value === '60') {
        postsSummary.innerText = jobsArr.length * prices['60'];
        summary.innerText = (jobsArr.length * prices['60']) + (highlightCheckbox.checked ? (jobsArr.length * prices['highlight'] * 2) : 0);
        highlightSummary.innerText = jobsArr.length * prices['highlight'] * 2;
      } else if (termSelect.value === '90') {
        postsSummary.innerText = jobsArr.length * prices['90'];
        summary.innerText = (jobsArr.length * prices['90']) + (highlightCheckbox.checked ? (jobsArr.length * prices['highlight'] * 3) : 0);
        highlightSummary.innerText = jobsArr.length * prices['highlight'] * 3;
      } else if (termSelect.value === 'autorenew') {
        postsSummary.innerText = jobsArr.length * prices['30'];
        summary.innerText = (jobsArr.length * prices['30']) + (highlightCheckbox.checked ? (jobsArr.length * prices['highlight']) : 0);
        highlightSummary.innerText = jobsArr.length * prices['highlight'];
      }    
    });
  
    //change highlight checkbox function
    highlightCheckbox.addEventListener('change', () => {
      if (highlightCheckbox.checked) {
        highlightInput.value = 'true';
        summary.innerText = +summary.innerText + (jobsArr.length * prices['highlight'] * ((termInput.value / 30) || 1));
      } else {
        highlightInput.value = 'false';
        summary.innerText = +summary.innerText - (jobsArr.length * prices['highlight'] * ((termInput.value / 30) || 1));
      }
    });
    
    function removeUnnecessaryElements() {
      postAnotherBtn.remove();
      editBtn4.remove();
      confirmBtn4.remove();
      termSelect.remove();
      confirmTermBtn.remove();
      highlightCheckbox.remove();
    }
  
    //go to the stripe form
    confirmTermBtn.addEventListener('click', async () => {
      if (!agreeCheckbox.checked) {
        agreeCheckboxText.style.color = '#fff';
        setTimeout(function () {
          agreeCheckboxText.style.color = '#9c9c9c';
        }, 1500);
        return;
      }
  
      showLoader();
      let term = termInput.value;
  
      //add items to items array to initialize stripe payment
      if (termInput.value == 'autorenew') {       
        //add highlight to items array
        if (highlightInput.value === 'true') {
          for (let i = 0; i < jobsArr.length; i++) {
            items.push(products['autorenew-highlight']);
          }
        } else {
          for (let i = 0; i < jobsArr.length; i++) {
            items.push(products['autorenew']);
          }
        }
      } else {
        for (let i = 0; i < jobsArr.length; i++) {
          items.push(products[term]);
        }
    
        //add highlight to items array
        let highlightTerm = +termInput.value / 30;
        if (highlightInput.value === 'true') {
          for (let i = 0; i < (jobsArr.length * highlightTerm); i++) {
            items.push(products['highlight']);
          }
        }
      }
  
      //initialize stripe payment
      await initialize();
  
      //remove unnecessary elements to prevent cheating
      removeUnnecessaryElements();
  
      //go to payment
      paymentOptionsForm.style.display = 'none';
      paymentForm.style.display = 'block'; 
  
      hideLoader();
    });
    
    // returns current user email, if user is not logined returns company email
    function getCurrentUserEmail() {
      let user = JSON.parse(localStorage.getItem("_ms-mem"));

      if (user) {
        return user.auth.email;
      } else {
        return document.querySelector('#company-email').value;
      }
    }

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
  
        /* for debugging
        console.log(items);
        alert(termInput.value);
        */
  
        const xhr = new XMLHttpRequest();
        const url = 'https://dev--create-new-items--sarimpro.autocode.dev/';    
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