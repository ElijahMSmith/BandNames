/*
CONTENT SCRIPT WHEN COPY BUTTON CLICKED: COPY NAME, CLICK THESE TWO BUTTONS IN SUCCESSION

//Settings button
<button aria-label="User Settings" type="button" class="button-14-BFJ enabled-2cQ-u7 button-38aScr lookBlank-3eh9lL colorBrand-3pXr91 grow-q77ONN"><div class="contents-18-Yxp"><svg aria-hidden="false" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M19.738 10H22V14H19.739C19.498 14.931 19.1 15.798 18.565 16.564L20 18L18 20L16.565 18.564C15.797 19.099 14.932 19.498 14 19.738V22H10V19.738C9.069 19.498 8.203 19.099 7.436 18.564L6 20L4 18L5.436 16.564C4.901 15.799 4.502 14.932 4.262 14H2V10H4.262C4.502 9.068 4.9 8.202 5.436 7.436L4 6L6 4L7.436 5.436C8.202 4.9 9.068 4.502 10 4.262V2H14V4.261C14.932 4.502 15.797 4.9 16.565 5.435L18 3.999L20 5.999L18.564 7.436C19.099 8.202 19.498 9.069 19.738 10ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z"></path></svg></div></button>

//Edit username button
<button type="button" class="fieldButton-27bJrp button-38aScr lookFilled-1Gx00P colorGrey-2DXtkV sizeSmall-2cSMqn grow-q77ONN"><div class="contents-18-Yxp">Edit</div></button>

//Can't find access to discord popup yet.*/

var settingsButton = document.querySelector('[aria-label="User Settings"]');
console.log(settingsButton);
settingsButton.click();
var editButton = document.getElementsByClassName('fieldButton-27bJrp button-38aScr lookFilled-1Gx00P colorGrey-2DXtkV sizeSmall-2cSMqn grow-q77ONN')[0];
console.log(editButton);
editButton.click();


//Username input
//<input class="inputDefault-_djjkz input-cIJ7To multiInputField-3K361B" name="username" aria-label="Username" type="text" placeholder="" maxlength="999" value="Trashy Construction"></input>

//Password input
//<input class="inputDefault-_djjkz input-cIJ7To" type="password" name="" placeholder="" maxlength="999" value=""></input>

//Done/Submit button
//<button type="submit" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"></button>

var usernameInput = document.querySelector('[aria-label="Username"]');
var passwordInput = document.querySelector('[type="password"]');
var submitButton = document.querySelector('[type="submit"]');
console.log(usernameInput);

function updateUsername(){
    usernameInput.focus();
    usernameInput.value = "New Username!";
}

function updatePassword(){
    passwordInput.focus();
    passwordInput.value = "not";
}

function clickSubmit(){
    submitButton.click();
}

setTimeout(updateUsername, 500);
setTimeout(updatePassword, 750);
setTimeout(clickSubmit, 1000);


//SEEMS LIKE DISCORD HAS SOME ANTI-BOT MEASURES TO NOT ALLOW USERNAME CHANGES AND SUCH.
//MAY NEED TO READJUST SCOPE OF THIS PROJECT