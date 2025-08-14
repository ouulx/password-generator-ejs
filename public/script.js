document.addEventListener("DOMContentLoaded", function () {
  console.log("JavaScript loaded!");

  //add some interactive behavior
  const buttons = document.querySelectorAll('button');
  buttons.forEach(btn => {
   btn.addEventListener('click', function() {
    console.log('Button clicked!');
   });
  });
});
