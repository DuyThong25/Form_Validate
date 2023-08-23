
function Validator (formSelector) {
    const formElement = document.querySelector(formSelector);
    const formRules = {};
    let _this = this;

    // Hàm tìm thẻ div cha 
    function getParent (element, selector) {
         return element.closest(selector)
    }


    /** Quy ước tạo Rule
     *   - Nếu có lỗi thì return error Message
     *   - Nếu đúng thì return undefined
     */
    let validatorRules = {
        required: function(message = 'Vui lòng không để trống') {
                return function(value) {
                    let regex = /^\s*$/; // Nếu trong chuỗi chỉ toàn khoảng trắng

                    // Nếu value bị regex hoặc type của value là undefined hoặc value bằng null 
                    //--> fix bug chổ error message của radio buttion
                    if (regex.test(value) || (typeof value === 'undefined' || value === null)) {
                        return message
                    }
                    else{          
                        return undefined
                    }
                }
        },
        email:  function(message = 'Vui lòng nhập đúng email') {
                return function(value) {
                        let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                        return regex.test(value) ? undefined :  message.replace(/'/g, '')
                    }
        },
        min: function(min = 1, message = `Vui lòng nhập ít nhất ${min} kí tự`) {
            return function(value) {
                return value.length >= min ? undefined : message.replace(/'/g, '')
            }
        },
        max: function(max, message = `Vui lòng nhập tối đa ${max} kí tự`) {
            return function(value) {
                return value.length <= max ? undefined : message.replace(/'/g, '');
            }
        },
        confirmed: function(selector, message = 'Giá trị nhập vào không trùng khớp') {
            return function(value) { 
                return value === document.querySelector(selector).value ? undefined : message.replace(/'/g, '');
            }
        }
    }

    if(formElement) {
        const inputs = formElement.querySelectorAll('[name][rules]'); // Lấy ra atribute name và rules

        for(let input of inputs) { 
            let rules = input.getAttribute('rules').split('|');

            for(let rule of rules) { 
                let isRuleHasValue = rule.includes(':');
                let ruleFunc = validatorRules[rule];
                let isRuleHasMessage = rule.includes(',');
                let ruleInfo, ruleName, ruleValue, ruleMessage, ruleValueInfo

                if(isRuleHasValue && !isRuleHasMessage) {
                    ruleInfo = rule.split(':');
                    ruleName = ruleInfo[0]
                    ruleValue = ruleInfo[1].split(',')[0];
                    ruleMessage = ruleInfo[1].split(',')[1]

                    rule = ruleName;
                    ruleFunc = validatorRules[rule](ruleValue, ruleMessage);
                }
                else if(!isRuleHasValue && isRuleHasMessage ) {
                    ruleInfo = rule.split(',');
                    ruleName = ruleInfo[0]
                    ruleMessage = ruleInfo[1];

                    rule = ruleName;
                    ruleFunc = validatorRules[rule](ruleMessage);
                    // console.log(rule);
                }
                else{
                    ruleInfo = rule.split(','); 
                    ruleValueInfo = ruleInfo[0].split(':');

                    if(ruleValueInfo.length > 1) { //  VD: ['min', '6'] --> Length > 1
                        ruleValue = ruleValueInfo[1]; // 
                    }
                    if(ruleInfo.length > 1) {
                        ruleMessage = ruleInfo[1]; 
                    }
                    ruleName = ruleValueInfo[0];
                                        
                    rule = ruleName;
                    ruleFunc = validatorRules[rule](ruleValue, ruleMessage);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                } else {
                    formRules[input.name] = [ruleFunc];
                }
                
            }
             // Xử lý các sự kiện tương tác của người dùng 

            input.onblur = HandleValidate;

            input.onchange = HandleValidate;

            input.oninput = handleClearErrorPasswordOnInput;

        }

        // Hàm Handle Event 
        function HandleValidate(event) {
            let rules = formRules[event.target.name];
            let errorElement = getParent(event.target, '.form-group').querySelector('.form-message')
            let errorMessage;
            for ( let rule of rules ) { 
                switch (event.target.type) {
                    case 'radio':
                    case 'checkbox':
                        // Khi chưa có cái nào được checked thì giá trị truyền vào hàm rule là null
                        errorMessage = rule(formElement.querySelector(`input[name="${event.target.name}"][rules]:checked`));
                        break
                    default:
                        errorMessage = rule(event.target.value)
                }

                if(errorMessage) break;
            }
            
            if(errorMessage) { 
                getParent(event.target, '.form-group').classList.add('invalid');
                errorElement.innerHTML = errorMessage;
            }
            else {
                getParent(event.target, '.form-group').classList.remove('invalid');
                errorElement.innerHTML = '';
            }
            return !errorMessage; // Convert sang boolean
        }
       
        function handleClearErrorPasswordOnInput (event) {
            if(event.target.type === 'password') {
                HandleValidate(event)
            }
            else {
                let errorElement = getParent(event.target, '.form-group').querySelector('.form-message')
                getParent(event.target, '.form-group').classList.remove('invalid');
                errorElement.innerHTML = '';              
            }
        }

        // Xử lý Submit form 
        // formElement.onsubmit = function(event) { 
            formElement.onsubmit = (event) => { // viết kiểu ES6 thì không cần _this nữa mà thay bằng this luôn
            event.preventDefault();
            let isFormValid = true;

            for(let input of inputs) { 
                // Bằng với event.target.name 
                // => định nghĩa target là input xong từ input truy cập vào thằng name
                let isValid = HandleValidate({target: input}); 
                if (!isValid) {
                    isFormValid = false;
                }   
         
            } 

            if (isFormValid) {
                if (typeof this.submitForm === 'function') {
                    let enableInput = document.querySelectorAll(`[name]:not([disabled])`); // Đây là một Node List 
                    let formValue = Array.from(enableInput).reduce(function (values, input) {
                      // chuyển thành Array
                      switch (input.type) {
                        case "checkbox":
                          if (input.checked) {
                            if (!Array.isArray(values[input.name])) {
                              values[input.name] = []; // Tạo mảng để lưu nhiều giá trị check box
                            }
                            values[input.name].push(input.value);
                          }
                          break;

                        case "radio":
                          if (input.checked) {
                            values[input.name] = input.value;
                          }
                          break;

                        case "file":
                            values[input.name] = input.files;
                          break;
                        default:
                          values[input.name] = input.value;
                      }
                      return values;
                    }, {}) // Khởi tạo {} và trả về {data} của các input 

                    this.submitForm(formValue);
                    alert('Đăng ký thành công');
                }
                else {
                    formElement.submit();
                }
            }
        }
    }
}
