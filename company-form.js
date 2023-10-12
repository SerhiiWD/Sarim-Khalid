// Confirm company form
;(function() {
document.addEventListener("DOMContentLoaded", () => {
  let confirmBtn1 = document.querySelector('#confirm-btn-1');
  let form1 = document.querySelector('.form__form-1');
  let formPreview1 = document.querySelector('.form__preview-1');
  
  let companyName = document.querySelector('.form__preview-company'); 
  let companyEmail = document.querySelector('.form__preview-email');
  let companyWebsite = document.querySelector('.form__preview-website');
  let companyDescription = document.querySelector('.form__preview-text');
  
  let companyNameInput = document.querySelector('#company-name');
  let companyEmailInput = document.querySelector('#company-email');
  let companyWebsiteInput = document.querySelector('#company-website');
  let companyDescriptionInput = document.querySelector('#company-description');
  let logoInput = document.querySelector('#company-img');
  
  let companyNameHint = document.querySelector('.form__hint--company-name'); 
  let companyEmailHint = document.querySelector('.form__hint--company-email');
  let companyWebsiteHint = document.querySelector('.form__hint--company-website');
  let companyDescriptionHint = document.querySelector('.form__hint--company-description');
  let logoHint = document.querySelector('.form__hint--logo');
  
  confirmBtn1.addEventListener('click', () => {    
  	if (!valideteForm1()) return;
  
    companyName.innerText = companyNameInput.value;
    companyEmail.innerText = companyEmailInput.value;
    companyWebsite.innerText = companyWebsiteInput.value;
    companyDescription.innerText = companyDescriptionInput.value;
    
    form1.style.display = 'none';
    formPreview1.style.display = 'block';
  })
  
  function valideteForm1() {
   	let flag = true;
    
   	if (companyNameInput.value === '') {
    	companyNameHint.style.display = 'block';
    	flag = false;
    } else {
    	companyNameHint.style.display = 'none';
    }
    
    if (companyEmailInput.value !== '' && companyEmailInput.value.includes('@')) {
    	companyEmailHint.style.display = 'none';
    } else {
    	companyEmailHint.style.display = 'block';
    	flag = false;
    	
    }
    
    if (companyWebsiteInput.value === '') {
    	companyWebsiteHint.style.display = 'block';
    	flag = false;
    } else {
    	companyWebsiteHint.style.display = 'none';
    }
    
    if (companyDescriptionInput.value === '') {
    	companyDescriptionHint.style.display = 'block';
    	flag = false;
    } else {
    	companyDescriptionHint.style.display = 'none';
    }
      
    /*if (logoInput.files.length === 0) {
     logoHint.style.display = 'block';
     flag = false;
    } else {
    	logoHint.style.display = 'none';
    }*/
      
    return flag;
  }    
})
})();



// Edit company form
;(function() {
document.addEventListener("DOMContentLoaded", () => {
  let editBtn2 = document.querySelector('#edit-btn-2');
  let form1 = document.querySelector('.form__form-1');
  let formPreview1 = document.querySelector('.form__preview-1');
  
  editBtn2.addEventListener('click', () => {
  	formPreview1.style.display = 'none';
    form1.style.display = 'block';    
  })
})
})();