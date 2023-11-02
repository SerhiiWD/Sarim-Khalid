// Confirm company preview
;(function() {
    document.addEventListener("DOMContentLoaded", () => {
      let confirmBtn2 = document.querySelector('#confirm-btn-2');
      let form2 = document.querySelector('.form__form-2');
      let formPreview1 = document.querySelector('.form__preview-1');
      let point21 = document.querySelector('.progress__point-2--1');
      let point31 = document.querySelector('.progress__point-3--1');
      let point12 = document.querySelector('.progress__point-1--2');
      let point22 = document.querySelector('.progress__point-2--2');
      let progressLine = document.querySelector('.form__progress-line');
      let poinText1 = document.querySelector('.progress__point-text-1');
      let poinText2 = document.querySelector('.progress__point-text-2');
      let submitCompanyForm = document.querySelector('.hidden-submit-btn--js');
      let userIdInput = document.querySelector('#user-id');
      
      confirmBtn2.addEventListener('click', () => {
        setUserId();

        formPreview1.style.display = 'none';
        form2.style.display = 'block';

        //submit form to save the information in webflow
        submitCompanyForm.click();
                
        point21.style.display = 'none';
        point31.style.display = 'block';
        point12.style.display = 'none';
        point22.style.display = 'block';
        
        poinText1.style.color = '#9c9c9c';
        poinText2.style.color = '#68e053';
        
        progressLine.style.width = '50%';
      })

      // get user ID from memberstuck and set it into input
      function setUserId() {
        let user = JSON.parse(localStorage.getItem("_ms-mem"));

        if (user) {
          userIdInput.value = user.id;
        }
      }
    })
})();