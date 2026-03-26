document.addEventListener("DOMContentLoaded", function(){
    const btnLearnMore = document.getElementById("btnLearnMore");
    if(btnLearnMore){
        btnLearnMore.addEventListener("click", function(){
            window.location.href = "./bo-loc.html";
        })
    }
})