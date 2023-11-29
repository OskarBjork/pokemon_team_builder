let foo = document.querySelector(".lol");
// alert(foo);

const dropDiv = document.querySelector(".dropdown");
const dropBtn = document.querySelector(".dropbtn");
const dropDownContentDiv = document.querySelector(".dropdown-content");
const dropDownContents = dropDownContentDiv.childNodes;

// console.log(dropDownContents);
// console.log(dropBtn);

function changeDropDownContents(dropDownContents) {
  dropDownContents.forEach(function (link) {
    console.log(link);
  });
}

changeDropDownContents(dropDownContents);

// Event Listeners

dropBtn.addEventListener("click", function () {
  dropDownContentDiv.classList.toggle("hidden");
  // dropDownContentDiv.style.display = "block";
  // console.log(dropDownContentDiv.classList);
});

// dropBtn.addEventListener("");

for (let i = 0; i < dropDownContents.length; i++) {
  dropDownContents[i].addEventListener("mouseover", function () {
    dropDownContents[i].classList.add("hovered");
  });
  dropDownContents[i].addEventListener("mouseout", function () {
    dropDownContents[i].classList.remove("hovered");
  });
}
