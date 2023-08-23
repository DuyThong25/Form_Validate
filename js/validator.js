function Validator (options) {
    let selectorRules = {}; // Dùng để chứa các rule của các selector
    // Hàm getParent để tìm lấy cha của thằng input sau đó truy cập đến message error
    function getParent (element, selector) {
        // Cách dùng vòng lập - While
        /*
        while (element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
        */
        // Cách dùng closest() -> hay hơn
         return element.closest(selector)
    }


    //Hàm xử lý validate 
    function validate (inputElement, rule) {
        // Lấy ra phần tử cha -> từ cha truy vấn xuống con
        // errorElement = getParent(inputElement, selector);
        let errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorMessage)
        let errorMessage;
        
        // Lập qua các rule của các inputElement khi click vào
        let rules = selectorRules[rule.selector];
        // Lập qua từng rule
        for(let i = 0; i < rules.length; i++) {
            switch(inputElement.type) {
                case 'checkbox':
                case 'radio':
                    errorMessage  = rules[i](
                        formElement.querySelector(rule.selector + `:checked`)                   
                    );
                  break;
                default:
                    errorMessage  = rules[i](inputElement.value); 
            }; 
            if(errorMessage) {break;}
        }
        
        if(errorMessage != undefined) { // Khi sai
            getParent(inputElement, options.formGroup).classList.add('invalid')
            errorElement.innerHTML = errorMessage
        }
        else {
            getParent(inputElement, options.formGroup).classList.remove('invalid')
            errorElement.innerHTML = ''
        }
        return !errorMessage; // Thêm toán tử (!) để xác định true hay false
    }

    const formElement = document.querySelector(options.form);
    if(formElement) {
        
        // xử lý formsubmit 
        formElement.onsubmit = function (e) {
            e.preventDefault();
            let isFormValid = true;

            options.rules.forEach(function (rule) {
                let inputElements = formElement.querySelectorAll(rule.selector);
                Array.from(inputElements).forEach(function (inputElement) {
                    let isValid = validate(inputElement, rule);              
                    if (!isValid) {
                        isFormValid = false;
                        return; // Break khi có 1 phần tử = false
                    }
                });
                if (!isFormValid) {
                    return; // Ngừng kiểm tra các rule còn lại nếu đã biết có 1 rule sai 
                }
            });

            if(isFormValid) { 
               // Trường hợp xử lý submit bằng JavaScript
                if(typeof options.submitForm === 'function') {       
                    let enableInput = document.querySelectorAll(`[name]:not([disabled])`); // Đây là một Node List 

                    let formValue = Array.from(enableInput).reduce(function (values, input) {
                      // chuyển thành Array
                      // values[input.name] = input.value;
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

                    options.submitForm(formValue);
                }
                // Trường hợp submit bằng HTML 
                else {
                    // console.log(typeof options.submit)
                }
            }
        }
        // Xử lý các rule và handle các event
         options.rules.forEach(function (rule) {
            
            let inputElements = formElement.querySelectorAll(rule.selector);
          
            if(Array.isArray(selectorRules[rule.selector])) {
                // Nếu key có value là một array -> có tồn tại 1 rule rồi -> thì push rule mới vào
                 selectorRules[rule.selector].push(rule.test);
            } else {
                // Nếu key có value rỗng -> nghĩa là chưa có rule nào thì add rule đó vào mảng
                selectorRules[rule.selector] = [rule.test] 
            }
            // Lập qua cả các radio và checkbox
            Array.from(inputElements).forEach(function (inputElement) {
                //Nếu có element input thì handle value
                if(inputElement) {                
                    //Xử lý để tróng ô input
                    inputElement.onblur = function() {
                        validate(inputElement, rule);
                    }
                    //Xử lý check email
                    inputElement.oninput = function() {
                       if (inputElement.type === 'password') { 
                            validate(inputElement, rule);
                        }
                        else {
                            let errorElement = getParent(inputElement, options.formGroup).querySelector(options.errorMessage)
                            errorElement.innerHTML = '';
                            getParent(inputElement, options.formGroup).classList.remove('invalid')    
                        }
                    }
                    inputElement.onchange = function() { 
                        validate(inputElement, rule);
                    }
                }
            })
         })
        }
}

Validator.isRequired = function(selector, message = 'Không được để trống!' ) {
    return {
        selector: selector,
        test: function(value) {
            var regex = /^\s*$/; // Nếu trong chuỗi chỉ toàn khoảng trắng
            // Nếu value bị regex hoặc type của value là undefined hoặc value bằng null
            if (regex.test(value) || (typeof value === 'undefined' || value === null)) {
                return message
            }
            else{          
                return undefined
            }
        }
    };
}

Validator.isEmail = function(selector, message = 'Vui lòng nhập đúng email') {
    return  {
        selector: selector,
        validationType: 'email', // Loại kiểm tra là email
        isEmailError: true, // Email có bị lỗi không ?
        test: function(value) {
            var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if(regex.test(value)) {
                this.isEmailError = false; // Không sai
                return undefined;
            }
            else {
                this.isEmailError = true;
                return message;
            }
        } 
    };   
}

Validator.minLength = function(selector, length, message = `Giá trị nhập vào phải lớn hơn ${length - 1} kí tự`) {
    return  {
        selector: selector,
        validationType: 'minLength', // Loại kiểm tra là email
        isMinLength: true,
        test: function(value) {
            if(value.length >= length) {
                this.isMinLength = false; // không sai 
                return undefined;
            }
            else {
                this.isMinLength = true;
                return message;
            }
        } 
    };   
}

Validator.isConfirmed = function (selector, getConfirmValue, message = 'Giá trị nhập vào không chính xác') {
    return {
        selector : selector,
        test: function(value) {
            let getValue = document.querySelector(`${getConfirmValue()}`).value;
            // let getValue = document.querySelector(``)
            return value === getValue ? undefined : message
        }
    }
}