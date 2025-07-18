function validateForm(){
    let name = document.querySelector('input[placeholder="Your Name"]').value.trim();
    let email = document.querySelector('input[placeholder="Your Email"]').value.trim();
    let number = document.querySelector('input[placeholder="Your Mobile Number"]').value.trim();
    let feedback = document.querySelector('textarea[placeholder="Your feedback..."]').value.trim();

    if(name === '' || email === '' || feedback === ''){
        alert("Please fill all required fields!")
        return false;
    }
    if(number.length != 10 || number[0] == 1 || number[0] == 2 || number[0] == 3 || number[0] == 4 || number[0] == 5 || number[0] == 0){
        alert("Please enter a valid mobile number.");
        return false;
    }
    return true;
}